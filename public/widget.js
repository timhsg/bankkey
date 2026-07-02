/*!
 * BankKey — Widget de capture de leads (bulle flottante embarquable)
 *
 * Intégration en UNE ligne, sur n'importe quel site / CMS / app :
 *   <script src="https://bankkey.ch/widget.js" data-key="ik_XXXX" defer></script>
 *
 * Options (attributs data-*) :
 *   data-key       (requis)  clé d'ingestion du cabinet (ik_...)
 *   data-title     (option)  libellé du bouton flottant
 *   data-color     (option)  couleur d'accent (hex 6 chiffres) pour s'accorder
 *                            au site du courtier. Sans cette option, le widget
 *                            utilise le dégradé de marque BankKey.
 *   data-position  (option)  "right" (défaut) ou "left"
 *
 * API JavaScript (pour préremplir / ouvrir automatiquement) :
 *   BankKey.open()                          ouvre le panneau
 *   BankKey.close()                         ferme
 *   BankKey.toggle()                        bascule
 *   BankKey.prefill({ firstName, lastName, email, phone, projet, price,
 *                     down_payment, message })
 *                                           pré-remplit les champs connus d'un lead
 *
 * Le formulaire poste vers /api/ingest/<clé> (même origine que le script) et joint
 * automatiquement le contexte (URL de la page, titre, référent, paramètres UTM).
 * Anti-spam : champ honeypot + délai minimal avant envoi (silencieux pour les bots).
 * Styles isolés via Shadow DOM : le widget ne casse jamais le design du site hôte.
 */
