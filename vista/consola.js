/* SCREENS · BLOCKS beta · varias pantallas y proyección · mediaservi.com · GPL-3.0
   La consola es la de siempre (screens/app.js, sin tocar: mismas funciones, mismo cálculo, mismo PDF). Este guion solo la coloca en la
   plantilla de bloques fijos de AVHUB: 1) abre el modo pedido con ?modo=varias-led | varias-proy | una-proy; 2) escala la plantilla
   (1920 × 1080) al tamaño de la ventana, para que nada se desplace ni se corte en escritorio y TV; 3) saca las seis cifras del resultado
   a su fila de bloques; 4) «Una + LED» lleva a la vista en una pantalla (blocks/). En el móvil se queda la consola apilada de siempre. */
(function () {
  'use strict';
  try { var m = (location.search.match(/[?&]modo=([a-z-]+)/) || [])[1]; if (m) { var e = JSON.parse(localStorage.getItem('screens_estado') || 'null') || {}; var p = m.split('-'); if (p[0] === 'una' || p[0] === 'varias') e.cantidad = p[0]; if (p[1] === 'led' || p[1] === 'proy') e.tecnologia = p[1];
    if (!e.esp) { localStorage.setItem('screens_blocks_modo', JSON.stringify({ c: e.cantidad, t: e.tecnologia })); } else localStorage.setItem('screens_estado', JSON.stringify(e)); } } catch (x) {}
  var ANCHO = function () { return matchMedia('(min-width: 1024px) and (min-height: 521px)').matches; };
  function escala() { var h = document.documentElement, b = document.body; if (!b) return; if (!ANCHO()) { h.classList.remove('bk'); b.style.zoom = ''; b.style.width = ''; b.style.height = ''; return; }
    h.classList.add('bk'); var z = Math.min(innerWidth / 1920, innerHeight / 1080); b.style.zoom = z; b.style.width = (innerWidth / z) + 'px'; b.style.height = (innerHeight / z) + 'px'; }
  function coloca() { var t = document.querySelector('.trabajo'), r = document.querySelector('#res'); if (!t || !r) return; if (!document.documentElement.classList.contains('bk')) { var v = document.querySelector('#bk-tot > .res-tot'); if (v && !r.querySelector(':scope > .res-tot')) r.prepend(v); return; } var tot = r.querySelector(':scope > .res-tot'); if (!tot) return;
    var c = document.getElementById('bk-tot'); if (!c || c.parentNode !== t) { if (c) c.remove(); c = document.createElement('div'); c.id = 'bk-tot'; t.appendChild(c); } c.textContent = ''; c.appendChild(tot); }
  function primera() { try { var q = JSON.parse(localStorage.getItem('screens_blocks_modo') || 'null'); if (!q) return; localStorage.removeItem('screens_blocks_modo'); ['cantidad:' + q.c, 'tecnologia:' + q.t].forEach(function (s) { var k = s.split(':'), b = document.querySelector('#consola [data-set="' + k[0] + '"][data-v="' + k[1] + '"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); }); } catch (x) {} }
  document.addEventListener('DOMContentLoaded', function () { escala(); addEventListener('resize', escala);
    var pend = 0, hecho = false; new MutationObserver(function () { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; if (document.body.classList.contains('con-led')) { location.replace('./'); return; } coloca(); if (!hecho && document.querySelector('#consola [data-set]')) { hecho = true; primera(); } }); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    var p = document.getElementById('btn-pdf'); if (p) { var a = document.createElement('a'); a.className = 'hdr-btn'; a.id = 'btn-clasica'; a.href = './?clasica'; a.title = 'Versión clásica'; a.setAttribute('aria-label', 'Versión clásica'); a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/></svg>'; p.before(a); } });
})();
