/* SCREENS · PDF directo · mediaservi.com · GPL-3.0
   El botón PDF descarga el archivo .pdf sin pasar por el diálogo de impresión del navegador (que en muchos aparatos solo
   ofrece impresoras). Se usa la misma hoja de impresión de siempre: se copia el documento a un marco oculto del ancho útil
   de un A4, se activan allí las reglas de @media print, se dibuja con html2canvas y se pagina con jsPDF (librerías alojadas
   en assets/lib/pdf, que solo se cargan al pulsar el botón). Si algo falla, quien llama recurre a window.print(). */
(function () {
  'use strict';
  const BASE = ((document.currentScript && document.currentScript.src) || location.href).replace(/[^/]*$/, '');
  const MM = 96 / 25.4, A4 = [210, 297];
  let libs = null;
  const carga = (src) => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('no carga ' + src)); document.head.appendChild(s); });
  const prepara = () => libs || (libs = Promise.all([carga(BASE + 'assets/lib/pdf/html2canvas-pro.min.js'), carga(BASE + 'assets/lib/pdf/jspdf.umd.min.js')]).catch((e) => { libs = null; throw e; }));
  const TXT = { es: 'Generando el PDF…', en: 'Generating the PDF…', ca: 'Generant el PDF…' };

  /* en la copia: lo que era «solo al imprimir» pasa a valer siempre y lo que era «solo en pantalla» deja de valer */
  function modoImpresion(doc) {
    const anda = (reglas) => { for (const r of reglas) { try {
      if (r.media && r.cssRules) { const m = r.media.mediaText; if (/\bprint\b/.test(m) && !/not\s+print/.test(m)) r.media.mediaText = m.replace(/\bonly\s+/g, '').replace(/\bprint\b/g, 'all'); else if (/\bscreen\b/.test(m) && !/not\s+screen/.test(m)) r.media.mediaText = 'not all'; }
      else if (r.cssRules) anda(r.cssRules);
    } catch (e) {} } };
    for (const h of doc.styleSheets) { try { anda(h.cssRules); } catch (e) {} }
  }
  function velo(on) {
    let v = document.getElementById('avpdf-velo');
    if (!on) { if (v) v.remove(); return; }
    if (v) return; v = document.createElement('div'); v.id = 'avpdf-velo'; v.setAttribute('data-html2canvas-ignore', 'true'); v.setAttribute('role', 'status');
    v.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(8,8,14,.72);color:#fff;font:600 16px/1.3 Inter,system-ui,Arial,sans-serif;letter-spacing:.04em;text-align:center;padding:24px';
    v.textContent = TXT[(document.documentElement.lang || 'es').slice(0, 2)] || TXT.es; document.body.appendChild(v);
  }
  /* exporta(o) → Promise. o.raiz: elemento que contiene la hoja; o.paginas: [[selectores…], …] si las hojas ya vienen hechas
     (cada una se encaja en un A4); sin o.paginas se corta sola por donde no parte filas ni bloques. o.pieHtml / o.pieClase: pie de
     cada hoja; o.ocultar: selectores que no deben salir; o.margen (mm); o.nombre: nombre del archivo. */
  async function exporta(o) {
    velo(true);
    try {
      await prepara(); if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
      const M = o.margen || 12, anchoMm = A4[0] - 2 * M, ancho = Math.round(anchoMm * MM), esc = o.escala || 2, med = {};
      const lienzo = await window.html2canvas(o.raiz, { scale: esc, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: ancho, windowHeight: Math.round((A4[1] - 2 * M - 6) * MM), scrollX: 0, scrollY: 0,
        onclone: (doc, raiz) => {
          modoImpresion(doc);
          const st = doc.createElement('style'); st.textContent = 'html,body{width:' + ancho + 'px!important;min-width:0!important;max-width:none!important;margin:0!important;padding:0!important;overflow:visible!important;height:auto!important}[data-avpdf-pie]{position:static!important;display:block!important;width:100%!important;box-sizing:border-box;margin:0!important;padding:6px 0 0!important;text-align:center!important;font:400 7pt/1.55 Inter,Arial,sans-serif;color:#555;white-space:pre-line;background:#fff}' + (o.ocultar ? o.ocultar + '{display:none!important}' : '') + (o.css || ''); doc.head.appendChild(st);
          if (o.alClonar) { try { o.alClonar(doc, raiz); } catch (e) {} }
          /* html2canvas no entiende «zoom»: se cambia por una escala equivalente que ocupa lo mismo en la hoja */
          doc.querySelectorAll('[style*="zoom"]').forEach((el) => { const f = parseFloat(el.style.zoom); if (!f || f === 1) return; el.style.setProperty('zoom', '1', 'important'); const w = el.offsetWidth, h = el.offsetHeight; const pon = (k, v) => el.style.setProperty(k, v, 'important'); pon('transform-origin', '0 0'); pon('transform', 'scale(' + f + ')'); const cs = doc.defaultView.getComputedStyle(el), ml = parseFloat(cs.marginLeft) || 0, pw = el.parentNode.clientWidth, centra = /center/.test(doc.defaultView.getComputedStyle(el.parentNode).justifyContent + cs.alignSelf) || ml > 1; pon('margin-left', (centra ? Math.max(0, (pw - w * f) / 2) : 0) + 'px'); pon('align-self', 'flex-start'); pon('margin-right', (w * (f - 1)) + 'px'); pon('margin-bottom', (h * (f - 1)) + 'px'); });
          let pie = null; if (o.pieHtml) { pie = doc.createElement('div'); pie.setAttribute('data-avpdf-pie', ''); if (o.pieClase) pie.className = o.pieClase; pie.innerHTML = o.pieHtml; pie.style.setProperty('display', 'block', 'important'); pie.style.setProperty('position', 'static', 'important'); pie.style.setProperty('visibility', 'visible', 'important'); raiz.appendChild(pie); }
          const r0 = raiz.getBoundingClientRect(), rel = (el) => { const r = el.getBoundingClientRect(); return [r.top - r0.top, r.bottom - r0.top]; };
          med.alto = r0.height; med.ancho = r0.width; med.alto = raiz.getBoundingClientRect().height; med.pie = pie ? rel(pie) : null; if (med.pie && med.pie[1] - med.pie[0] < 2) med.pie = null;
          if (o.paginas) med.paginas = o.paginas.map((sels) => { let a = Infinity, b = -Infinity; sels.forEach((s) => raiz.querySelectorAll(s).forEach((el) => { const hs = [...el.children].filter((h) => h.getBoundingClientRect().height > 0); (hs.length ? hs : [el]).forEach((h) => { const r = rel(h); if (r[1] > r[0]) { a = Math.min(a, r[0]); b = Math.max(b, r[1]); } }); })); return b > a ? [Math.max(0, a - 2), b + 4] : null; }).filter(Boolean);
          else { const c = new Set(); raiz.querySelectorAll(o.cortes || ':scope > *, tr, .res-sec, .ficha, .tar, .im-captura, .avisos, li').forEach((el) => { if (el === pie) return; const r = rel(el); if (r[1] > r[0]) { c.add(Math.round(r[0])); c.add(Math.round(r[1])); } }); med.cortes = [...c].sort((x, y) => x - y); med.enteros = [...raiz.querySelectorAll(o.enteros || '.res-sec, .ficha, .tar, .im-captura, .avisos, tr, .im-titulo')].map(rel).filter((r) => r[1] > r[0]); }
        } });
      if (o.depura) console.log('PDF directo: medidas ' + JSON.stringify(med) + ' lienzo ' + lienzo.width + 'x' + lienzo.height);
      const k = lienzo.width / med.ancho;   /* píxeles de lienzo por píxel de hoja */
      const pieAlto = med.pie ? med.pie[1] - med.pie[0] : 0, fin = med.pie ? med.pie[0] : med.alto, utilMm = A4[1] - 2 * M - (pieAlto ? pieAlto / MM + 2 : 0), util = utilMm * MM;
      let trozos = [];
      if (med.paginas && med.paginas.length) trozos = med.paginas.map((p) => [Math.max(0, p[0]), Math.min(fin, p[1])]);
      else { let y = 0; const cs = med.cortes.filter((c) => c > 0 && c < fin); let seguro = 0; while (fin - y > util + 1 && seguro++ < 60) { const tope = y + util, parte = (c) => med.enteros.some((e) => e[0] < c - 1 && e[1] > c + 1 && e[1] - e[0] <= util && e[0] > y + 1), cand = cs.filter((c) => c > y + util * .25 && c <= tope && !parte(c)); const c = cand.length ? cand[cand.length - 1] : tope; trozos.push([y, c]); y = c; } trozos.push([y, fin]); }
      trozos = trozos.filter((t) => t[1] - t[0] > 2); if (!trozos.length) throw new Error('hoja vacía');
      const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }), tmp = document.createElement('canvas'), q = tmp.getContext('2d');
      const pega = (y0, y1, xMm, yMm, wMm) => { const h = Math.max(1, Math.round((y1 - y0) * k)); tmp.width = lienzo.width; tmp.height = h; q.fillStyle = '#fff'; q.fillRect(0, 0, tmp.width, h); q.drawImage(lienzo, 0, Math.round(y0 * k), lienzo.width, h, 0, 0, lienzo.width, h); doc.addImage(tmp.toDataURL('image/jpeg', .93), 'JPEG', xMm, yMm, wMm, wMm * h / lienzo.width, undefined, 'FAST'); };
      trozos.forEach((t, i) => { if (i) doc.addPage(); const altoMm = (t[1] - t[0]) / MM, f = Math.min(1, utilMm / altoMm), w = anchoMm * f; pega(t[0], t[1], M + (anchoMm - w) / 2, M, w);
        if (med.pie) pega(med.pie[0], med.pie[1], M, A4[1] - M - pieAlto / MM, anchoMm);
        doc.setFont('courier', 'normal'); doc.setFontSize(8); doc.setTextColor(85); doc.text((i + 1) + '/' + trozos.length, A4[0] - M, A4[1] - M - (pieAlto ? pieAlto / MM / 2 - 2.2 : -4), { align: 'right' }); });
      if (o.titulo) doc.setProperties({ title: o.titulo, creator: 'SCREENS · mediaservi.com' });
      const nombre = (o.nombre || 'SCREENS') + '.pdf';
      if (o.devuelve) return doc.output('blob');
      doc.save(nombre); return nombre;
    } finally { velo(false); }
  }
  const sello = (pref) => { const d = new Date(), p = (n) => String(n).padStart(2, '0'); return (pref || 'SCREENS') + '_' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes()); };
  /* con la copia sin conexión activa, las dos librerías se guardan de antemano (en segundo plano) para poder sacar el PDF sin red */
  try { if ('serviceWorker' in navigator) setTimeout(() => { if (navigator.serviceWorker.controller && navigator.onLine) ['html2canvas-pro.min.js', 'jspdf.umd.min.js'].forEach((f) => { fetch(BASE + 'assets/lib/pdf/' + f).catch(() => {}); }); }, 6000); } catch (e) {}
  window.AVPDF = { exporta, sello };
})();
