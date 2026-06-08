/*!
 * BankKey Lead Capture Widget — embed.js
 *
 * Usage :
 *   <script src="https://bankkey.ch/embed.js" data-key="ik_xxxx"></script>
 *
 * Options (data-attributes) :
 *   data-key       : Clé d'ingestion BankKey (obligatoire)
 *   data-position  : 'bottom-right' (défaut) | 'inline' | 'center'
 *   data-button-label : Texte du bouton (défaut: 'Demande de financement')
 *   data-primary   : Couleur primaire (défaut: '#0f172a')
 *   data-title     : Titre du formulaire (défaut: 'Demande de courtage crédit')
 *
 * Le widget est complètement autonome (pas de dépendance externe).
 */
(function() {
  'use strict';

  // ── Récupération de la config ────────────────────────────────────
  var scripts = document.getElementsByTagName('script');
  var currentScript = null;
  for (var i = scripts.length - 1; i >= 0; i--) {
    if (scripts[i].src && scripts[i].src.indexOf('embed.js') !== -1) {
      currentScript = scripts[i];
      break;
    }
  }
  if (!currentScript) return;

  var KEY = currentScript.getAttribute('data-key');
  if (!KEY) {
    console.error('[BankKey] Missing data-key attribute on embed.js');
    return;
  }

  var POSITION = currentScript.getAttribute('data-position') || 'bottom-right';
  var BUTTON_LABEL = currentScript.getAttribute('data-button-label') || 'Demande de financement';
  var PRIMARY = currentScript.getAttribute('data-primary') || '#0f172a';
  var TITLE = currentScript.getAttribute('data-title') || 'Demande de courtage crédit';
  var BASE_URL = currentScript.src.replace(/\/embed\.js.*$/, '');

  // ── Styles inline (pas de CSS externe) ───────────────────────────
  var STYLES = '' +
    '.bk-widget-fab{position:fixed;bottom:24px;right:24px;background:' + PRIMARY + ';color:#fff;padding:14px 20px;border-radius:999px;box-shadow:0 10px 30px rgba(15,23,42,0.2);font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-weight:600;font-size:14px;cursor:pointer;border:0;z-index:999998;transition:transform 0.2s;display:flex;align-items:center;gap:8px}' +
    '.bk-widget-fab:hover{transform:translateY(-2px)}' +
    '.bk-widget-fab svg{width:18px;height:18px}' +
    '.bk-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.5);backdrop-filter:blur(4px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;animation:bkFadeIn 0.2s}' +
    '@keyframes bkFadeIn{from{opacity:0}to{opacity:1}}' +
    '@keyframes bkSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}' +
    '.bk-modal{background:#fff;border-radius:16px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(15,23,42,0.3);font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#0f172a;animation:bkSlideUp 0.3s}' +
    '.bk-header{padding:24px 28px 0;display:flex;align-items:start;justify-content:space-between;gap:16px}' +
    '.bk-header h2{margin:0;font-size:20px;font-weight:600;letter-spacing:-0.3px;line-height:1.3}' +
    '.bk-header p{margin:6px 0 0 0;font-size:13px;color:#64748b;line-height:1.5}' +
    '.bk-close{background:none;border:0;font-size:24px;color:#94a3b8;cursor:pointer;padding:0;line-height:1;width:30px;height:30px;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:background 0.2s}' +
    '.bk-close:hover{background:#f1f5f9;color:#0f172a}' +
    '.bk-form{padding:20px 28px 24px;display:flex;flex-direction:column;gap:14px}' +
    '.bk-field label{display:block;font-size:11px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px}' +
    '.bk-field input,.bk-field select,.bk-field textarea{width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:14px;font-family:inherit;color:#0f172a;background:#fff;box-sizing:border-box;transition:border-color 0.2s,box-shadow 0.2s}' +
    '.bk-field input:focus,.bk-field select:focus,.bk-field textarea:focus{outline:0;border-color:' + PRIMARY + ';box-shadow:0 0 0 3px ' + PRIMARY + '22}' +
    '.bk-field textarea{resize:vertical;min-height:80px;font-family:inherit}' +
    '.bk-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
    '.bk-submit{background:' + PRIMARY + ';color:#fff;border:0;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity 0.2s;margin-top:4px}' +
    '.bk-submit:hover{opacity:0.9}' +
    '.bk-submit:disabled{opacity:0.5;cursor:not-allowed}' +
    '.bk-success{background:#ecfdf5;border:1px solid #a7f3d0;color:#047857;padding:14px 28px;border-radius:0 0 16px 16px;font-size:13px}' +
    '.bk-error{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:14px 28px;border-radius:0 0 16px 16px;font-size:13px}' +
    '.bk-footer{padding:0 28px 20px;text-align:center;font-size:10px;color:#94a3b8}' +
    '.bk-footer a{color:#64748b;text-decoration:underline}';

  // ── Injection des styles ─────────────────────────────────────────
  var styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  // ── Bouton flottant ──────────────────────────────────────────────
  function createFab() {
    var btn = document.createElement('button');
    btn.className = 'bk-widget-fab';
    btn.setAttribute('type', 'button');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ' + BUTTON_LABEL;
    btn.onclick = openModal;
    document.body.appendChild(btn);
  }

  // ── Modal ────────────────────────────────────────────────────────
  var modalEl = null;

  function openModal() {
    if (modalEl) return;

    modalEl = document.createElement('div');
    modalEl.className = 'bk-overlay';
    modalEl.onclick = function(e) {
      if (e.target === modalEl) closeModal();
    };

    modalEl.innerHTML = '' +
      '<div class="bk-modal">' +
        '<div class="bk-header">' +
          '<div>' +
            '<h2>' + escapeHtml(TITLE) + '</h2>' +
            '<p>Décrivez votre projet, un courtier vous recontacte sous 24h.</p>' +
          '</div>' +
          '<button class="bk-close" type="button">&times;</button>' +
        '</div>' +
        '<form class="bk-form" id="bk-form">' +
          '<div class="bk-row">' +
            '<div class="bk-field"><label>Prénom</label><input name="firstName" required maxlength="80"></div>' +
            '<div class="bk-field"><label>Nom</label><input name="lastName" maxlength="80"></div>' +
          '</div>' +
          '<div class="bk-field"><label>Email *</label><input name="email" type="email" required maxlength="200"></div>' +
          '<div class="bk-field"><label>Téléphone</label><input name="phone" type="tel" maxlength="40"></div>' +
          '<div class="bk-field"><label>Ville / lieu du projet</label><input name="address" maxlength="200" placeholder="Lyon centre, Genève, Bordeaux..."></div>' +
          '<div class="bk-row">' +
            '<div class="bk-field"><label>Budget (€)</label><input name="price" type="number" min="0" placeholder="320000"></div>' +
            '<div class="bk-field"><label>Apport (€)</label><input name="down_payment" type="number" min="0" placeholder="50000"></div>' +
          '</div>' +
          '<div class="bk-field"><label>Situation professionnelle</label><select name="employment_status"><option value="">— Choisir —</option><option value="cdi">CDI</option><option value="fonctionnaire">Fonctionnaire</option><option value="cdd">CDD / Intérim</option><option value="independant">Indépendant</option><option value="retraite">Retraité(e)</option></select></div>' +
          '<div class="bk-field"><label>Votre demande</label><textarea name="message" maxlength="2000" placeholder="Décrivez brièvement votre projet (achat principal, investissement, refinancement...)"></textarea></div>' +
          '<button type="submit" class="bk-submit" id="bk-submit">Envoyer ma demande</button>' +
        '</form>' +
        '<div class="bk-footer">Propulsé par <a href="https://bankkey.ch" target="_blank" rel="noopener">BankKey</a></div>' +
      '</div>';

    document.body.appendChild(modalEl);
    document.body.style.overflow = 'hidden';

    modalEl.querySelector('.bk-close').onclick = closeModal;
    modalEl.querySelector('#bk-form').onsubmit = handleSubmit;
  }

  function closeModal() {
    if (modalEl) {
      modalEl.remove();
      modalEl = null;
      document.body.style.overflow = '';
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var submitBtn = form.querySelector('#bk-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi...';

    var data = {};
    var formData = new FormData(form);
    formData.forEach(function(value, key) {
      if (value) data[key] = value;
    });
    data._source = 'embed-widget';
    data._referrer = window.location.href;

    fetch(BASE_URL + '/api/ingest/' + encodeURIComponent(KEY), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function(res) { return res.json().then(function(body){ return { ok: res.ok, body: body }; }); })
      .then(function(result) {
        if (result.ok) {
          showSuccess();
        } else {
          showError(result.body.error || 'Erreur inconnue');
        }
      })
      .catch(function(err) {
        showError('Erreur réseau. Réessayez ou contactez-nous directement.');
        console.error('[BankKey]', err);
      });
  }

  function showSuccess() {
    if (!modalEl) return;
    var modal = modalEl.querySelector('.bk-modal');
    modal.innerHTML = '' +
      '<div class="bk-header"><div><h2>Demande envoyée ✓</h2><p>Merci. Un courtier vous recontactera sous 24 heures.</p></div><button class="bk-close" type="button">&times;</button></div>' +
      '<div class="bk-success" style="margin:20px 28px 28px;border-radius:8px;">Votre dossier a bien été reçu. Pensez à vérifier vos emails (y compris dans les spams).</div>' +
      '<div class="bk-footer">Propulsé par <a href="https://bankkey.ch" target="_blank" rel="noopener">BankKey</a></div>';
    modal.querySelector('.bk-close').onclick = closeModal;
    setTimeout(closeModal, 5000);
  }

  function showError(message) {
    if (!modalEl) return;
    var existing = modalEl.querySelector('.bk-error');
    if (existing) existing.remove();
    var err = document.createElement('div');
    err.className = 'bk-error';
    err.textContent = message;
    var form = modalEl.querySelector('#bk-form');
    form.parentNode.insertBefore(err, form.nextSibling);
    var submitBtn = form.querySelector('#bk-submit');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Envoyer ma demande';
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function(c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  // ── Init ─────────────────────────────────────────────────────────
  if (POSITION === 'bottom-right') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createFab);
    } else {
      createFab();
    }
  } else if (POSITION === 'inline' && currentScript.parentNode) {
    var inlineBtn = document.createElement('button');
    inlineBtn.style.cssText = 'background:' + PRIMARY + ';color:#fff;border:0;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;';
    inlineBtn.textContent = BUTTON_LABEL;
    inlineBtn.onclick = openModal;
    currentScript.parentNode.insertBefore(inlineBtn, currentScript);
  }

  // Expose une fonction globale pour ouvrir le widget depuis un bouton custom
  window.BankKey = window.BankKey || {};
  window.BankKey.open = openModal;
})();
