/*!
 * BankKey — embed.js (couche de compatibilité)
 *
 * Ce script est DÉPRÉCIÉ : le widget officiel est widget.js.
 * On garde ce fichier pour ne casser aucun site ayant collé l'ancien snippet.
 * Il traduit les anciens attributs (data-primary, data-button-label,
 * data-position "bottom-right") vers widget.js, puis le charge.
 */
(function () {
  'use strict';

  var s = document.currentScript || (function () {
    var all = document.getElementsByTagName('script');
    for (var i = all.length - 1; i >= 0; i--) {
      if (all[i].src && all[i].src.indexOf('embed.js') !== -1) return all[i];
    }
    return null;
  })();
  if (!s) return;
  if (window.__bankkeyWidgetLoaded) return; // widget.js déjà présent

  var w = document.createElement('script');
  w.src = s.src.replace(/embed\.js(\?.*)?$/, 'widget.js');
  w.defer = true;

  var key = s.getAttribute('data-key');
  if (key) w.setAttribute('data-key', key);

  // Anciens attributs → nouveaux
  var color = s.getAttribute('data-color') || s.getAttribute('data-primary');
  if (color) w.setAttribute('data-color', color);

  var label = s.getAttribute('data-title') || s.getAttribute('data-button-label');
  if (label) w.setAttribute('data-title', label);

  var pos = s.getAttribute('data-position');
  if (pos === 'left' || pos === 'bottom-left') w.setAttribute('data-position', 'left');

  console.info('[BankKey] embed.js est déprécié : le snippet widget.js a été chargé à sa place. Mettez à jour votre intégration : <script src="' + w.src + '" data-key="ik_…" defer><\/script>');
  (document.head || document.documentElement).appendChild(w);
})();
