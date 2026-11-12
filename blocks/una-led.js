/* SCREENS · una pantalla LED en BLOCKS (beta) · mediaservi.com · GPL-3.0
   Misma lógica de cálculo que la consola (screens/led.js, comun/electronica.js) y el mismo catálogo en vivo (screens/catalogo.js);
   aquí solo cambia cómo se presenta: cada dato tiene su bloque fijo y no hay desplazamiento de página. */
import { cargarCatalogo, ordenar, enStock } from '../screens/catalogo.js';
import { calcularLed, lineasCosido, PX_PUERTO } from '../screens/led.js';
import { HUMAN_PATH } from '../screens/figura.js';
import '../comun/electronica.js';
import '../comun/ficha.js';
const ELEC = globalThis.SC_ELEC, FICHA = globalThis.SC_FICHA, VERSION = 'BLOCKS beta 1 · SCREENS v10.3';
const $ = (s, r = document) => r.querySelector(s), esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (v, d = 0) => Number(v).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
const IC = {
  ojo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  rueda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
  tema: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>',
  casa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  ant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  sig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  clasico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>' };
const bt = (ic, tit, attrs = '', cls = '') => `<button type="button" class="ic-bt ${cls}" title="${esc(tit)}" aria-label="${esc(tit)}" ${attrs}>${IC[ic]}</button>`;
const tog = (on, attrs, txt) => `<button type="button" class="tog" aria-pressed="${!!on}" ${attrs}>${txt}</button>`;

/* ---------- estado ---------- */
const GUARDA = 'screens-blocks-1';
const E = Object.assign({ w: 3, h: 2, tipo: 'INDOOR', clase: 'INSTALL', pitch: 0, dist: 0, crm: '', elev: 100, fondo: 'hormigon', backup: true, escalador: 'con', conexion: 'directo', marca: 'ninguno', ajuste: 'dentro', vista: 0, tema: 'oscuro', texto: '' },
  (() => { try { return JSON.parse(localStorage.getItem(GUARDA) || '{}'); } catch (e) { return {}; } })());
let CAT = [], ESTADO = 'cargando', R = null;   /* R: resultado del cálculo en curso */
const guarda = () => { try { localStorage.setItem(GUARDA, JSON.stringify(E)); } catch (e) {} };
const FONDOS = ['hormigon', 'madera', 'marmol', 'ladrillo-rojo', 'ladrillo-oscuro', 'ladrillo-claro'];

/* ---------- petición escrita ---------- */
function interpreta(raw) {
  const t = ' ' + String(raw || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(\d),(\d)/g, '$1.$2') + ' ', v = [];
  const U = '(mm|cm|m|mts?|metros?)?', aM = (n, u) => { n = parseFloat(n); return u === 'mm' ? n / 1000 : u === 'cm' ? n / 100 : n; };
  const d = t.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*' + U + '\\s*(?:x|×|\\*|por)\\s*(\\d+(?:\\.\\d+)?)\\s*' + U + '(?![a-z])'));
  let resto = t;
  if (d) { const u = d[4] || d[2], u1 = d[2] || d[4]; E.w = aM(d[1], u1); E.h = aM(d[3], u); v.push(fmt(E.w, 2) + ' × ' + fmt(E.h, 2) + ' m'); resto = t.replace(d[0], ' '); }
  if (/escaparate|vitrina|shop window/.test(t)) { E.tipo = 'ESCAPARATE'; v.push('escaparate'); }
  else if (/exterior|outdoor|intemperie|aire libre|fachada|\bcalle\b|terraza/.test(t)) { E.tipo = 'OUTDOOR'; v.push('exterior'); }
  else if (/interior|indoor|\bsala\b|salon|oficina|\bstand\b|showroom/.test(t)) { E.tipo = 'INDOOR'; v.push('interior'); }
  if (/alquiler|rental|evento|\bgira\b|concierto|feria|escenario|temporal/.test(t)) { E.clase = 'RENTAL'; v.push('alquiler'); }
  else if (/instalacion|instalar|\bfij[oa]\b|permanente|install/.test(t)) { E.clase = 'INSTALL'; v.push('fija'); }
  const p = resto.match(/(?:pitch|paso)\s*(?:de\s*|:\s*)?(\d{1,2}(?:\.\d+)?)|\bp\s?(\d{1,2}(?:\.\d+)?)\b|(\d{1,2}(?:\.\d+)?)\s*(?:mm\s*)?(?:de\s*)?(?:pitch|paso)/) || (() => { const m = resto.match(/(?:^|[^\d.])(\d{1,2}(?:\.\d+)?)\s?p(?![a-z0-9])/); return m && (/\./.test(m[1]) || parseFloat(m[1]) <= 20) ? [0, m[1]] : null; })();
  if (p) { E.pitch = parseFloat(p[1] || p[2] || p[3]); E.crm = ''; v.push('pitch ' + E.pitch); } else if (d || v.length) { E.pitch = 0; E.crm = ''; }
  const ds = resto.match(/(?:\ba|desde|hasta|distancia(?: de)?|visto a)\s*(?:unos\s*)?(\d+(?:\.\d+)?)\s*(m|mts?|metros?)(?![a-z])/);
  if (ds) { E.dist = parseFloat(ds[1]); v.push('a ' + fmt(E.dist, 1) + ' m'); } else if (d) E.dist = 0;
  if (/sin (backup|redundancia)/.test(t)) E.backup = false; else if (/backup|redundan/.test(t)) E.backup = true;
  if (/fibra|fiber/.test(t)) E.conexion = 'fibra';
  if (/sin (mediaserver|servidor)/.test(t)) E.marca = 'ninguno'; else if (/mediaserver|media server|servidor de/.test(t)) E.marca = 'todos';
  return v;
}

/* ---------- cálculo ---------- */
const MIN_NITS = { OUTDOOR: 5000, ESCAPARATE: 2500, INDOOR: 0 };
function calcula() {
  R = null; if (!CAT.length) return;
  let lista = CAT.filter((m) => m.tipo === E.tipo && m.class === E.clase), relajado = '';
  if (!lista.length) { lista = CAT.filter((m) => m.tipo === E.tipo); relajado = 'No hay modelos de ' + (E.clase === 'RENTAL' ? 'alquiler' : 'instalación fija') + ' para este entorno: se muestran todos.'; }
  const nits = MIN_NITS[E.tipo] || 0, conNits = lista.filter((m) => m.nits >= nits); if (conNits.length) lista = conNits;
  lista = ordenar(lista); if (!lista.length) { R = { vacio: true }; return; }
  const pitches = [...new Set(lista.map((m) => m.pitch))].sort((a, b) => a - b);
  let pitch, origen;
  if (E.crm && lista.some((m) => m.crm === E.crm)) { pitch = lista.find((m) => m.crm === E.crm).pitch; origen = E.pitch ? 'pedido' : 'elegido'; }
  else if (E.pitch) { pitch = pitches.reduce((b, x) => (Math.abs(x - E.pitch) < Math.abs(b - E.pitch) ? x : b), pitches[0]); origen = pitch === E.pitch ? 'pedido' : 'cercano'; }
  else if (E.dist) { const c = pitches.filter((x) => x <= E.dist + 1e-9); pitch = c.length ? c[c.length - 1] : pitches[0]; origen = 'distancia'; }
  else { pitch = pitches[0]; origen = 'auto'; }
  const delPitch = lista.filter((m) => m.pitch === pitch), m = delPitch.find((x) => x.crm === E.crm) || delPitch[0];
  const r = calcularLed({ ancho: E.w, alto: E.h }, m, E.ajuste), pixCab = m.cabPixAncho * m.cabPixAlto;
  const procs = ELEC.calcularElectronicas({ lines: r.lineas, totalPix: r.pix, porSup: null }, { backup: E.backup, escalador: E.escalador, conexion: E.conexion, entradas: 0 }, []);
  const medias = E.marca === 'ninguno' ? [] : ELEC.calcularMediaservers({ totalPix: Math.max(1, r.salidas4k) * ELEC.ELEC_PX_4K, resW: r.resW, resH: r.resH }, { marca: E.marca, dante: false });
  /* reparto de cabinets por puerto de datos y por línea eléctrica de 16 A (columnas enteras siempre que caben) */
  const cabPuerto = Math.max(1, Math.floor(PX_PUERTO / pixCab)), colsPP = Math.floor(cabPuerto / r.rows), filasPP = Math.floor(cabPuerto / r.cols);
  const vert = colsPP >= 1 && (filasPP < 1 || Math.ceil(r.cols / colsPP) <= Math.ceil(r.rows / filasPP));
  const puerto = (c, f) => (vert ? Math.floor(c / colsPP) : filasPP >= 1 ? Math.floor(f / filasPP) : Math.floor((f * r.cols + (f % 2 ? r.cols - 1 - c : c)) / cabPuerto));
  const ampCab = Number(m.cabAmp) || (m.wMax ? m.wMax / 230 : 0), cabLinea = ampCab > 0 ? Math.max(1, Math.floor(16 / ampCab)) : r.cab, colsPL = Math.floor(cabLinea / r.rows);
  const linea = (c, f) => (colsPL >= 1 ? Math.floor(c / colsPL) : Math.floor((c * r.rows + f) / cabLinea));
  const nLin = colsPL >= 1 ? Math.ceil(r.cols / colsPL) : Math.ceil(r.cab / cabLinea);
  R = { m, r, lista, pitches, pitch, origen, delPitch, relajado, procs, proc: procs[0] || null, medias, media: medias[0] || null, puerto, linea, nLin, ampCab, vert, nits,
    diag: Math.hypot(r.ancho, r.alto), lineasTxt: lineasCosido(r.cols, r.rows, pixCab) };
}

/* ---------- dibujos de las mini pantallas ---------- */
const FIG = (() => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('style', 'position:absolute;width:0;height:0;visibility:hidden'); s.innerHTML = `<path d="${HUMAN_PATH}"/>`; document.body.appendChild(s); let b = { x: 0, y: 0, width: 6400, height: 12800 }; try { const q = s.firstChild.getBBox(); if (q.height > 0) b = q; } catch (e) {} s.remove(); return b; })();
/* persona de 1,75 m: «cx» es el centro, «suelo» la línea de los pies y «k» los píxeles por metro */
const figura = (cx, suelo, k, relleno) => { const e = 1.75 * k / FIG.height; return `<g transform="translate(${cx - (FIG.x + FIG.width / 2) * e},${suelo + FIG.y * e}) scale(${e},${-e})" ${relleno}><path d="${HUMAN_PATH}"/></g>`; };
const COLS = ['#19b5b0', '#c264c8', '#62b85a', '#4b4bc8', '#c2c040', '#e0803a', '#3a9be0', '#d0507a', '#8a8f9a', '#40c090'];
function svgSim() {
  const { r, m } = R, W = 1000, H = 620, sueloY = 560, elev = E.elev / 100, altoTotal = Math.max(2.2, r.alto + elev + .35), anchoTotal = Math.max(r.ancho + 2.4, 3.4);
  const k = Math.min((sueloY - 70) / altoTotal, (W - 150) / anchoTotal), pw = r.ancho * k, ph = r.alto * k, px = W / 2 - pw / 2 + .45 * k, py = sueloY - elev * k - ph, hx = px - .7 * k;
  let g = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Simulación de la pantalla a escala con una persona de 1,75 m">`;
  g += `<defs><clipPath id="cp"><rect x="${px}" y="${py}" width="${pw}" height="${ph}"/></clipPath><linearGradient id="su" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>`;
  g += `<rect x="0" y="${sueloY}" width="${W}" height="${H - sueloY}" fill="url(#su)"/><line x1="30" y1="${sueloY}" x2="${W - 30}" y2="${sueloY}" stroke="#e9e9ee" stroke-opacity=".7" stroke-width="2"/>`;
  g += `<rect x="${px - 5}" y="${py - 5}" width="${pw + 10}" height="${ph + 10}" fill="#050506" rx="3"/><image href="../assets/SCCHART.jpg" x="${px}" y="${py}" width="${pw}" height="${ph}" preserveAspectRatio="none" clip-path="url(#cp)"/>`;
  for (let c = 1; c < r.cols; c++) g += `<line x1="${px + c * pw / r.cols}" y1="${py}" x2="${px + c * pw / r.cols}" y2="${py + ph}" stroke="#00ff04" stroke-opacity=".55" stroke-width="1"/>`;
  for (let f = 1; f < r.rows; f++) g += `<line x1="${px}" y1="${py + f * ph / r.rows}" x2="${px + pw}" y2="${py + f * ph / r.rows}" stroke="#00ff04" stroke-opacity=".55" stroke-width="1"/>`;
  g += figura(hx, sueloY, k, 'fill="#d5d5db" fill-opacity=".92"') + `<text x="${hx}" y="${sueloY + 30}" text-anchor="middle" font-size="22" fill="#e9e9ee" font-family="Share Tech Mono, monospace">1,75 m</text>`;
  const cota = (x1, y1, x2, y2, txt, vert) => { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, tw = txt.length * 13.4 + 22; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#37c8ff" stroke-width="1.6" stroke-dasharray="5 4"/><g transform="translate(${mx},${my})${vert ? ' rotate(90)' : ''}"><rect x="${-tw / 2}" y="-18" width="${tw}" height="36" rx="7" fill="#fff" stroke="#0090d0" stroke-width="2"/><text y="8" text-anchor="middle" font-size="24" fill="#005a8a" font-family="Share Tech Mono, monospace">${txt}</text></g>`; };
  g += cota(px, py - 30, px + pw, py - 30, 'ANCHO ' + fmt(r.ancho * 100) + ' cm') + cota(px + pw + 34, py, px + pw + 34, py + ph, 'ALTO ' + fmt(r.alto * 100) + ' cm', true);
  if (elev > 0.05) g += `<line x1="${px + pw / 2}" y1="${py + ph + 5}" x2="${px + pw / 2}" y2="${sueloY}" stroke="#c264ff" stroke-width="1.6" stroke-dasharray="3 4"/><text x="${px + pw / 2 + 8}" y="${(py + ph + sueloY) / 2 + 7}" font-size="22" fill="#e2b8ff" font-family="Share Tech Mono, monospace">${fmt(E.elev)} cm</text>`;
  return g + '</svg>';
}
function svgRejilla(tipo) {
  const { r, m } = R, W = 1000, H = 620, k = Math.min(900 / r.ancho, 440 / r.alto), pw = r.ancho * k, ph = r.alto * k, px = (W - pw) / 2, py = 22, cw = pw / r.cols, chh = ph / r.rows, n = tipo === 'senal' ? r.lineas : R.nLin;
  const de = tipo === 'senal' ? R.puerto : R.linea, tf = Math.max(9, Math.min(22, Math.min(cw, chh) * .42));
  let g = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${tipo === 'senal' ? 'Reparto de cabinets por puerto de datos' : 'Reparto de cabinets por línea eléctrica'}">`;
  for (let f = 0; f < r.rows; f++) for (let c = 0; c < r.cols; c++) { const i = de(c, f), col = COLS[i % COLS.length]; g += `<rect x="${px + c * cw + .6}" y="${py + (r.rows - 1 - f) * chh + .6}" width="${cw - 1.2}" height="${chh - 1.2}" fill="${col}" fill-opacity=".8" stroke="rgba(0,0,0,.35)"/>`;
    if (cw > 20 && chh > 16) g += `<text x="${px + c * cw + cw / 2}" y="${py + (r.rows - 1 - f) * chh + chh / 2 + tf * .36}" text-anchor="middle" font-size="${tf}" font-weight="800" fill="#0b0b10" fill-opacity=".72" font-family="Inter, sans-serif">${i + 1}</text>`; }
  const cols = Math.min(n, 4), lw = Math.min(236, 960 / cols), y0 = py + ph + 22;
  for (let i = 0; i < n && i < 12; i++) { const X = W / 2 - cols * lw / 2 + (i % cols) * lw, Y = y0 + Math.floor(i / cols) * 44, cabs = [...Array(r.cab).keys()].filter((q) => de(q % r.cols, Math.floor(q / r.cols)) === i).length;
    g += `<rect x="${X + 4}" y="${Y}" width="${lw - 8}" height="36" rx="7" fill="${COLS[i % COLS.length]}"/><text x="${X + lw / 2}" y="${Y + 25}" text-anchor="middle" font-size="21" font-weight="700" fill="#0b0b10" font-family="Share Tech Mono, monospace">${tipo === 'senal' ? 'P' : 'L'}${i + 1} · ${cabs} cab${tipo === 'senal' ? '' : ' · ' + fmt(cabs * R.ampCab, 1) + ' A'}</text>`; }
  if (n > 12) g += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="19" fill="currentColor" font-family="Inter, sans-serif">… y ${n - 12} más</text>`;
  return g + '</svg>';
}
function svgDistancia() {
  const { m, r } = R, W = 1000, H = 620, min = m.pitch, opt = m.pitch * 3, max = Math.max(opt * 1.6, 6), k = 820 / max, x0 = 110, sy = 470, ph = Math.min(300, r.alto * 60), tc = 'currentColor';
  const zona = (a, b, col, t) => `<rect x="${x0 + a * k}" y="${sy}" width="${(b - a) * k}" height="34" fill="${col}" fill-opacity=".4"/><text x="${x0 + (a + b) / 2 * k}" y="${sy + 23}" text-anchor="middle" font-size="16" font-weight="800" fill="${tc}" font-family="Inter, sans-serif">${t}</text>`;
  let g = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="color:var(--txt)" role="img" aria-label="Distancias de visionado">`;
  g += `<rect x="${x0 - 22}" y="${sy - ph - 30}" width="16" height="${ph}" fill="${tc}" fill-opacity=".85" rx="2"/><text x="${x0 - 14}" y="${sy - ph - 40}" text-anchor="middle" font-size="15" fill="${tc}" font-family="Share Tech Mono, monospace">LED P${m.pitch}</text>`;
  g += zona(0, min, '#ff4d5e', 'CERCA') + zona(min, opt, '#ffb000', 'ACEPTABLE') + zona(opt, max, '#00c408', 'ÓPTIMA');
  [[min, 'mínima ' + fmt(min * 100) + ' cm'], [opt, 'óptima desde ' + fmt(opt * 100) + ' cm']].forEach(([d, t], i) => { g += `<line x1="${x0 + d * k}" y1="${sy - 150 - i * 60}" x2="${x0 + d * k}" y2="${sy + 34}" stroke="${tc}" stroke-width="1.6" stroke-dasharray="5 4"/><text x="${x0 + d * k + 8}" y="${sy - 136 - i * 60}" font-size="19" fill="${tc}" font-family="Share Tech Mono, monospace">${t}</text>`; });
  g += figura(x0 + opt * k, sy, 62, `fill="${tc}" fill-opacity=".8"`);
  if (E.dist) g += `<line x1="${x0 + Math.min(E.dist, max) * k}" y1="${sy - 60}" x2="${x0 + Math.min(E.dist, max) * k}" y2="${sy + 50}" stroke="#a033ff" stroke-width="3"/><text x="${x0 + Math.min(E.dist, max) * k}" y="${sy + 72}" text-anchor="middle" font-size="17" font-weight="800" fill="#a033ff" font-family="Inter, sans-serif">tu público · ${fmt(E.dist, 1)} m</text>`;
  g += `<text x="${W / 2}" y="${H - 26}" text-anchor="middle" font-size="16" fill="${tc}" fill-opacity=".7" font-family="Inter, sans-serif">Regla práctica: 1 m por cada mm de pitch como mínimo; lo óptimo, desde el triple.</text>`;
  return g + '</svg>';
}
const VISTAS = [['senal', 'Señal', () => svgRejilla('senal'), () => 'Cableado de señal'],
  ['elec', 'Eléctrico', () => svgRejilla('elec'), () => 'Cableado eléctrico'],
  ['dist', 'Distancia', svgDistancia, () => 'Distancia de visionado']];

/* ---------- bloques ---------- */
const blk = (area, id, tit, ac, cuerpo, extra = '', cls = '') => `<section class="blk ${cls}" style="grid-area:${area};--ac:${ac}" data-blk="${id}"><header class="blk-cab"><b>${tit}</b><span class="sep"></span>${extra}<span class="id">${id}</span></header><div class="blk-cu">${cuerpo}</div></section>`;
const num = (k, lab, val, uni, paso) => `<div class="num"><label for="n-${k}">${lab}</label><input id="n-${k}" type="number" inputmode="decimal" data-num="${k}" value="${val}" step="${paso}" min="0"><span>${uni}</span><div class="pm"><button type="button" data-pm="${k}" data-d="1" tabindex="-1" aria-label="Subir ${lab}">▲</button><button type="button" data-pm="${k}" data-d="-1" tabindex="-1" aria-label="Bajar ${lab}">▼</button></div></div>`;
const dato = (k, v) => `<div class="dato"><span>${k}</span><b>${v}</b></div>`;
function pintaRejilla() {
  const el = $('#rejilla'); if (!el) return;
  const TIPOS = [['INDOOR', 'Interior'], ['OUTDOOR', 'Exterior'], ['ESCAPARATE', 'Escaparate']];
  let h = blk('m1a', 'M1A', 'Tamaño', 'var(--verde)', `<div class="fila">${num('w', 'Ancho', +E.w.toFixed(2), 'm', .1)}</div><div class="fila">${num('h', 'Alto', +E.h.toFixed(2), 'm', .1)}</div><div class="fila tres" role="group" aria-label="Ajustar el alto a un formato">${[['16:9', 9 / 16], ['4:3', 3 / 4], ['1:1', 1], ['9:16', 16 / 9]].map((f) => `<button type="button" class="tog" data-formato="${f[1]}" title="Pone el alto que corresponde a ${f[0]} con este ancho">${f[0]}</button>`).join('')}</div>` + (R && R.r ? `<div class="nota">Con cabinets enteros queda en <b style="color:var(--txt)">${fmt(R.r.ancho * 100)} × ${fmt(R.r.alto * 100)} cm</b>${Math.abs(R.r.sobra.w) > .01 || Math.abs(R.r.sobra.h) > .01 ? ' (' + (R.r.sobra.w >= 0 ? 'sobran ' : 'faltan ') + fmt(Math.abs(R.r.sobra.w) * 100) + ' × ' + fmt(Math.abs(R.r.sobra.h) * 100) + ' cm)' : ' · medida exacta'}</div>` : ''));
  h += blk('m1b', 'M1B', 'Entorno y uso', 'var(--azul)', `<div class="fila tres">${TIPOS.map((t) => tog(E.tipo === t[0], `data-set="tipo" data-v="${t[0]}"`, t[1])).join('')}</div><div class="fila">${tog(E.clase === 'INSTALL', 'data-set="clase" data-v="INSTALL"', 'Fija')}${tog(E.clase === 'RENTAL', 'data-set="clase" data-v="RENTAL"', 'Alquiler')}</div>` + (R && R.nits ? `<div class="nota">Brillo mínimo para este entorno: ${fmt(R.nits)} nits.</div>` : '') + (R && R.relajado ? `<div class="nota" style="color:var(--ambar)">${R.relajado}</div>` : ''));
  if (!R || R.vacio) {
    const msg = ESTADO === 'cargando' ? 'Cargando el catálogo…' : ESTADO === 'error' ? 'No se ha podido leer el catálogo. Comprueba la conexión y vuelve a cargar.' : 'No hay modelos en el catálogo para este entorno.';
    h += ['m2a', 'm2b', 's1a', 's1b', 'm3a', 'm3b', 'm3c', 'm3d', 'm3e', 'm3f'].map((a) => blk(a, a.toUpperCase(), '&nbsp;', 'var(--linea)', a === 's1a' ? `<div class="nota" style="margin:auto;font-size:calc(var(--u)*20)">${msg}</div>` : '', '', a[0] === 's' ? 'pant' : '')).join('');
    el.innerHTML = h; return;
  }
  const { m, r } = R, ip = R.pitches.indexOf(R.pitch), ORIG = { pedido: ['ok', 'Pedido por ti'], cercano: ['av', 'El más cercano a ' + E.pitch], distancia: ['ok', 'Por distancia · ' + fmt(E.dist, 1) + ' m'], auto: ['av', 'Automático · el más fino'], elegido: ['ok', 'Elegido a mano'] }[R.origen];
  h += blk('m2a', 'M2A', 'Pitch', 'var(--violeta)', `<div class="fila"><button type="button" class="ic-bt g" data-pitch="-1" aria-label="Pitch más fino" title="Pitch más fino" ${ip <= 0 ? 'disabled' : ''}>${IC.ant}</button><div class="gran" style="flex:1;text-align:center">${String(R.pitch).replace('.', ',')}<small>mm</small></div><button type="button" class="ic-bt g" data-pitch="1" aria-label="Pitch más grueso" title="Pitch más grueso" ${ip >= R.pitches.length - 1 ? 'disabled' : ''}>${IC.sig}</button></div><div class="fila envuelve"><span class="chip ${ORIG[0]}">${ORIG[1]}</span><span class="chip">${ip + 1} de ${R.pitches.length}</span></div>${num('dist', 'Público a', E.dist || '', 'm', .5)}<div class="nota">Si indicas a qué distancia está el público, se elige el pitch que se ve bien desde ahí.</div>`);
  const foto = m.urlFoto ? `<img src="${esc(m.urlFoto)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<div class="sinfoto">sin foto</div>';
  h += blk('m2b', 'M2B', 'Cabinet', 'var(--violeta)', `<select class="sel" data-crm aria-label="Modelo de cabinet">${R.delPitch.map((x) => `<option value="${esc(x.crm)}"${x.crm === m.crm ? ' selected' : ''}>${esc(x.crm)}${enStock(x) ? ' · stock' : ''}</option>`).join('')}</select><div class="cabmini">${foto}<div style="min-width:0;flex:1">${dato('Cabinet', `${m.cabAncho}×${m.cabAlto} mm`)}${dato('Píxeles', `${m.cabPixAncho}×${m.cabPixAlto}`)}${dato('Brillo', m.nits ? fmt(m.nits) + ' nits' : '—')}</div></div><div class="fila envuelve"><span class="chip ${enStock(m) ? 'ok' : 'no'}">${enStock(m) ? 'En stock' : 'Bajo pedido'}</span><span class="chip">${esc(m.family || '')}</span></div>`, bt('ojo', 'Ver la ficha completa del cabinet', 'data-ver="equipo"'));
  h += blk('s1a', 'S1A', 'Simulación a escala', 'var(--verde)', `<div class="lienzo" style="background-image:url(../assets/sim/${E.fondo}.jpg)">${svgSim()}<div class="fondos" role="group" aria-label="Fondo de la pared">${FONDOS.map((f) => `<button type="button" data-fondo="${f}" aria-pressed="${E.fondo === f}" aria-label="Fondo ${f.replace(/-/g, ' ')}" title="${f.replace(/-/g, ' ')}" style="background-image:url(../assets/sim/${f}-mini.jpg)"></button>`).join('')}</div></div>`, bt('ojo', 'Ver en grande', 'data-ver="sim"'), 'pant');
  const V = VISTAS[E.vista] || VISTAS[0];
  h += blk('s1b', 'S1B', V[3](), 'var(--azul)', `<div class="lienzo papel">${V[2]()}</div>`, `<div class="pestanas" role="group" aria-label="Qué se ve en esta pantalla">${VISTAS.map((v, i) => `<button type="button" data-vista="${i}" aria-pressed="${i === E.vista}">${v[1]}</button>`).join('')}</div>` + bt('ojo', 'Ver en grande', 'data-ver="vista"'), 'pant');
  const mcd = (a, b) => (b ? mcd(b, a % b) : a), q = mcd(Math.round(r.ancho * 1000), Math.round(r.alto * 1000)), fa = Math.round(r.ancho * 1000) / q, fb = Math.round(r.alto * 1000) / q, formato = fa <= 32 && fb <= 32 ? fa + ':' + fb : fmt(r.ancho / r.alto, 2) + ':1';
  h += blk('m3a', 'M3A', 'Dimensiones', 'var(--verde)', `<div class="gran">${fmt(r.ancho * 100)}<small>×</small> ${fmt(r.alto * 100)}<small>cm</small></div>${dato('Diagonal', fmt(R.diag * 100) + ' cm · ' + fmt(R.diag / .0254) + '″')}${dato('Formato', formato)}${dato('Superficie', fmt(r.ancho * r.alto, 2) + ' m²')}${dato('Fondo', m.thick ? fmt(m.thick) + ' mm' : '—')}`);
  const RES = [['HD', 1280, 720], ['FHD', 1920, 1080], ['4K', 3840, 2160], ['8K', 7680, 4320]];
  h += blk('m3b', 'M3B', 'Resolución', 'var(--azul)', `<div class="gran">${r.resW}<small>×</small> ${r.resH}<small>px</small></div><div class="res-chips">${RES.map((x) => `<span class="chip ${r.resW >= x[1] && r.resH >= x[2] ? 'ok' : 'no'}">${x[0]}</span>`).join('')}</div>${dato('Píxeles', fmt(r.pix / 1e6, 2) + ' Mpx')}${dato('Por cabinet', m.cabPixAncho + '×' + m.cabPixAlto)}${dato('Refresco', m.hz ? fmt(m.hz) + ' Hz' : '—')}`);
  const cs = Math.min(84 / r.cols, 84 / r.rows);
  h += blk('m3c', 'M3C', 'Cabinets', 'var(--violeta)', `<div class="fila"><div class="rej-cab" style="grid-template-columns:repeat(${r.cols},calc(var(--u) * ${cs.toFixed(2)}));grid-auto-rows:calc(var(--u) * ${(cs * Math.min(1.6, m.cabAlto / m.cabAncho)).toFixed(2)})">${'<i></i>'.repeat(Math.min(r.cab, 400))}</div><div class="gran" style="flex:1;text-align:right">${fmt(r.cab)}<small>ud</small></div></div>${dato('Rejilla', r.cols + ' de ancho × ' + r.rows + ' de alto')}${dato('Peso', fmt(r.peso, 1) + ' kg')}${dato('Por cabinet', m.cabKg ? fmt(m.cabKg, 1) + ' kg' : '—')}`);
  h += blk('m3d', 'M3D', 'Alimentación', 'var(--rojo)', `<div class="gran">${fmt(r.kw, 2)}<small>kW máx.</small></div>${dato('Corriente', fmt(r.cab * R.ampCab, 1) + ' A · 230 V')}${dato('Líneas de 16 A', R.nLin)}${dato('Por cabinet', (m.wMax ? fmt(m.wMax) + ' W' : '—') + (R.ampCab ? ' · ' + fmt(R.ampCab, 2) + ' A' : ''))}`, bt('ojo', 'Ver el reparto eléctrico', 'data-ver="elec"'));
  h += blk('m3e', 'M3E', 'Señal', 'var(--ambar)', `<div class="gran">${r.lineas}<small>línea${r.lineas > 1 ? 's' : ''} Ethernet</small></div>${dato('Backup', E.backup ? '+ ' + r.lineas + ' de reserva' : 'sin backup')}${dato('Conexión', E.conexion === 'directo' ? 'RJ45 directo' : 'fibra óptica')}${dato('Salidas 4K', r.salidas4k)}${dato('Tarjeta', esc(m.card || '—'))}`, bt('ojo', 'Ver el cableado de señal', 'data-ver="senal"'));
  const p = R.proc, me = R.media;
  h += blk('m3f', 'M3F', 'Electrónica', 'var(--verde)', (p ? `<div style="font-weight:800;font-size:calc(var(--u)*19);line-height:1.15">${esc(p.modelo)}<div class="nota">${esc(p.marca)} · ${p.escalador ? 'con escalador' : 'sin escalador'}</div></div>${dato('Puertos', esc(p.puertos))}` : '<div class="nota">Sin procesador que cubra este proyecto con estas opciones: cambia la conexión o el backup en los ajustes.</div>') + (me ? dato('Mediaserver', esc(me.modelo)) : dato('Mediaserver', 'no pedido')) + (R.procs.length > 1 ? `<div class="nota">${R.procs.length} procesadores posibles: ábrelos con el ojo.</div>` : ''), bt('ojo', 'Ver la electrónica completa', 'data-ver="equipo"'));
  el.innerHTML = h;
}
function pintaPie() {
  const p = $('#pie-c'); if (!p) return;
  p.innerHTML = R && R.r ? `<span class="pie-txt"><b>PANTALLA LED ${esc(R.m.crm)}</b> · ${fmt(R.r.ancho * 100)} × ${fmt(R.r.alto * 100)} cm · ${fmt(R.diag / .0254)}″ · ${R.r.cols}×${R.r.rows} = ${R.r.cab} cabinets · ${R.r.resW}×${R.r.resH} px · ${fmt(R.r.peso)} kg · ${fmt(R.r.kw, 2)} kW · ${R.r.lineas} línea${R.r.lineas > 1 ? 's' : ''}</span>` : '<span class="pie-txt">Escribe la pantalla que necesitas o rellena los bloques de la izquierda.</span>';
  $('#pie-l').innerHTML = `<i class="led-est ${ESTADO === 'vivo' ? 'ok' : ESTADO === 'error' ? 'mal' : ''}"></i><span class="pie-txt">${{ cargando: 'Leyendo el catálogo…', cache: 'Catálogo guardado · actualizando', vivo: 'Catálogo en vivo · ' + CAT.length + ' modelos', error: 'Sin catálogo' }[ESTADO]}</span>`;
}
function todo() { calcula(); pintaRejilla(); pintaPie(); guarda(); }

/* ---------- ventana grande (el ojo) y ajustes (la ruedita) ---------- */
let VENT = null;
function abre(que) {
  const v = $('#velo');
  if (que === 'ajustes') {
    const f = (lab, sub, html) => `<label>${lab}<small>${sub}</small></label><div class="fila">${html}</div>`;
    v.innerHTML = `<div class="vent ajustes" role="dialog" aria-modal="true" aria-label="Ajustes"><div class="vent-cab">${IC.rueda.replace('<svg', '<svg style="width:1.2em;height:1.2em"')} Ajustes<span class="sep"></span>${bt('x', 'Cerrar', 'data-cierra')}</div><div class="vent-cu"><div class="aj">` +
      f('Backup de señal', 'Duplica las líneas de datos', tog(E.backup, 'data-set="backup" data-v="1"', 'Con backup') + tog(!E.backup, 'data-set="backup" data-v=""', 'Sin backup')) +
      f('Escalador', 'El procesador adapta la señal', tog(E.escalador === 'con', 'data-set="escalador" data-v="con"', 'Con') + tog(E.escalador === 'sin', 'data-set="escalador" data-v="sin"', 'Sin') + tog(E.escalador === 'indiferente', 'data-set="escalador" data-v="indiferente"', 'Da igual')) +
      f('Conexión a la pantalla', 'Del procesador a los cabinets', tog(E.conexion === 'directo', 'data-set="conexion" data-v="directo"', 'RJ45 directo') + tog(E.conexion === 'fibra', 'data-set="conexion" data-v="fibra"', 'Fibra')) +
      f('Mediaserver', 'Servidor de contenidos', tog(E.marca === 'ninguno', 'data-set="marca" data-v="ninguno"', 'No') + tog(E.marca === 'todos', 'data-set="marca" data-v="todos"', 'Sí')) +
      f('Ajuste a la medida', 'Cómo se redondea a cabinets enteros', tog(E.ajuste === 'dentro', 'data-set="ajuste" data-v="dentro"', 'Que quepa') + tog(E.ajuste === 'cerca', 'data-set="ajuste" data-v="cerca"', 'Lo más cercano')) +
      f('Elevación del suelo', 'Borde inferior de la pantalla', num('elev', 'Altura', E.elev, 'cm', 10)) +
      f('Tema', 'Aspecto de la interfaz', tog(E.tema === 'oscuro', 'data-set="tema" data-v="oscuro"', 'Oscuro') + tog(E.tema === 'claro', 'data-set="tema" data-v="claro"', 'Gris claro')) +
      `</div><div class="fila" style="justify-content:flex-end"><button type="button" class="tog" style="flex:none" data-reset>Restablecer</button></div></div></div>`;
    VENT = { que };
  } else {
    const LISTA = R && R.r ? [['sim', 'Simulación a escala', () => `<div class="lienzo" style="background-image:url(../assets/sim/${E.fondo}.jpg)">${svgSim()}</div>`], ['senal', VISTAS[0][3](), () => `<div class="lienzo papel">${VISTAS[0][2]()}</div>`], ['elec', VISTAS[1][3](), () => `<div class="lienzo papel">${VISTAS[1][2]()}</div>`], ['dist', VISTAS[2][3](), () => `<div class="lienzo papel">${VISTAS[2][2]()}</div>`], ['equipo', 'Equipos del proyecto', fichas]] : [];
    if (!LISTA.length) return; if (que === 'vista') que = VISTAS[E.vista][0];
    let i = Math.max(0, LISTA.findIndex((x) => x[0] === que)); VENT = { que: 'visor', LISTA, i };
    const pinta = () => { const x = VENT.LISTA[VENT.i]; v.innerHTML = `<div class="vent" role="dialog" aria-modal="true" aria-label="${esc(x[1])}"><div class="vent-cab">${esc(x[1])}<span class="sep"></span><span class="nota">${VENT.i + 1} / ${VENT.LISTA.length}</span>${bt('ant', 'Anterior', 'data-paso="-1"')}${bt('sig', 'Siguiente', 'data-paso="1"')}${bt('x', 'Cerrar', 'data-cierra')}</div><div class="vent-cu">${x[2]()}</div></div>`; };
    VENT.pinta = pinta; pinta();
  }
  v.classList.add('on'); const c = v.querySelector('[data-cierra]'); if (c) c.focus();
}
function cierra() { $('#velo').classList.remove('on'); $('#velo').innerHTML = ''; VENT = null; }
function fichas() {
  const { m } = R, f = [];
  f.push(FICHA.fichaHTML({ cat: 'Cabinet LED', icono: 'led', marca: m.family || '', modelo: m.crm, foto: m.urlFoto, fotoTrasera: m.urlFotoTrasera || m.urlTrasera || m.urlFoto2, vistas: m.fotos, acento: '#b566ff', stock: enStock(m),
    specs: [['Pitch', m.pitch + ' mm'], ['Cabinet', `${m.cabAncho}×${m.cabAlto}${m.thick ? '×' + m.thick : ''} mm`], ['Píxeles', `${m.cabPixAncho}×${m.cabPixAlto}`], ['Brillo', m.nits ? m.nits + ' nits' : ''], ['Refresco', m.hz ? m.hz + ' Hz' : ''], ['Peso', m.cabKg ? fmt(m.cabKg, 1) + ' kg' : ''], ['Consumo máx.', m.wMax ? fmt(m.wMax) + ' W' : ''], ['Tarjeta', m.card || ''], ['Tecnología', m.tech || '']],
    enlace: m.crm ? 'https://traulux.net/buscar/?q=' + encodeURIComponent(m.crm) : '', enlaceTxt: 'Ficha del fabricante' }));
  R.procs.slice(0, 4).forEach((x, i) => f.push(FICHA.fichaHTML({ cat: i ? 'Procesador alternativo' : 'Procesador recomendado', icono: 'elec', marca: x.marca, modelo: x.modelo, foto: x.front, fotoTrasera: x.back, acento: '#00ff04', stock: x.enStock ? true : null, sel: !i,
    specs: [['Puertos', x.puertos], ['Capacidad', x.capacidad], ['Escalador', x.escalador ? 'Sí' : 'No']], piezas: (x.equipos || []).map((q) => ({ cant: q.cant, ref: q.ref, desc: q.desc })), enlace: x.url, enlaceTxt: 'Ficha del fabricante' })));
  if (R.media) f.push(FICHA.fichaHTML({ cat: 'Mediaserver', icono: 'media', marca: R.media.marca, modelo: R.media.modelo, foto: R.media.front, fotoTrasera: R.media.back, acento: '#ffb000', specs: [['Salidas 4K', R.media.out4k], ['Necesarias', R.r.salidas4k]], notas: [R.media.resumen], enlace: R.media.url, enlaceTxt: 'Ficha del fabricante' }));
  return `<div class="fichas-v">${f.join('')}</div>`;
}

/* ---------- plantilla fija y eventos ---------- */
function monta() {
  document.documentElement.dataset.tema = E.tema;
  $('#app').innerHTML = `<div class="blocks">
    <header class="franja f-h1"><div data-blk="H1L"><a href="../" title="SCREENS · versión clásica" style="display:flex"><img class="logo inv" src="../assets/screens-logo.svg" alt="SCREENS"></a><span class="chip av">BLOCKS · beta</span></div>
      <nav data-blk="H1C" class="fam" aria-label="Familia AVHUB"><a href="https://systems.mediaservi.com/"><img class="inv" src="../assets/fam/systems-logo.svg" alt="SYSTEMS"></a><a href="https://adposter.mediaservi.com/"><img class="inv" src="../assets/fam/adposter-logo.svg" alt="ADPOSTER"></a><a class="av" href="https://avhub.mediaservi.com/"><img src="../assets/avhub-logo.svg" alt="AVHUB"></a><a href="https://vjshow.mediaservi.com/"><img class="inv" src="../assets/fam/vjshow-logo.svg" alt="VJSHOW"></a><a href="https://msgame.mediaservi.com/"><img src="../assets/fam/msgame-logo.svg" alt="MSGAME"></a></nav>
      <div data-blk="H1R" class="h1r"><a class="ic-bt g" href="../" title="Versión clásica (con PDF)" aria-label="Versión clásica (con PDF)">${IC.clasico}</a><a class="ic-bt g" href="https://avhub.mediaservi.com/" title="AVHUB" aria-label="AVHUB">${IC.casa}</a>${bt('tema', 'Cambiar entre oscuro y gris claro', 'data-cambiatema', 'g')}${bt('rueda', 'Ajustes', 'data-ver="ajustes"', 'g')}</div></header>
    <div class="franja f-hm"><div data-blk="HM1"><div class="fila" style="flex:1">${tog(true, 'data-nada', 'Una')}<a class="tog" href="../" style="text-decoration:none">Varias</a></div><div class="fila" style="flex:1">${tog(true, 'data-nada', 'LED')}<a class="tog" href="../" style="text-decoration:none">Proyección</a></div></div>
      <div data-blk="HM2"><input class="pide" id="pide" type="text" autocomplete="off" spellcheck="false" placeholder="Escríbela: «pantalla de 3 x 4 para exterior 3.9p a 8 m»" aria-label="Describe la pantalla" value="${esc(E.texto)}"></div>
      <div data-blk="HM3"><button type="button" class="calcular" id="calcular">CALCULAR →</button></div></div>
    <main class="rejilla" id="rejilla"></main>
    <footer class="franja f-f1"><div data-blk="F1L" id="pie-l"></div><div data-blk="F1C" id="pie-c"></div><div data-blk="F1R" style="justify-content:flex-end"><span class="nota" style="text-align:right">Cálculo automático: verifícalo antes de presupuestar.</span></div></footer>
    <div class="f-cred">${esc(VERSION)} · 2026 · es un proyecto hecho con ♥ by mediaservi.com · <a href="../LEGAL.md">Aviso legal</a></div>
  </div><div class="velo" id="velo"></div><div class="aviso-movil">BLOCKS beta está pensada de momento para ordenador y pantalla apaisada.</div>`;
  const pide = () => { E.texto = $('#pide').value; const v = interpreta(E.texto); todo(); if (E.texto.trim() && !v.length) $('#pie-c').innerHTML = '<span class="pie-txt" style="color:var(--ambar)">No he entendido la petición: prueba con «3 x 2 interior» o rellena los bloques.</span>'; };
  $('#calcular').onclick = pide; $('#pide').addEventListener('keydown', (e) => { if (e.key === 'Enter') pide(); });
  const pon = (k, v) => { if (k === 'backup') E.backup = !!v; else E[k] = v; if (k === 'tipo' || k === 'clase') E.crm = ''; if (k === 'tema') document.documentElement.dataset.tema = v; todo(); if (VENT && VENT.que === 'ajustes') abre('ajustes'); };
  document.addEventListener('click', (e) => { const q = (s) => e.target.closest(s); let b;
    if ((b = q('[data-set]'))) pon(b.dataset.set, b.dataset.v);
    else if ((b = q('[data-pitch]'))) { const i = R.pitches.indexOf(R.pitch) + +b.dataset.pitch; if (R.pitches[i] != null) { E.pitch = R.pitches[i]; E.crm = ''; todo(); } }
    else if ((b = q('[data-pm]'))) { const k = b.dataset.pm, paso = k === 'elev' ? 10 : k === 'dist' ? .5 : .1; E[k] = Math.max(k === 'w' || k === 'h' ? .1 : 0, +((+E[k] || 0) + paso * +b.dataset.d).toFixed(2)); if (k === 'dist') { E.pitch = 0; E.crm = ''; } todo(); if (VENT && VENT.que === 'ajustes') abre('ajustes'); }
    else if ((b = q('[data-formato]'))) { E.h = Math.max(.1, +(E.w * +b.dataset.formato).toFixed(2)); todo(); }
    else if ((b = q('[data-fondo]'))) { E.fondo = b.dataset.fondo; todo(); }
    else if ((b = q('[data-vista]'))) { E.vista = +b.dataset.vista; todo(); }
    else if ((b = q('[data-ver]'))) abre(b.dataset.ver);
    else if ((b = q('[data-cambiatema]'))) pon('tema', E.tema === 'oscuro' ? 'claro' : 'oscuro');
    else if ((b = q('[data-paso]'))) { VENT.i = (VENT.i + +b.dataset.paso + VENT.LISTA.length) % VENT.LISTA.length; VENT.pinta(); }
    else if (q('[data-reset]')) { Object.assign(E, { backup: true, escalador: 'con', conexion: 'directo', marca: 'ninguno', ajuste: 'dentro', elev: 100 }); todo(); abre('ajustes'); }
    else if (q('[data-cierra]') || e.target.id === 'velo') cierra(); });
  document.addEventListener('change', (e) => { const t = e.target;
    if (t.dataset.num) { const k = t.dataset.num, v = parseFloat(String(t.value).replace(',', '.')); if (k === 'dist') { E.dist = v > 0 ? v : 0; E.pitch = 0; E.crm = ''; } else if (v >= 0) E[k] = k === 'elev' ? v : Math.max(.1, v); todo(); if (VENT && VENT.que === 'ajustes') abre('ajustes'); }
    else if (t.dataset.crm !== undefined) { E.crm = t.value; todo(); } });
  document.addEventListener('keydown', (e) => { if (!VENT) return; if (e.key === 'Escape') cierra(); else if (VENT.que === 'visor' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { VENT.i = (VENT.i + (e.key === 'ArrowRight' ? 1 : -1) + VENT.LISTA.length) % VENT.LISTA.length; VENT.pinta(); } });
}
monta(); todo();
cargarCatalogo((lista, origen) => { if (origen === 'error') { if (!CAT.length) ESTADO = 'error'; } else { CAT = lista; ESTADO = origen; } todo(); });
window.__blocks = { E, get R() { return R; }, todo };