(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var all = document.getElementsByTagName('script');
    for (var i = all.length - 1; i >= 0; i--) {
      if (all[i].src && all[i].src.indexOf('widget.js') !== -1) return all[i];
    }
    return null;
  })();
  if (!script) return;
  if (window.__bankkeyWidgetLoaded) return;
  window.__bankkeyWidgetLoaded = true;

  var KEY = script.getAttribute('data-key') || '';
  if (!KEY) { console.error('[BankKey] data-key manquant sur le script du widget.'); return; }

  var ORIGIN = (function () { try { return new URL(script.src).origin; } catch (e) { return 'https://bankkey.ch'; } })();
  var ENDPOINT = ORIGIN + '/api/ingest/' + KEY;
  var POSITION = script.getAttribute('data-position') === 'left' ? 'left' : 'right';
  var TITLE    = script.getAttribute('data-title') || 'Estimer mon financement';

  // ── Couleurs de marque BankKey (défaut) ou accent custom du courtier ────
  var BRAND_NAVY   = '#0A1F5C';
  var BRAND_ACCENT = '#3b5fe0';
  var BRAND_GRAD   = 'linear-gradient(135deg,' + BRAND_NAVY + ' 0%,' + BRAND_ACCENT + ' 100%)';
  var CUSTOM = script.getAttribute('data-color') || '';
  var FILL   = CUSTOM || BRAND_GRAD;          // fond bouton + entête
  var RING   = CUSTOM || BRAND_ACCENT;        // focus ring + liens

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Clé BankKey (glyphe officiel du LogoMark, viewBox 32)
  function keyIcon(size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12.5" cy="13" r="4.3"/>' +
      '<path d="M15.4 16.1 23 23"/><path d="M20.4 20l2.2-2.2"/><path d="M23 22.6l2-2"/>' +
      '<circle cx="12.5" cy="13" r="1.5" fill="currentColor" stroke="none"/></svg>';
  }

  // Contexte capté automatiquement à chaque envoi (source du lead).
  function autoContext() {
    var ctx = { page_url: location.href, page_title: document.title, referrer: document.referrer || '' };
    try {
      var qs = new URLSearchParams(location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
        var v = qs.get(k); if (v) ctx[k] = v;
      });
    } catch (e) { /* noop */ }
    return ctx;
  }

  // ── Conteneur isolé (Shadow DOM) ───────────────────────────────────────
  var host = document.createElement('div');
  document.body.appendChild(host);
  var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;

  var style = document.createElement('style');
  style.textContent = [
    ':host{ all: initial; }',
    '*{ box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }',
    '.bk-launch{ position:fixed; bottom:20px; ' + POSITION + ':20px; z-index:2147483000;',
    '  display:inline-flex; align-items:center; gap:9px; border:none; cursor:pointer;',
    '  background:' + FILL + '; color:#fff; font-size:14px; font-weight:600;',
    '  padding:12px 18px; border-radius:999px; box-shadow:0 10px 34px rgba(10,31,92,.28);',
    '  transition:transform .18s cubic-bezier(.16,1,.3,1), box-shadow .18s ease, opacity .15s ease; }',
    '.bk-launch:hover{ transform:translateY(-2px); box-shadow:0 16px 40px rgba(10,31,92,.34); }',
    '.bk-launch svg{ width:18px; height:18px; }',
    '.bk-panel{ position:fixed; bottom:20px; ' + POSITION + ':20px; z-index:2147483000;',
    '  width:352px; max-width:calc(100vw - 32px); background:#fff; border-radius:18px;',
    '  box-shadow:0 28px 80px rgba(10,31,92,.30); overflow:hidden;',
    '  transform-origin:bottom ' + POSITION + '; opacity:0; transform:translateY(14px) scale(.98);',
    '  pointer-events:none; transition:opacity .2s ease, transform .22s cubic-bezier(.16,1,.3,1); }',
    '.bk-panel.bk-open{ opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }',
    '@media (max-width: 480px){',
    '  .bk-panel{ left:0; right:0; bottom:0; width:100%; max-width:100%; border-radius:18px 18px 0 0;',
    '    max-height:92vh; overflow-y:auto; }',
    '}',
    '.bk-head{ background:' + FILL + '; color:#fff; padding:16px 18px; position:relative;',
    '  display:flex; align-items:flex-start; gap:11px; }',
    '.bk-mark{ width:34px; height:34px; border-radius:9px; background:rgba(255,255,255,.14);',
    '  border:1px solid rgba(255,255,255,.22); display:flex; align-items:center; justify-content:center; flex:none; }',
    '.bk-mark svg{ width:20px; height:20px; }',
    '.bk-head h3{ margin:0; font-size:15px; font-weight:700; letter-spacing:-.01em; }',
    '.bk-head p{ margin:4px 0 0; font-size:12px; opacity:.85; line-height:1.45; padding-right:20px; }',
    '.bk-close{ position:absolute; top:12px; right:12px; background:transparent; border:none;',
    '  color:#fff; cursor:pointer; opacity:.8; padding:4px; line-height:0; border-radius:6px; }',
    '.bk-close:hover{ opacity:1; background:rgba(255,255,255,.12); }',
    '.bk-body{ padding:16px 18px 18px; }',
    '.bk-field{ margin-bottom:11px; }',
    '.bk-field label{ display:block; font-size:11px; font-weight:600; color:#374151; margin-bottom:5px; }',
    '.bk-field input,.bk-field select,.bk-field textarea{ width:100%; border:1px solid #d8dce3;',
    '  border-radius:10px; padding:10px 12px; font-size:14px; color:#0a0f1e; outline:none; background:#fff;',
    '  transition:border-color .12s ease, box-shadow .12s ease; }',
    '.bk-field textarea{ resize:none; }',
    '.bk-field input:focus,.bk-field select:focus,.bk-field textarea:focus{ border-color:' + RING + '; box-shadow:0 0 0 3px ' + RING + '22; }',
    '.bk-row{ display:flex; gap:9px; }',
    '.bk-row .bk-field{ flex:1; }',
    '.bk-hp{ position:absolute !important; left:-5000px !important; top:-5000px !important;',
    '  width:1px; height:1px; opacity:0; pointer-events:none; }',
    '.bk-submit{ width:100%; border:none; cursor:pointer; background:' + FILL + '; color:#fff;',
    '  font-size:14px; font-weight:700; padding:12px; border-radius:11px; margin-top:5px;',
    '  transition:filter .12s ease; }',
    '.bk-submit:hover{ filter:brightness(1.07); }',
    '.bk-submit:disabled{ opacity:.6; cursor:default; }',
    '.bk-note{ font-size:10px; color:#9ca3af; text-align:center; margin-top:11px; line-height:1.5; }',
    '.bk-brand{ text-decoration:none; font-weight:800; letter-spacing:-.02em; }',
    '.bk-brand b{ color:' + BRAND_NAVY + '; font-weight:800; }',
    '.bk-brand i{ color:' + BRAND_ACCENT + '; font-style:normal; font-weight:800; }',
    '.bk-ok{ text-align:center; padding:30px 18px 22px; }',
    '.bk-ok .bk-check{ width:48px; height:48px; border-radius:50%; background:#ecfdf5; color:#059669;',
    '  display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }',
    '.bk-ok h3{ margin:0 0 6px; font-size:17px; color:#0a0f1e; }',
    '.bk-ok p{ margin:0; font-size:13px; color:#6b7280; line-height:1.55; }',
    '.bk-err{ font-size:12px; color:#b91c1c; background:#fef2f2; border:1px solid #fecaca; border-radius:9px; padding:9px 11px; margin-bottom:11px; display:none; }'
  ].join('');
  root.appendChild(style);

  var launch = document.createElement('button');
  launch.className = 'bk-launch';
  launch.type = 'button';
  launch.setAttribute('aria-label', TITLE);
  launch.innerHTML = keyIcon(18) + '<span>' + esc(TITLE) + '</span>';
  root.appendChild(launch);

  var panel = document.createElement('div');
  panel.className = 'bk-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-label', 'Formulaire de demande de financement');
  panel.innerHTML =
    '<div class="bk-head">' +
      '<span class="bk-mark">' + keyIcon(20) + '</span>' +
      '<div>' +
        '<h3>Parlons de votre projet</h3>' +
        '<p>Laissez vos coordonnées, votre courtier vous rappelle avec une première estimation.</p>' +
      '</div>' +
      '<button class="bk-close" type="button" aria-label="Fermer">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="bk-body">' +
      '<div class="bk-err" id="bk-err"></div>' +
      '<form id="bk-form">' +
        // Honeypot anti-bots : un humain ne voit jamais ce champ.
        '<input class="bk-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<div class="bk-row">' +
          '<div class="bk-field"><label>Prénom</label><input name="firstName" autocomplete="given-name" maxlength="80" required></div>' +
          '<div class="bk-field"><label>Nom</label><input name="lastName" autocomplete="family-name" maxlength="80"></div>' +
        '</div>' +
        '<div class="bk-field"><label>Email</label><input type="email" name="email" autocomplete="email" maxlength="200" required></div>' +
        '<div class="bk-field"><label>Téléphone</label><input type="tel" name="phone" autocomplete="tel" maxlength="40" required></div>' +
        '<div class="bk-row">' +
          '<div class="bk-field"><label>Projet</label><select name="projet">' +
            '<option value="Achat">Achat</option>' +
            '<option value="Rachat de crédit">Rachat de crédit</option>' +
            '<option value="Renégociation">Renégociation</option>' +
            '<option value="Investissement locatif">Investissement locatif</option>' +
          '</select></div>' +
          '<div class="bk-field"><label>Budget</label><input name="price" inputmode="numeric" maxlength="12" placeholder="450000"></div>' +
        '</div>' +
        '<div class="bk-row">' +
          '<div class="bk-field"><label>Apport <span style="font-weight:400;color:#9ca3af">(optionnel)</span></label><input name="down_payment" inputmode="numeric" maxlength="12" placeholder="90000"></div>' +
        '</div>' +
        '<div class="bk-field"><label>Votre message (optionnel)</label><textarea name="message" rows="2" maxlength="2000" placeholder="Revenus, situation pro, ville du projet..."></textarea></div>' +
        '<button class="bk-submit" type="submit">Être rappelé rapidement</button>' +
        '<p class="bk-note">Transmis en sécurité via ' +
          '<a class="bk-brand" href="https://bankkey.ch/?utm_source=widget&utm_medium=powered-by" target="_blank" rel="noopener"><b>Bank</b><i>Key</i></a>' +
          ' · aucune donnée revendue.</p>' +
      '</form>' +
    '</div>';
  root.appendChild(panel);

  var form = panel.querySelector('#bk-form');
  var errBox = panel.querySelector('#bk-err');
  var body = panel.querySelector('.bk-body');
  var isOpen = false;
  var openedAt = 0;

  function open() {
    isOpen = true;
    openedAt = Date.now();
    panel.classList.add('bk-open');
    launch.style.opacity = '0'; launch.style.pointerEvents = 'none';
    var first = form && form.querySelector('input[name="firstName"]');
    if (first) setTimeout(function () { try { first.focus(); } catch (e) { /* noop */ } }, 230);
  }
  function close() {
    isOpen = false;
    panel.classList.remove('bk-open');
    launch.style.opacity = '1'; launch.style.pointerEvents = 'auto';
    try { launch.focus(); } catch (e) { /* noop */ }
  }
  function toggle() { isOpen ? close() : open(); }

  launch.addEventListener('click', toggle);
  panel.querySelector('.bk-close').addEventListener('click', close);
  // Toggle possible à tout moment aussi au clavier (Échap ferme).
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(); });

  // Préremplissage programmatique (ex. lead déjà identifié sur le site).
  function prefill(data) {
    if (!data || typeof data !== 'object' || !form) return;
    Object.keys(data).forEach(function (k) {
      if (k === 'website') return; // jamais le honeypot
      var el = form.querySelector('[name="' + k + '"]');
      if (el && data[k] != null) el.value = data[k];
    });
  }

  function showSuccess() {
    body.innerHTML =
      '<div class="bk-ok">' +
        '<div class="bk-check"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
        '<h3>Merci !</h3>' +
        '<p>Votre demande est transmise. Votre courtier vous recontacte très vite.</p>' +
        '<p class="bk-note">Transmis en sécurité via ' +
          '<a class="bk-brand" href="https://bankkey.ch/?utm_source=widget&utm_medium=powered-by" target="_blank" rel="noopener"><b>Bank</b><i>Key</i></a>' +
        '</p>' +
      '</div>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errBox.style.display = 'none';
    var btn = form.querySelector('.bk-submit');

    // Anti-spam : honeypot rempli ou envoi < 2 s après ouverture = bot probable.
    // On affiche le succès sans rien envoyer (ne pas éduquer les bots).
    var hp = form.querySelector('input[name="website"]');
    if ((hp && hp.value) || (Date.now() - openedAt < 2000)) { showSuccess(); return; }

    btn.disabled = true; btn.textContent = 'Envoi...';

    var data = autoContext();
    new FormData(form).forEach(function (v, k) { if (k !== 'website' && v) data[k] = v; });
    data.message = (data.projet ? '[' + data.projet + '] ' : '') + (data.message || '');
    data.source = 'embed-widget';
    data._source = 'embed-widget';

    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.ok ? r.json() : r.json().then(function (j) { throw new Error(j.error || 'Erreur'); }); })
      .then(showSuccess)
      .catch(function (err) {
        errBox.textContent = (err && err.message) ? err.message : 'Une erreur est survenue, réessayez.';
        errBox.style.display = 'block';
        btn.disabled = false; btn.textContent = 'Être rappelé rapidement';
      });
  });

  // API publique
  window.BankKey = { open: open, close: close, toggle: toggle, prefill: prefill };
})();
