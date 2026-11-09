// SCREENS · v8.3 · vistas técnicas de proyección (como el simulador de distancias de Epson): lateral, frontal y cenital
// con cotas, el rango posible del proyector (zoom × desplazamiento de la óptica), la imagen que se sale de la superficie
// y el proyector que se puede arrastrar (la distancia y la altura quedan fijas, con su candado). GPL-3.0 · mediaservi.com
import { t, idioma } from './i18n.js';
import { HOLGURA } from './proyeccion.js';

const fmt = (v, d = 2) => Number(v || 0).toLocaleString(idioma() === 'en' ? 'en-GB' : 'es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d });
const COL = { linea: '#6a6a75', suelo: '#9a9aa6', pared: '#e9e9ec', imagen: 'rgba(255,214,0,.38)', imagenB: '#ffd600', haz: 'rgba(255,214,0,.13)', rango: 'rgba(0,180,255,.16)',
  rangoB: '#00b4ff', fuera: 'rgba(255,0,170,.30)', proy: '#b566ff', lente: '#00ff04', cota: '#c9c9ce', persona: '#8d8d96' };

// datos de una superficie (fila del cálculo) para dibujarla: alturas de lente por fila y columnas
export function datosVista(c, f) {
  const q = f.p, s = f.s, prod = f.proyector, hs = ((c.sombras && c.sombras.haces) || []).filter(h => h.fila === f);
  if (!q || !prod || !hs.length) return null;
  const vert = !!q.vert, ch = prod.chasis || [0.55, 0.45, 0.2];
  const anchoCh = vert ? ch[2] : ch[0], altoCh = vert ? ch[0] : ch[2], fondoCh = ch[1];
  const filas = Array.from({ length: q.rows }, (_, r) => { const h = hs.find(x => x.filaR === r) || hs[0]; return { y0: s.elev + q.filas[r], y1: s.elev + q.filas[r] + q.imgH, yL: h.lente.y, z: h.zL }; });
  const lim = prod.ust || !prod.shiftV ? 0 : (vert ? prod.shiftH : prod.shiftV) / 100;     // desplazamiento vertical sobre la superficie
  const limH = prod.ust || !prod.shiftV ? 0 : (vert ? prod.shiftV : prod.shiftH) / 100;    // y horizontal
  const sala = c.esp.tipo === 'sala', tS = c.esp.sueltas.techo || 0, yTopImg = Math.max(...filas.map(x => x.y1));
  const techo = sala ? c.esp.alto : (tS > 0 && tS >= yTopImg ? tS : 0);
  const fondoSala = sala ? ((s.id === 'frontal' || s.id === 'trasera') ? c.esp.fondo : c.esp.ancho) : 0;
  return { q, s, prod, vert, anchoCh, altoCh, fondoCh, paso: altoCh + HOLGURA.v, filas, lim, limH, techo, fondoSala, apoyo: !!(f.pos && f.pos.apoyo), dist: f.pos ? f.pos.dist : q.tiro, publico: sala ? 0 : c.dist };
}

// cotas: línea con topes y el valor centrado
function cota(x1, y1, x2, y2, txt, lado = -1) {
  const hor = Math.abs(y2 - y1) < Math.abs(x2 - x1), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const tope = (x, y) => hor ? `<line x1="${x}" y1="${y - 4}" x2="${x}" y2="${y + 4}"/>` : `<line x1="${x - 4}" y1="${y}" x2="${x + 4}" y2="${y}"/>`;
  const tx = hor ? `<text x="${mx}" y="${my + (lado < 0 ? -5 : 13)}" text-anchor="middle">${txt}</text>` : `<text x="${mx + (lado < 0 ? -6 : 6)}" y="${my + 4}" text-anchor="${lado < 0 ? 'end' : 'start'}">${txt}</text>`;
  return `<g class="vt-cota"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>${tope(x1, y1)}${tope(x2, y2)}${tx}</g>`;
}
// escala: metros → píxeles dentro de un recuadro con márgenes para las cotas
function escala(W, H, m, xMin, xMax, yMin, yMax) {
  const k = Math.min((W - m.l - m.r) / Math.max(0.1, xMax - xMin), (H - m.t - m.b) / Math.max(0.1, yMax - yMin));
  const ox = m.l + ((W - m.l - m.r) - (xMax - xMin) * k) / 2, oy = H - m.b - ((H - m.t - m.b) - (yMax - yMin) * k) / 2;
  return { k, X: (x) => ox + (x - xMin) * k, Y: (y) => oy - (y - yMin) * k, x: (px) => xMin + (px - ox) / k, y: (py) => yMin + (oy - py) / k };
}
const persona = (X, Y, x, k) => { const h = 1.75 * k, w = 0.45 * k; return `<g class="vt-persona" fill="none" stroke="${COL.persona}" stroke-width="1.4"><circle cx="${X(x)}" cy="${Y(0) - h + w * 0.28}" r="${w * 0.28}"/><path d="M${X(x)} ${Y(0) - h + w * 0.56}V${Y(0) - h * 0.45}M${X(x) - w / 2} ${Y(0) - h * 0.72}H${X(x) + w / 2}M${X(x)} ${Y(0) - h * 0.45}L${X(x) - w * 0.35} ${Y(0)}M${X(x)} ${Y(0) - h * 0.45}L${X(x) + w * 0.35} ${Y(0)}"/></g>`; };

// LATERAL: la pared a la izquierda, el proyector a su distancia (x) y altura (y); rango posible = zoom × desplazamiento vertical
export function svgLateral(d, o = {}) {
  const W = o.W || 400, H = o.H || 260, { q, s, filas } = d, dist = o.dist != null ? o.dist : d.dist, dy = o.yL != null ? o.yL - filas[0].yL : 0;
  const yTop = Math.max(...filas.map(f => f.y1)), yBot = Math.min(...filas.map(f => f.y0)), lensMax = Math.max(...filas.map(f => f.yL + dy));
  const xMax = Math.max(dist + d.fondoCh + 0.6, Math.min(q.tMaxZ, dist * 1.4 + 1), d.fondoSala, d.publico ? d.publico + 0.8 : 0);
  const yMax = Math.max(d.techo, yTop + 0.4, lensMax + d.altoCh + 0.4, 2.2);
  const E = escala(W, H, { l: 50, r: 46, t: 26, b: 22 }, -0.3, xMax, Math.min(0, yBot), yMax), { X, Y, k } = E;
  let g = `<rect x="0" y="0" width="${W}" height="${H}" class="vt-fondo"/>`;
  g += `<line x1="${X(-0.3)}" y1="${Y(0)}" x2="${X(xMax)}" y2="${Y(0)}" stroke="${COL.suelo}" stroke-width="1.5"/>`;
  if (d.techo) g += `<line x1="${X(-0.3)}" y1="${Y(d.techo)}" x2="${X(xMax)}" y2="${Y(d.techo)}" stroke="${COL.linea}" stroke-dasharray="5 4"/>`;
  if (d.fondoSala) g += `<line x1="${X(d.fondoSala)}" y1="${Y(0)}" x2="${X(d.fondoSala)}" y2="${Y(d.techo || yMax)}" stroke="${COL.linea}" stroke-width="2"/>`;
  // rango posible de la lente: del zoom (distancias) por el desplazamiento vertical de la óptica (alturas), en la primera fila
  const f0 = filas[0], yC = (f0.y0 + f0.y1) / 2, ih = f0.y1 - f0.y0, a = q.tMin, b = Math.min(q.tMaxZ, xMax);
  if (d.lim) { const y1 = Math.max(0, yC - d.lim * ih), y2 = Math.min(d.techo || 1e9, yC + d.lim * ih);
    g += `<rect x="${X(a)}" y="${Y(y2)}" width="${Math.max(2, (b - a) * k)}" height="${Math.max(2, (y2 - y1) * k)}" fill="${COL.rango}" stroke="${COL.rangoB}" stroke-dasharray="4 3"/>`; }
  else g += `<line x1="${X(a)}" y1="${Y(f0.yL + dy)}" x2="${X(b)}" y2="${Y(f0.yL + dy)}" stroke="${COL.rangoB}" stroke-width="6" stroke-opacity=".35"/>`;
  // superficie y la imagen (lo que se sale de la superficie, en rosa)
  g += `<line x1="${X(0)}" y1="${Y(s.elev)}" x2="${X(0)}" y2="${Y(s.elev + s.alto)}" stroke="${COL.pared}" stroke-width="5"/>`;
  filas.forEach(f => {
    g += `<line x1="${X(0) + 4}" y1="${Y(Math.max(f.y0, s.elev))}" x2="${X(0) + 4}" y2="${Y(Math.min(f.y1, s.elev + s.alto))}" stroke="${COL.imagenB}" stroke-width="4"/>`;
    if (f.y1 > s.elev + s.alto + 0.01) g += `<line x1="${X(0) + 4}" y1="${Y(f.y1)}" x2="${X(0) + 4}" y2="${Y(s.elev + s.alto)}" stroke="#ff00aa" stroke-width="4"/>`;
    if (f.y0 < s.elev - 0.01) g += `<line x1="${X(0) + 4}" y1="${Y(s.elev)}" x2="${X(0) + 4}" y2="${Y(f.y0)}" stroke="#ff00aa" stroke-width="4"/>`;
  });
  if (d.publico) g += persona(X, Y, d.publico, k);
  // proyectores (uno por fila), con su haz y su torre o base si va apoyado
  let pr = '';
  filas.forEach((f, i) => {
    const yl = f.yL + dy, x0 = X(dist), w = d.fondoCh * k, h = d.altoCh * k;
    g += `<path d="M${x0} ${Y(yl)}L${X(0) + 4} ${Y(f.y1)}L${X(0) + 4} ${Y(f.y0)}Z" fill="${COL.haz}" stroke="rgba(255,214,0,.5)" stroke-width=".8"/>`;
    pr += `<rect x="${x0}" y="${Y(yl) - h / 2}" width="${w}" height="${h}" rx="2" fill="#2b2b31" stroke="${COL.proy}" stroke-width="1.6"/><circle cx="${x0}" cy="${Y(yl)}" r="3" fill="${COL.lente}"/>`;
    if (d.apoyo && i === 0 && yl - d.altoCh / 2 > 0.05) pr += `<line x1="${x0 + w / 2}" y1="${Y(yl - d.altoCh / 2)}" x2="${x0 + w / 2}" y2="${Y(0)}" stroke="${COL.proy}" stroke-width="2" stroke-dasharray="${yl > 2.5 ? '0' : '3 3'}"/>`;
  });
  g += `<g class="vt-proy" data-vista="lateral" tabindex="0" role="slider" aria-label="${t('vtArrastra')}">${pr}<rect x="${X(dist) - 10}" y="${Y(lensMax) - d.altoCh * k / 2 - 10}" width="${d.fondoCh * k + 20}" height="${(lensMax - (filas[0].yL + dy)) * k + d.altoCh * k + 20}" fill="transparent"/></g>`;
  // cotas: distancia, altura de la lente, borde inferior y alto de la imagen
  g += cota(X(0), Y(yMax) + 12, X(dist), Y(yMax) + 12, `${fmt(dist)} m`);
  const xc = X(dist) + d.fondoCh * k + 12;
  g += cota(xc, Y(0), xc, Y(f0.yL + dy), `${fmt(f0.yL + dy)}`, 1);
  if (yBot > 0.05) g += cota(X(0) - 12, Y(0), X(0) - 12, Y(yBot), fmt(yBot));
  g += cota(X(0) - 12, Y(yBot), X(0) - 12, Y(yTop), fmt(yTop - yBot));
  return `<svg class="vt-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('vtLateral')}" data-k="${k}" data-x0="${E.X(0)}" data-y0="${E.Y(0)}">${g}<text x="${W - 8}" y="16" text-anchor="end" class="vt-uni">(m)</text></svg>`;
}

// FRONTAL: la superficie de frente, cada imagen de la rejilla con sus solapes, los proyectores y el rango del desplazamiento
export function svgFrontal(d, o = {}) {
  const W = o.W || 400, H = o.H || 260, { q, s, filas } = d, dy = o.yL != null ? o.yL - filas[0].yL : 0;
  const ancho = Math.max(s.ancho, q.anchoTot || q.imgW) / 2 + 0.4, yTop = Math.max(...filas.map(f => f.y1), ...filas.map(f => f.yL + dy + d.altoCh));
  const yMax = Math.max(d.techo, yTop + 0.3, s.elev + s.alto + 0.3), yMin = Math.min(0, ...filas.map(f => f.y0));
  const E = escala(W, H, { l: 40, r: 40, t: 24, b: 22 }, -ancho, ancho, yMin, yMax), { X, Y, k } = E;
  let g = `<rect x="0" y="0" width="${W}" height="${H}" class="vt-fondo"/>`;
  g += `<line x1="${X(-ancho)}" y1="${Y(0)}" x2="${X(ancho)}" y2="${Y(0)}" stroke="${COL.suelo}" stroke-width="1.5"/>`;
  if (d.techo) g += `<line x1="${X(-ancho)}" y1="${Y(d.techo)}" x2="${X(ancho)}" y2="${Y(d.techo)}" stroke="${COL.linea}" stroke-dasharray="5 4"/>`;
  // imágenes (con lo que sobresale de la superficie en rosa) y la superficie encima
  filas.forEach(f => q.centros.forEach(cx => {
    const x0 = cx - q.imgW / 2;
    g += `<rect x="${X(x0)}" y="${Y(f.y1)}" width="${q.imgW * k}" height="${q.imgH * k}" fill="${COL.imagen}" stroke="${COL.imagenB}" stroke-width="1"/>`;
  }));
  const fuera = (x0, y0, w, h) => `<rect x="${X(x0)}" y="${Y(y0 + h)}" width="${Math.max(0, w * k)}" height="${Math.max(0, h * k)}" fill="${COL.fuera}"/>`;
  const L = -s.ancho / 2, R = s.ancho / 2, B = s.elev, T = s.elev + s.alto, aL = Math.min(...q.centros) - q.imgW / 2, aR = Math.max(...q.centros) + q.imgW / 2;
  const iB = Math.min(...filas.map(f => f.y0)), iT = Math.max(...filas.map(f => f.y1));
  if (aL < L - 0.01) g += fuera(aL, iB, L - aL, iT - iB); if (aR > R + 0.01) g += fuera(R, iB, aR - R, iT - iB);
  if (iB < B - 0.01) g += fuera(Math.max(aL, L), iB, Math.min(aR, R) - Math.max(aL, L), B - iB); if (iT > T + 0.01) g += fuera(Math.max(aL, L), T, Math.min(aR, R) - Math.max(aL, L), iT - T);
  g += `<rect x="${X(L)}" y="${Y(T)}" width="${s.ancho * k}" height="${s.alto * k}" fill="none" stroke="${COL.pared}" stroke-width="2"/>`;
  // rango del desplazamiento de la óptica (primera fila, primera columna) y los proyectores
  const f0 = filas[0], yC = (f0.y0 + f0.y1) / 2, cx0 = q.centros[0];
  if (d.lim || d.limH) g += `<rect x="${X(cx0 - d.limH * q.imgW)}" y="${Y(yC + d.lim * q.imgH)}" width="${Math.max(2, 2 * d.limH * q.imgW * k)}" height="${Math.max(2, 2 * d.lim * q.imgH * k)}" fill="${COL.rango}" stroke="${COL.rangoB}" stroke-dasharray="4 3" rx="3"/>`;
  let pr = '';
  filas.forEach(f => q.centros.forEach(cx => {
    const yl = f.yL + dy, w = d.anchoCh * k, h = d.altoCh * k;
    pr += `<circle cx="${X(cx)}" cy="${Y(yl)}" r="16" fill="transparent"/><rect x="${X(cx) - w / 2}" y="${Y(yl) - h / 2}" width="${w}" height="${h}" rx="2" fill="#2b2b31" stroke="${COL.proy}" stroke-width="1.6"/><circle cx="${X(cx)}" cy="${Y(yl)}" r="3" fill="${COL.lente}"/>`;
  }));
  g += `<g class="vt-proy" data-vista="frontal" tabindex="0" role="slider" aria-label="${t('vtArrastra')}">${pr}</g>`;
  // cotas: ancho de la superficie y de cada imagen, alto de la imagen y altura de la lente
  g += cota(X(L), Y(yMax) + 12, X(R), Y(yMax) + 12, `${fmt(s.ancho)} m`);
  if (Math.abs(q.imgW - s.ancho) > 0.02 || q.cols > 1) g += cota(X(aL), Y(Math.min(iB, B)) + 14, X(aL + q.imgW), Y(Math.min(iB, B)) + 14, fmt(q.imgW), 1);
  g += cota(X(R) + 14, Y(f0.y0), X(R) + 14, Y(f0.y1), fmt(q.imgH), 1);
  g += cota(X(-ancho) - 4, Y(0), X(-ancho) - 4, Y(f0.yL + dy), fmt(f0.yL + dy));
  return `<svg class="vt-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('vtFrontal')}" data-k="${k}">${g}<text x="${W - 8}" y="16" text-anchor="end" class="vt-uni">(m)</text></svg>`;
}

// CENITAL: la pared a la izquierda (vista desde arriba), los proyectores de cada columna a su distancia y sus haces
export function svgCenital(d, o = {}) {
  const W = o.W || 400, H = o.H || 260, { q, s } = d, dist = o.dist != null ? o.dist : d.dist;
  const medio = Math.max(s.ancho, q.anchoTot || q.imgW) / 2 + 0.4, xMax = Math.max(dist + d.fondoCh + 0.6, Math.min(q.tMaxZ, dist * 1.4 + 1), d.fondoSala, d.publico ? d.publico + 0.8 : 0);
  const E = escala(W, H, { l: 46, r: 16, t: 26, b: 22 }, -0.3, xMax, -medio, medio), { X, Y, k } = E;
  let g = `<rect x="0" y="0" width="${W}" height="${H}" class="vt-fondo"/>`;
  // rango posible: distancias del zoom por el desplazamiento horizontal de cada columna
  const a = q.tMin, b = Math.min(q.tMaxZ, xMax);
  q.centros.forEach(cx => { const w = d.limH * q.imgW;
    g += w ? `<rect x="${X(a)}" y="${Y(cx + w)}" width="${Math.max(2, (b - a) * k)}" height="${Math.max(2, 2 * w * k)}" fill="${COL.rango}" stroke="${COL.rangoB}" stroke-dasharray="4 3"/>`
      : `<line x1="${X(a)}" y1="${Y(cx)}" x2="${X(b)}" y2="${Y(cx)}" stroke="${COL.rangoB}" stroke-width="6" stroke-opacity=".35"/>`; });
  g += `<line x1="${X(0)}" y1="${Y(-s.ancho / 2)}" x2="${X(0)}" y2="${Y(s.ancho / 2)}" stroke="${COL.pared}" stroke-width="5"/>`;
  if (d.fondoSala) g += `<line x1="${X(d.fondoSala)}" y1="${Y(-medio)}" x2="${X(d.fondoSala)}" y2="${Y(medio)}" stroke="${COL.linea}" stroke-width="2"/>`;
  let pr = '';
  q.centros.forEach(cx => {
    const x0 = X(dist), w = d.fondoCh * k, h = d.anchoCh * k, y0 = cx - q.imgW / 2, y1 = cx + q.imgW / 2;
    g += `<path d="M${x0} ${Y(cx)}L${X(0) + 4} ${Y(y1)}L${X(0) + 4} ${Y(y0)}Z" fill="${COL.haz}" stroke="rgba(255,214,0,.5)" stroke-width=".8"/>`;
    g += `<line x1="${X(0) + 4}" y1="${Y(Math.max(y0, -s.ancho / 2))}" x2="${X(0) + 4}" y2="${Y(Math.min(y1, s.ancho / 2))}" stroke="${COL.imagenB}" stroke-width="4"/>`;
    if (y0 < -s.ancho / 2 - 0.01) g += `<line x1="${X(0) + 4}" y1="${Y(y0)}" x2="${X(0) + 4}" y2="${Y(-s.ancho / 2)}" stroke="#ff00aa" stroke-width="4"/>`;
    if (y1 > s.ancho / 2 + 0.01) g += `<line x1="${X(0) + 4}" y1="${Y(s.ancho / 2)}" x2="${X(0) + 4}" y2="${Y(y1)}" stroke="#ff00aa" stroke-width="4"/>`;
    pr += `<circle cx="${x0 + w / 2}" cy="${Y(cx)}" r="16" fill="transparent"/><rect x="${x0}" y="${Y(cx) - h / 2}" width="${w}" height="${h}" rx="2" fill="#2b2b31" stroke="${COL.proy}" stroke-width="1.6"/><circle cx="${x0}" cy="${Y(cx)}" r="3" fill="${COL.lente}"/>`;
  });
  if (d.publico) g += `<line x1="${X(d.publico)}" y1="${Y(-medio * 0.8)}" x2="${X(d.publico)}" y2="${Y(medio * 0.8)}" stroke="${COL.persona}" stroke-dasharray="2 4"/><text x="${X(d.publico)}" y="${Y(-medio * 0.8) + 12}" text-anchor="middle" class="vt-uni">${t('vtPublico')}</text>`;
  g += `<g class="vt-proy" data-vista="cenital" tabindex="0" role="slider" aria-label="${t('vtArrastra')}">${pr}</g>`;
  g += cota(X(0), Y(medio) - 10, X(dist), Y(medio) - 10, `${fmt(dist)} m`);
  g += cota(X(-0.3) - 4, Y(-s.ancho / 2), X(-0.3) - 4, Y(s.ancho / 2), fmt(s.ancho));
  return `<svg class="vt-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('vtCenital')}" data-k="${k}">${g}<text x="${W - 8}" y="16" text-anchor="end" class="vt-uni">(m)</text></svg>`;
}

const VISTAS = { lateral: svgLateral, frontal: svgFrontal, cenital: svgCenital };
// sección completa: cabecera con la distribución y la superficie, las vistas y los controles del desplazamiento de la óptica
export function vistasTecnicas(c, modo = 'todas', iSup = 0) {
  const fs = c.filas.filter(f => f.s.tipo !== 'suelo' && f.pos); if (!fs.length) return '';
  const f = fs[Math.min(iSup, fs.length - 1)], d = datosVista(c, f); if (!d) return '';
  const grande = modo !== 'todas', dims = grande ? { W: 760, H: 380 } : { W: 400, H: 260 };
  const lista = grande ? [modo] : ['lateral', 'frontal', 'cenital'];
  let h = `<section class="res-sec vt" data-vt-sup="${c.filas.indexOf(f)}"><div class="res-tit vt-cab"><span>${t('vtTit')}</span><div class="vt-modos">` +
    ['todas', 'lateral', 'frontal', 'cenital'].map(m => `<button type="button" class="tog${m === modo ? ' on' : ''}" data-accion="vt-modo" data-v="${m}" aria-pressed="${m === modo}">${t('vt_' + m)}</button>`).join('') + '</div>';
  if (fs.length > 1) h += `<select class="sel vt-sup" data-vt-sel="1" aria-label="${t('vtSup')}">${fs.map((x, i) => `<option value="${i}"${x === f ? ' selected' : ''}>${x.nombre}</option>`).join('')}</select>`;
  h += `</div><div class="vt-rejilla${grande ? ' una' : ''}">` + lista.map(v => `<figure class="vt-fig" data-vt="${v}"><figcaption>${t('vt_' + v)}<span class="vt-ley"><i class="r"></i>${t('vtRango')}</span><span class="vt-ley"><i class="f"></i>${t('vtFuera')}</span></figcaption><div class="vt-lienzo">${VISTAS[v](d, dims)}</div></figure>`).join('') + '</div>';
  // desplazamiento de la óptica: el vertical se mueve con la altura del proyector (deslizador y centrar); el horizontal, informativo
  const f0 = d.filas[0], yC = (f0.y0 + f0.y1) / 2, ih = f0.y1 - f0.y0, sv = ((f0.yL - yC) / ih) * 100;
  if (d.lim) h += `<div class="vt-shift"><label>${t('vtShiftV')}</label><input type="range" data-vt-shift="1" min="${-Math.round(d.lim * 100)}" max="${Math.round(d.lim * 100)}" step="1" value="${Math.round(sv)}"><b class="${Math.abs(sv) > d.lim * 100 + 0.5 ? 'mal' : ''}">${fmt(sv, 0)} % <small>(±${fmt(d.lim * 100, 0)} %)</small></b>` +
    `<button type="button" class="sec-btn" data-accion="vt-centrar">${t('vtCentrar')}</button><span class="vt-h">${t('vtShiftH')}: 0 % <small>(±${fmt(d.limH * 100, 0)} %)</small></span></div>`;
  return h + `<p class="ayuda">${t('vtAyuda')}</p></section>`;
}

// arrastrar el proyector en las vistas (lateral: distancia y altura; frontal: altura; cenital: distancia) y el deslizador del desplazamiento
export function activarVistas(raiz, c, fijar) {
  const sec = raiz.querySelector('.vt'); if (!sec) return;
  const fs = c.filas.filter(f => f.s.tipo !== 'suelo' && f.pos), f = c.filas[Number(sec.dataset.vtSup)] || fs[0], d = f && datosVista(c, f); if (!d) return;
  const grande = !!sec.querySelector('.vt-rejilla.una'), dims = grande ? { W: 760, H: 380 } : { W: 400, H: 260 };
  const f0 = d.filas[0], yC = (f0.y0 + f0.y1) / 2, ih = f0.y1 - f0.y0, tope = d.techo ? d.techo - d.altoCh / 2 - 0.02 : 200;
  const pintar = (v, o) => { const fig = sec.querySelector(`.vt-fig[data-vt="${v}"] .vt-lienzo`); if (fig) fig.innerHTML = VISTAS[v](d, { ...dims, ...o }); };
  let arr = null;
  sec.addEventListener('pointerdown', (ev) => {
    const gp = ev.target.closest('.vt-proy'); if (!gp) return;
    const svg = gp.ownerSVGElement, m = svg.getScreenCTM(); if (!m) return;
    ev.preventDefault(); arr = { v: gp.dataset.vista, svg, x0: ev.clientX, y0: ev.clientY, k: Number(svg.dataset.k), sx: m.a, dist: d.dist, yL: f0.yL };
    sec.classList.add('arrastrando'); try { sec.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  sec.addEventListener('pointermove', (ev) => {
    if (!arr) return;
    const px = (ev.clientX - arr.x0) / arr.sx / arr.k, py = (ev.clientY - arr.y0) / arr.sx / arr.k;   // metros
    const o = {};
    if (arr.v !== 'frontal') o.dist = Math.min(200, Math.max(0.2, d.dist + px));
    if (arr.v !== 'cenital') o.yL = Math.min(tope, Math.max(d.altoCh / 2 + 0.02, Math.round((f0.yL - py) * 100) / 100));
    if (o.dist != null) o.dist = Math.round(o.dist * 100) / 100;
    arr.o = o;
    ['lateral', 'frontal', 'cenital'].forEach(v => pintar(v, o));
    const b = sec.querySelector('.vt-shift b'); if (b && o.yL != null) b.firstChild.textContent = `${fmt(((o.yL - yC) / ih) * 100, 0)} % `;
  });
  const soltar = () => { if (!arr) return; const o = arr.o; arr = null; sec.classList.remove('arrastrando'); if (o) fijar(o, d); };
  sec.addEventListener('pointerup', soltar); sec.addEventListener('pointercancel', soltar);
  const sl = sec.querySelector('[data-vt-shift]');
  if (sl) {
    sl.addEventListener('input', () => { const o = { yL: Math.min(tope, Math.max(d.altoCh / 2 + 0.02, yC + Number(sl.value) / 100 * ih)) }; ['lateral', 'frontal'].forEach(v => pintar(v, o));
      const b = sec.querySelector('.vt-shift b'); if (b) b.firstChild.textContent = `${sl.value} % `; });
    sl.addEventListener('change', () => fijar({ yL: Math.round(Math.min(tope, Math.max(d.altoCh / 2 + 0.02, yC + Number(sl.value) / 100 * ih)) * 100) / 100 }, d));
  }
  const cen = sec.querySelector('[data-accion="vt-centrar"]');
  if (cen) cen.addEventListener('click', (ev) => { ev.stopPropagation(); fijar({ yL: Math.round(Math.min(tope, Math.max(d.altoCh / 2 + 0.02, yC)) * 100) / 100 }, d); });
}
