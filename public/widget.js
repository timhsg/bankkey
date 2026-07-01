/*!
 * BankKey — Widget de capture de leads (bulle flottante embarquable)
 *
 * Intégration en UNE ligne sur n'importe quel site / CMS / app :
 *   <script src="https://bankkey.ch/widget.js" data-key="ik_XXXX" defer></script>
 *
 * Options (attributs data-*) :
 *   data-key       (requis)  clé d'ingestion du cabinet (ik_...)
 *   data-title     (option)  libellé du bouton flottant
 *   data-color     (option)  couleur d'accent (hex), défaut #1e3a8a
 *   data-position  (option)  "right" (défaut) ou "left"
 *
 * Le formulaire poste vers /api/ingest/<clé> (même origine que le script).
 * BankKey qualifie et score le lead en tâche de fond ; le courtier le voit
 * apparaître dans son tableau de bord. Styles isolés via Shadow DOM.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) {
    var all = document.getElementsByTagName('script');
    for (var i = all.length - 1; i >= 0; i--) {
      if (all[i].src && all[i].src.indexOf('widget.js') !== -1) { script = all[i]; break; }
    }
  }
  if (!script) return;

  var KEY = script.getAttribute('data-key') || '';
  if (!KEY) { console.error('[BankKey] data-key manquant sur le script du widget.'); return; }

  var ORIGIN = (function () {
    try { return new URL(script.src).origin; } catch (e) { return 'https://bankkey.ch'; }
  })();
  var ENDPOINT = ORIGIN + '/api/ingest/' + KEY;

  var ACCENT   = script.getAttribute('data-color') || '#1e3a8a';
  var TITLE    = script.getAttribute('data-title') || 'Estimer mon financement';
  var POSITION = script.getAttribute('data-position') === 'left' ? 'left' : 'right';

  if (window.__bankkeyWidgetLoaded) return;
  window.__bankkeyWidgetLoaded = true;

  // ── Conteneur isolé (Shadow DOM) ───────────────────────────────────────
  var host = document.createElement('div');
  host.setAttribute('aria-live', 'polite');
  document.body.appendChild(host);
  var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;

  var style = document.createElement('style');
  style.textContent = [
    ':host{ all: initial; }',
    '*{ box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }',
    '.bk-launch{ position:fixed; bottom:20px; ' + POSITION + ':20px; z-index:2147483000;',
    '  display:inline-flex; align-items:center; gap:8px; border:none; cursor:pointer;',
    '  background:' + ACCENT + '; color:#fff; font-size:14px; font-weight:600;',
    '  padding:12px 18px; border-radius:999px; box-shadow:0 8px 30px rgba(0,0,0,.18);',
    '  transition:transform .15s ease, box-shadow .15s ease; }',
    '.bk-launch:hover{ transform:translateY(-1px); box-shadow:0 12px 34px rgba(0,0,0,.24); }',
    '.bk-launch svg{ width:18px; height:18px; }',
    '.bk-panel{ position:fixed; bottom:20px; ' + POSITION + ':20px; z-index:2147483000;',
    '  width:340px; max-width:calc(100vw - 32px); background:#fff; border-radius:16px;',
    '  box-shadow:0 24px 70px rgba(10,31,92,.28); overflow:hidden; display:none; }',
    '.bk-panel.bk-open{ display:block; animation:bkUp .18s ease; }',
    '@keyframes bkUp{ from{ opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }',
    '.bk-head{ background:' + ACCENT + '; color:#fff; padding:16px 18px; position:relative; }',
    '.bk-head h3{ margin:0; font-size:15px; font-weight:700; }',
    '.bk-head p{ margin:4px 0 0; font-size:12px; opacity:.85; line-height:1.4; }',
    '.bk-close{ position:absolute; top:12px; ' + (POSITION === 'left' ? 'right' : 'right') + ':12px;',
    '  background:transparent; border:none; color:#fff; cursor:pointer; opacity:.8; padding:4px; }',
    '.bk-body{ padding:16px 18px 18px; }',
    '.bk-field{ margin-bottom:10px; }',
    '.bk-field label{ display:block; font-size:11px; font-weight:600; color:#374151; margin-bottom:4px; }',
    '.bk-field input,.bk-field select,.bk-field textarea{ width:100%; border:1px solid #d1d5db;',
    '  border-radius:9px; padding:9px 11px; font-size:14px; color:#0a0f1e; outline:none; background:#fff; }',
    '.bk-field input:focus,.bk-field select:focus,.bk-field textarea:focus{ border-color:' + ACCENT + '; box-shadow:0 0 0 3px ' + ACCENT + '22; }',
    '.bk-row{ display:flex; gap:8px; }',
    '.bk-row .bk-field{ flex:1; }',
    '.bk-submit{ width:100%; border:none; cursor:pointer; background:' + ACCENT + '; color:#fff;',
    '  font-size:14px; font-weight:700; padding:11px; border-radius:10px; margin-top:4px; }',
    '.bk-submit:disabled{ opacity:.6; cursor:default; }',
    '.bk-note{ font-size:10px; color:#9ca3af; text-align:center; margin-top:10px; line-height:1.4; }',
    '.bk-ok{ text-align:center; padding:26px 18px; }',
    '.bk-ok .bk-check{ width:46px; height:46px; border-radius:50%; background:#ecfdf5; color:#059669;',
    '  display:flex; align-items:center; justify-content:center; margin:0 auto 12px; }',
    '.bk-ok h3{ margin:0 0 6px; font-size:16px; color:#0a0f1e; }',
    '.bk-ok p{ margin:0; font-size:13px; color:#6b7280; line-height:1.5; }',
    '.bk-err{ font-size:12px; color:#b91c1c; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:8px 10px; margin-bottom:10px; display:none; }'
  ].join('');
  root.appendChild(style);

  // ── Bouton flottant ────────────────────────────────────────────────────
  var launch = document.createElement('button');
  launch.className = 'bk-launch';
  launch.type = 'button';
  launch.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18v14H3z"/><path d="m3 7 9 6 9-6"/></svg>' +
    '<span>' + esc(TITLE) + '</span>';
  root.appendChild(launch);

  // ── Panneau ────────────────────────────────────────────────────────────
  var panel = document.createElement('div');
  panel.className = 'bk-panel';
  panel.innerHTML =
    '<div class="bk-head">' +
      '<button class="bk-close" type="button" aria-label="Fermer">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>' +
      '<h3>Parlons de votre projet</h3>' +
      '<p>Laissez vos coordonnées, on vous rappelle avec une première estimation.</p>' +
    '</div>' +
    '<div class="bk-body">' +
      '<div class="bk-err" id="bk-err"></div>' +
      '<form id="bk-form">' +
        '<div class="bk-row">' +
          '<div class="bk-field"><label>Prénom</label><input name="firstName" required></div>' +
          '<div class="bk-field"><label>Nom</label><input name="lastName"></div>' +
        '</div>' +
        '<div class="bk-field"><label>Email</label><input type="email" name="email" required></div>' +
        '<div class="bk-field"><label>Téléphone</label><input type="tel" name="phone" required></div>' +
        '<div class="bk-row">' +
          '<div class="bk-field"><label>Projet</label><select name="projet">' +
            '<option value="Achat">Achat</option>' +
            '<option value="Rachat de crédit">Rachat de crédit</option>' +
            '<option value="Renégociation">Renégociation</option>' +
            '<option value="Investissement locatif">Investissement locatif</option>' +
          '</select></div>' +
          '<div class="bk-field"><label>Budget</label><input name="price" inputmode="numeric" placeholder="ex. 450000"></div>' +
        '</div>' +
        '<div class="bk-field"><label>Votre message (optionnel)</label><textarea name="message" rows="2" placeholder="Revenus, apport, situation pro…"></textarea></div>' +
        '<button class="bk-submit" type="submit">Être rappelé rapidement</button>' +
        '<p class="bk-note">Vos données sont transmises à votre courtier via BankKey. Aucune donnée revendue.</p>' +
      '</form>' +
    '</div>';
  root.appendChild(panel);

  var form = panel.querySelector('#bk-form');
  var errBox = panel.querySelector('#bk-err');
  var body = panel.querySelector('.bk-body');

  function open() { panel.classList.add('bk-open'); launch.style.display = 'none'; }
  function close() { panel.classList.remove('bk-open'); launch.style.display = ''; }

  launch.addEventListener('click', open);
  panel.querySelector('.bk-close').addEventListener('click', close);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errBox.style.display = 'none';
    var btn = form.querySelector('.bk-submit');
    btn.disabled = true; btn.textContent = 'Envoi…';

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    // Fusionne le type de projet dans le message pour la qualification.
    data.message = (data.projet ? '[' + data.projet + '] ' : '') + (data.message || '');
    data.source = 'embed-widget';
    data.page_url = location.href;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.ok ? r.json() : r.json().then(function (j) { throw new Error(j.error || 'Erreur'); }); })
      .then(function () {
        body.innerHTML =
          '<div class="bk-ok">' +
            '<div class="bk-check"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
            '<h3>Merci !</h3>' +
            '<p>Votre demande est bien transmise. Votre courtier vous recontacte très vite.</p>' +
          '</div>';
      })
      .catch(function (err) {
        errBox.textContent = (err && err.message) ? err.message : 'Une erreur est survenue, réessayez.';
        errBox.style.display = 'block';
        btn.disabled = false; btn.textContent = 'Être rappelé rapidement';
      });
  });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
})();
