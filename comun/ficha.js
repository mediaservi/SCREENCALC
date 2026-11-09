/*
  SCREENS · ficha de equipo común (selector de material de todas las pantallas de cálculo)
  Una sola pieza para cabinets LED, proyectores, electrónicas y mediaservers: foto del fabricante,
  marca y modelo, especificaciones clave, piezas (equipos montados por módulos), avisos y enlace.
  Se usa con import en SCREENS y como script clásico en led.html (globalThis.SC_FICHA).
  Licencia GPL-3.0 · mediaservi.com
*/
(function () {
  'use strict';
  const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const okUrl = (u) => (/^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '');
  // Dibujo de reserva por tipo de equipo (solo si no hay foto o no carga)
  const DIBUJO = {
    led: '<svg viewBox="0 0 120 80" fill="none" stroke="#7b7b84" stroke-width="2"><rect x="14" y="10" width="92" height="60" rx="3"/><path d="M37 10v60M60 10v60M83 10v60M14 30h92M14 50h92"/></svg>',
    proy: '<svg viewBox="0 0 120 80" fill="none" stroke="#7b7b84" stroke-width="2" stroke-linejoin="round"><rect x="16" y="26" width="76" height="34" rx="6"/><circle cx="74" cy="43" r="11"/><circle cx="74" cy="43" r="5"/><path d="M28 34h22M28 41h22M28 48h22M24 60v6M84 60v6"/></svg>',
    elec: '<svg viewBox="0 0 120 80" fill="none" stroke="#7b7b84" stroke-width="2"><rect x="8" y="26" width="104" height="28" rx="2"/><path d="M14 34h10v12H14zM28 34h10v12H28zM42 34h10v12H42zM56 34h10v12H56z"/><circle cx="84" cy="40" r="4"/><path d="M94 34h12M94 40h12M94 46h12"/></svg>',
    media: '<svg viewBox="0 0 120 80" fill="none" stroke="#7b7b84" stroke-width="2" stroke-linejoin="round"><rect x="12" y="18" width="96" height="44" rx="3"/><path d="M50 30l18 10-18 10z"/><path d="M20 70h80"/></svg>'
  };
  // ficha({ cat, icono, marca, modelo, foto, specs:[[k,v]], piezas:[{cant,ref,desc}], notas:[], avisos:[], stock, stockTxt:[sí,no], enlace, enlaceTxt, acento, sel })
  function fichaHTML(d) {
    const foto = okUrl(d.foto), ic = DIBUJO[d.icono] || DIBUJO.elec;
    const [tSi, tNo] = d.stockTxt || ['STOCK', 'PEDIDO'];
    const st = d.stock === true ? `<span class="fi-stock si">${esc(tSi)}</span>` : d.stock === false ? `<span class="fi-stock no">${esc(tNo)}</span>` : '';
    let h = `<article class="ficha${d.sel ? ' fi-sel' : ''}" style="--fi-ac:${esc(d.acento || '#00ff04')}">`;
    h += `<div class="fi-cab"><span class="fi-cat">${esc(d.cat || '')}</span>${st}</div>`;
    h += `<div class="fi-cuerpo"><div class="fi-foto">${ic}${foto ? `<img src="${esc(foto)}" alt="${esc(d.modelo)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}</div>`;
    h += `<div class="fi-dat"><div class="fi-marca">${esc(d.marca || '')}</div><div class="fi-modelo">${esc(d.modelo || '')}</div></div></div>`;
    // especificaciones a todo el ancho de la ficha, en rejilla (2 columnas en paneles estrechos, más si hay sitio)
    if (d.specs && d.specs.length) h += `<dl class="fi-specs">${d.specs.filter(s => s && s[1] !== '' && s[1] != null).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
    if (d.piezas && d.piezas.length) h += `<ul class="fi-piezas">${d.piezas.map(p => `<li><b>${p.cant ? esc(p.cant) + '×' : ''}</b><span class="fi-ref">${esc(p.ref)}</span><span class="fi-desc">${esc(p.desc || '')}</span></li>`).join('')}</ul>`;
    (d.avisos || []).forEach(a => { h += `<p class="fi-aviso">${esc(a)}</p>`; });
    (d.notas || []).forEach(a => { h += `<p class="fi-nota">${esc(a)}</p>`; });
    const en = okUrl(d.enlace), lista = (d.enlaces || []).filter(x => okUrl(x[0]));
    if (en) lista.unshift([en, d.enlaceTxt || 'Ficha del fabricante']);
    if (lista.length) h += `<div class="fi-enlaces">${lista.map(([u, tx]) => `<a class="fi-enlace" href="${esc(okUrl(u))}" target="_blank" rel="noopener noreferrer">${esc(tx)} ↗</a>`).join('')}</div>`;
    return h + '</article>';
  }
  globalThis.SC_FICHA = { fichaHTML };
})();
