/* SCREENS · una pantalla LED en BLOCKS (beta) · mediaservi.com · GPL-3.0
   Misma lógica de cálculo que la consola (screens/led.js, comun/electronica.js) y el mismo catálogo en vivo (screens/catalogo.js);
   aquí solo cambia cómo se presenta: cada dato tiene su bloque fijo y no hay desplazamiento de página. */
import { cargarCatalogo, ordenar, enStock } from '../screens/catalogo.js';
import { calcularLed, lineasCosido, PX_PUERTO } from '../screens/led.js';
import { HUMAN_PATH } from '../screens/figura.js';
import '../comun/electronica.js';
import '../comun/ficha.js';
import '../comun/voz.js';
const ELEC = globalThis.SC_ELEC, FICHA = globalThis.SC_FICHA, VERSION = 'BLOCKS beta 7 · SCREENS v10.9';
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
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/></svg>',
  audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5"/></svg>',
  copia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  contenido: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 15l-5-5-8 9"/></svg>',
  carta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  una: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>',
  varias: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6l6 2v9l-6 2zM22 6l-6 2v9l6 2zM8 8h8v9H8z"/></svg>',
  led: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 12h18M9 5v14M15 5v14"/></svg>',
  proy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="9" height="7" rx="1.5"/><path d="M11 11l10-5v13l-10-5"/><circle cx="6.5" cy="12.5" r="1.5"/></svg>',
  regla: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/></svg>',
  entorno: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M6 10v9h12v-9M10 19v-5h4v5"/></svg>',
  pitch: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  cabinet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M4 9h16M4 15h16M12 3v18"/></svg>',
  sim: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="4" width="13" height="10" rx="1"/><circle cx="4.5" cy="11" r="1.7"/><path d="M4.5 13v7M2.5 20h4"/></svg>',
  cable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h5v4a3 3 0 0 0 3 3 3 3 0 0 1 3 3v2h5"/><circle cx="4" cy="6" r="1.5"/><circle cx="20" cy="18" r="1.5"/></svg>',
  dims: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V4M4 20h16M8 8h10v8H8z"/></svg>',
  res: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="13" rx="1.5"/><path d="M8 21h8M8 9h3v3H8zM13 12h3v3h-3z"/></svg>',
  cabs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>',
  rayo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 5 13h6l-1 9 8-12h-6z"/></svg>',
  red: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="11" rx="1.5"/><path d="M8 17v3h8v-3M8 10v3M11 10v3M14 10v3M17 10v3"/></svg>',
  chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
  clasico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>' };
const bt = (ic, tit, attrs = '', cls = '') => `<button type="button" class="ic-bt ${cls}" title="${esc(tit)}" aria-label="${esc(tit)}" ${attrs}>${IC[ic]}</button>`;
const tog = (on, attrs, txt, ic) => `<button type="button" class="tog" aria-pressed="${!!on}" ${attrs}>${ic ? IC[ic] : ''}${txt}</button>`;

/* ---------- estado ---------- */
const GUARDA = 'screens-blocks-1';
const E = Object.assign({ w: 3, h: 2, tipo: 'INDOOR', clase: 'INSTALL', pitch: 0, dist: 0, crm: '', elev: 100, fondo: 'hormigon', cosido: 'auto', backup: true, escalador: 'con', conexion: 'directo', marca: 'ninguno', ajuste: 'dentro', vista: 0, tema: 'oscuro', texto: '' },
  (() => { try { return JSON.parse(localStorage.getItem(GUARDA) || '{}'); } catch (e) { return {}; } })());
let CAT = [], ESTADO = 'cargando', R = null;   /* R: resultado del cálculo en curso */
const guarda = () => { try { localStorage.setItem(GUARDA, JSON.stringify(E)); } catch (e) {} };
/* fuentes multimedia de prueba: las mismas de la versión clásica (la primera es fija; las otras cinco se editan y se guardan en este navegador, compartidas con la clásica) */
const FUENTE_FIJA = 'https://www.youtube.com/playlist?list=PLe5oQrtGOkLA';
const FUENTES_DEF = ['https://www.youtube.com/watch?v=ROboUHfPUrU', 'https://www.youtube.com/live/b4tE5aKhtlg', 'https://www.youtube.com/live/Qr61waJ6AZg', 'https://www.youtube.com/live/VlcwKEDOgOk', 'https://www.youtube.com/live/ewBqZHS9iG8'];
let FU = FUENTES_DEF.slice(), FSEL = 0, URLP = '';
try { const v = JSON.parse(localStorage.getItem('screens_fuentes_v2') || 'null'); if (Array.isArray(v) && v.length === 5) FU = v.map(String); } catch (e) {}
const YT = '&autoplay=1&mute=1&playsinline=1&rel=0&controls=0&disablekb=1&fs=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&showinfo=0&loop=1';
/* de un enlace cualquiera a lo que hay que pintar: imagen, vídeo o reproductor incrustado (YouTube, Vimeo u otra página) */
function deEnlace(u) {
  u = String(u || '').trim(); if (!u) return null; if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  if (/\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i.test(u)) return { url: u, tipo: 'img' };
  if (/\.(mp4|webm|ogv|mov|m4v)(\?|#|$)/i.test(u)) return { url: u, tipo: 'video' };
  const li = u.match(/youtube\.com\/(?:playlist|watch)\?[^\s]*list=([A-Za-z0-9_-]+)/), vl = u.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (li && vl) return { url: `https://www.youtube.com/embed/${vl[1]}?list=${li[1]}${YT}`, tipo: 'marco' };
  if (li) return { url: `https://www.youtube.com/embed/videoseries?list=${li[1]}${YT}`, tipo: 'marco' };
  const y = u.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (y) return { url: `https://www.youtube.com/embed/${y[1]}?playlist=${y[1]}${YT}`, tipo: 'marco' };
  const vm = u.match(/vimeo\.com\/(?:.*\/)?(\d+)/); if (vm) return { url: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1&loop=1&controls=0&background=1`, tipo: 'marco' };
  return { url: u, tipo: 'marco' };
}
const sueltaCont = () => { if (CONT && /^blob:/.test(CONT.url)) URL.revokeObjectURL(CONT.url); };
let CONT = null;   /* contenido propio que se simula en la pantalla: { url, tipo: 'img' | 'video' } */
const SUELO = { hormigon: '#bfe6d8', madera: '#bcd9f2', marmol: '#f2c9d4', 'ladrillo-rojo': '#c7e8c0', 'ladrillo-oscuro': '#f3e3a8', 'ladrillo-claro': '#c9c6f0' };
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
  /* cosido de la señal, igual que el configurador clásico (planCosido): columnas o filas ENTERAS por puerto; automático elige lo que menos líneas pide (a igualdad, vertical) */
  const cabPuerto = Math.max(1, Math.floor(PX_PUERTO / pixCab)), colsPP = Math.floor(cabPuerto / r.rows), filasPP = Math.floor(cabPuerto / r.cols);
  const opV = colsPP >= 1 ? Math.ceil(r.cols / colsPP) : 0, opH = filasPP >= 1 ? Math.ceil(r.rows / filasPP) : 0;
  let cosido = E.cosido === 'vertical' && opV ? 'vertical' : E.cosido === 'horizontal' && opH ? 'horizontal' : opV && opH ? (opH < opV ? 'horizontal' : 'vertical') : opV ? 'vertical' : opH ? 'horizontal' : 'serpentina';
  const cosidoNo = E.cosido !== 'auto' && E.cosido !== cosido;
  r.lineas = cosido === 'vertical' ? opV : cosido === 'horizontal' ? opH : Math.ceil(r.cab / cabPuerto);
  /* orden en que el cable recorre los cabinets de cada puerto (f = 0 es la fila de abajo) */
  const rutas = Array.from({ length: r.lineas }, () => []);
  if (cosido === 'vertical') for (let c = 0; c < r.cols; c++) { const j = c % colsPP; for (let q = 0; q < r.rows; q++) rutas[Math.floor(c / colsPP)].push([c, j % 2 ? r.rows - 1 - q : q]); }
  else if (cosido === 'horizontal') for (let f = 0; f < r.rows; f++) { const j = f % filasPP; for (let q = 0; q < r.cols; q++) rutas[Math.floor(f / filasPP)].push([j % 2 ? r.cols - 1 - q : q, f]); }
  else for (let f = 0, n = 0; f < r.rows; f++) for (let q = 0; q < r.cols; q++, n++) rutas[Math.floor(n / cabPuerto)].push([f % 2 ? r.cols - 1 - q : q, f]);
  const dePuerto = {}; rutas.forEach((ru, i) => ru.forEach(([c, f]) => { dePuerto[c + '_' + f] = i; }));
  const procs = ELEC.calcularElectronicas({ lines: r.lineas, totalPix: r.pix, porSup: null }, { backup: E.backup, escalador: E.escalador, conexion: E.conexion, entradas: 0 }, []);
  const medias = E.marca === 'ninguno' ? [] : ELEC.calcularMediaservers({ totalPix: Math.max(1, r.salidas4k) * ELEC.ELEC_PX_4K, resW: r.resW, resH: r.resH }, { marca: E.marca, dante: false });
  const vert = cosido === 'vertical', puerto = (c, f) => dePuerto[c + '_' + f] || 0;
  const ampCab = Number(m.cabAmp) || (m.wMax ? m.wMax / 230 : 0), cabLinea = ampCab > 0 ? Math.max(1, Math.floor(16 / ampCab)) : r.cab, colsPL = Math.floor(cabLinea / r.rows);
  const linea = (c, f) => (colsPL >= 1 ? Math.floor(c / colsPL) : Math.floor((c * r.rows + f) / cabLinea));
  const nLin = colsPL >= 1 ? Math.ceil(r.cols / colsPL) : Math.ceil(r.cab / cabLinea);
  R = { m, r, lista, pitches, pitch, origen, delPitch, relajado, procs, proc: procs[0] || null, medias, media: medias[0] || null, puerto, linea, nLin, ampCab, vert, nits, cosido, cosidoNo, rutas, cabPuerto,
    diag: Math.hypot(r.ancho, r.alto), lineasTxt: lineasCosido(r.cols, r.rows, pixCab) };
}

/* ---------- dibujos de las mini pantallas ---------- */
const FIG = (() => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('style', 'position:absolute;width:0;height:0;visibility:hidden'); s.innerHTML = `<path d="${HUMAN_PATH}"/>`; document.body.appendChild(s); let b = { x: 0, y: 0, width: 6400, height: 12800 }; try { const q = s.firstChild.getBBox(); if (q.height > 0) b = q; } catch (e) {} s.remove(); return b; })();
/* persona de 1,75 m: «cx» es el centro, «suelo» la línea de los pies y «k» los píxeles por metro */
const figura = (cx, suelo, k, relleno) => { const e = 1.75 * k / FIG.height; return `<g transform="translate(${cx - (FIG.x + FIG.width / 2) * e},${suelo + FIG.y * e}) scale(${e},${-e})" ${relleno}><path d="${HUMAN_PATH}"/></g>`; };
const COLS = ['#19b5b0', '#c264c8', '#62b85a', '#4b4bc8', '#c2c040', '#e0803a', '#3a9be0', '#d0507a', '#8a8f9a', '#40c090'];
/* medida real de lo que abarca cada textura de pared (ancho × alto en metros): así los ladrillos, las lamas y las losas salen a la misma escala que la pantalla y la persona, se vea la simulación al tamaño que se vea */
const PARED = { hormigon: [3.6, 2.39, 1], madera: [.48, .53], marmol: [2.4, 2.4], 'ladrillo-rojo': [1, .64], 'ladrillo-oscuro': [1, .912], 'ladrillo-claro': [1, .64] };
function svgSim() {
  const { r, m } = R, W = 1000, H = 620, sueloY = 560, elev = E.elev / 100, altoTotal = Math.max(2.2, r.alto + elev + .35), anchoTotal = Math.max(r.ancho + 2.4, 3.4);
  const k = Math.min((sueloY - 70) / altoTotal, (W - 150) / anchoTotal), pw = r.ancho * k, ph = r.alto * k, px = W / 2 - pw / 2 + .45 * k, py = sueloY - elev * k - ph, hx = px - .7 * k;
  let g = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Simulación de la pantalla a escala con una persona de 1,75 m">`;
  g += `<defs><clipPath id="cp"><rect x="${px}" y="${py}" width="${pw}" height="${ph}"/></clipPath></defs>`;
  { const t = PARED[E.fondo] || PARED.hormigon, tw = t[0] * k, th = t[1] * k, u = `../assets/sim/${E.fondo}.jpg`, im = (tr) => `<image href="${u}" width="${tw + .6}" height="${th + .6}" preserveAspectRatio="none"${tr ? ` transform="${tr}"` : ''}/>`;
    /* el hormigón no es una textura continua: se repite en espejo para que no se vean las juntas */
    g += `<defs><pattern id="pared" patternUnits="userSpaceOnUse" x="${W / 2}" y="${sueloY - th * (t[2] ? 2 : 1)}" width="${tw * (t[2] ? 2 : 1)}" height="${th * (t[2] ? 2 : 1)}">${t[2] ? im() + im(`translate(${2 * tw},0) scale(-1,1)`) + im(`translate(0,${2 * th}) scale(1,-1)`) + im(`translate(${2 * tw},${2 * th}) scale(-1,-1)`) : im()}</pattern></defs><rect x="-4000" y="-4000" width="9000" height="${4000 + sueloY}" fill="url(#pared)"/>`; }
  /* el suelo es una banda de color pastel que contrasta con la pared, no una continuación de su textura */
  g += `<rect data-suelo x="-4000" y="${sueloY}" width="9000" height="900" fill="${SUELO[E.fondo] || '#bfe6d8'}"/><rect x="-4000" y="${sueloY}" width="9000" height="5" fill="#000" fill-opacity=".28"/>`;
  g += `<rect x="${px - 5}" y="${py - 5}" width="${pw + 10}" height="${ph + 10}" fill="#050506" rx="3"/>` + (CONT && CONT.tipo === 'marco' ? (() => { const e = Math.max(pw / 16, ph / 9), iw = 16 * e, ih = 9 * e; return `<foreignObject x="${px}" y="${py}" width="${pw}" height="${ph}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;overflow:hidden;position:relative;background:#000"><iframe src="${esc(CONT.url)}" title="Contenido simulado" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;left:${(pw - iw) / 2}px;top:${(ph - ih) / 2}px;width:${iw}px;height:${ih}px;border:0;pointer-events:none"></iframe></div></foreignObject>`; })() : CONT && CONT.tipo === 'video' ? `<foreignObject x="${px}" y="${py}" width="${pw}" height="${ph}"><video src="${CONT.url}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;display:block;background:#000"></video></foreignObject>` : `<image href="${CONT ? CONT.url : '../assets/SCCHART.jpg'}" x="${px}" y="${py}" width="${pw}" height="${ph}" preserveAspectRatio="${CONT ? 'xMidYMid slice' : 'none'}" clip-path="url(#cp)"/>`);
  if (!CONT) for (let c = 1; c < r.cols; c++) g += `<line x1="${px + c * pw / r.cols}" y1="${py}" x2="${px + c * pw / r.cols}" y2="${py + ph}" stroke="#d4ff00" stroke-opacity=".55" stroke-width="1"/>`;
  if (!CONT) for (let f = 1; f < r.rows; f++) g += `<line x1="${px}" y1="${py + f * ph / r.rows}" x2="${px + pw}" y2="${py + f * ph / r.rows}" stroke="#d4ff00" stroke-opacity=".55" stroke-width="1"/>`;
  g += figura(hx, sueloY, k, /marmol|claro/.test(E.fondo) ? 'fill="#3f4149" fill-opacity=".9"' : 'fill="#d5d5db" fill-opacity=".92" stroke="#1c1d22" stroke-opacity=".6" stroke-width="1.5" vector-effect="non-scaling-stroke"') + `<text x="${hx}" y="${sueloY + 32}" text-anchor="middle" font-size="22" fill="#1c1d22" font-family="Share Tech Mono, monospace">1,75 m</text>`;
  const cota = (x1, y1, x2, y2, txt, vert) => { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, tw = txt.length * 13.4 + 22; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#37c8ff" stroke-width="1.6" stroke-dasharray="5 4"/><g transform="translate(${mx},${my})${vert ? ' rotate(90)' : ''}"><rect x="${-tw / 2}" y="-18" width="${tw}" height="36" rx="7" fill="#fff" stroke="#0090d0" stroke-width="2"/><text y="8" text-anchor="middle" font-size="24" fill="#005a8a" font-family="Share Tech Mono, monospace">${txt}</text></g>`; };
  g += cota(px, py - 30, px + pw, py - 30, 'ANCHO ' + fmt(r.ancho * 100) + ' cm') + cota(px + pw + 34, py, px + pw + 34, py + ph, 'ALTO ' + fmt(r.alto * 100) + ' cm', true);
  if (elev > 0.05) g += `<line x1="${px + pw / 2}" y1="${py + ph + 5}" x2="${px + pw / 2}" y2="${sueloY}" stroke="#c264ff" stroke-width="1.6" stroke-dasharray="3 4"/><text x="${px + pw / 2 + 8}" y="${(py + ph + sueloY) / 2 + 7}" font-size="22" fill="#e2b8ff" font-family="Share Tech Mono, monospace">${fmt(E.elev)} cm</text>`;
  return g + '</svg>';
}
function svgRejilla(tipo) {
  const { r, m } = R, W = 1000, H = 620, sen = tipo === 'senal', py = sen ? 66 : 22, k = Math.min(900 / r.ancho, (462 - py) / r.alto), pw = r.ancho * k, ph = r.alto * k, px = (W - pw) / 2, cw = pw / r.cols, chh = ph / r.rows, n = tipo === 'senal' ? r.lineas : R.nLin;
  const de = tipo === 'senal' ? R.puerto : R.linea, tf = Math.max(9, Math.min(22, Math.min(cw, chh) * .42));
  let g = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${tipo === 'senal' ? 'Reparto de cabinets por puerto de datos' : 'Reparto de cabinets por línea eléctrica'}">`;
  for (let f = 0; f < r.rows; f++) for (let c = 0; c < r.cols; c++) { const i = de(c, f), col = COLS[i % COLS.length]; g += `<rect x="${px + c * cw + .6}" y="${py + (r.rows - 1 - f) * chh + .6}" width="${cw - 1.2}" height="${chh - 1.2}" fill="${col}" fill-opacity=".8" stroke="rgba(0,0,0,.35)"/>`;
    if (cw > 20 && chh > 16) g += `<text x="${sen ? px + c * cw + cw * .2 : px + c * cw + cw / 2}" y="${sen ? py + (r.rows - 1 - f) * chh + tf * .62 + chh * .08 : py + (r.rows - 1 - f) * chh + chh / 2 + tf * .36}" text-anchor="middle" font-size="${sen ? tf * .62 : tf}" font-weight="800" fill="#0b0b10" fill-opacity=".72" font-family="Inter, sans-serif">${i + 1}</text>`; }
  if (sen) { const gr = Math.max(1.6, Math.min(5, Math.min(cw, chh) * .09)), cx = (c) => px + c * cw + cw / 2, cy = (f) => py + (r.rows - 1 - f) * chh + chh / 2;
    g += `<defs><marker id="fl" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#0b0b10"/></marker></defs>`;
    R.rutas.forEach((ru) => { if (!ru.length) return; g += `<polyline points="${ru.map(([c, f]) => cx(c).toFixed(1) + ',' + cy(f).toFixed(1)).join(' ')}" fill="none" stroke="#0b0b10" stroke-opacity=".82" stroke-width="${gr}" stroke-linejoin="round" stroke-linecap="round"${ru.length > 1 ? ' marker-end="url(#fl)"' : ''}/><circle cx="${cx(ru[0][0])}" cy="${cy(ru[0][1])}" r="${gr * 2.1}" fill="#fff" stroke="#0b0b10" stroke-width="${gr * .7}"/>`; }); }
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
const ICB = { M1A: 'regla', M1B: 'entorno', M2A: 'pitch', M2B: 'cabinet', S1A: 'sim', S1B: 'cable', M3A: 'dims', M3B: 'res', M3C: 'cabs', M3D: 'rayo', M3E: 'red', M3F: 'chip' };
const COSN = { auto: 'Auto', vertical: 'Vertical', horizontal: 'Horizontal' };
const cosidoCtl = () => `<div class="cosidos" role="group" aria-label="Cosido de la señal"><span>Cosido</span>${['auto', 'vertical', 'horizontal'].map((v) => `<button type="button" data-set="cosido" data-v="${v}" aria-pressed="${E.cosido === v}">${COSN[v]}</button>`).join('')}<em>${R.cosidoNo ? 'No cabe así: ' : E.cosido === 'auto' ? '→ ' : ''}${R.cosidoNo || E.cosido === 'auto' ? R.cosido : ''}</em></div>`;
const blk = (area, id, tit, ac, cuerpo, extra = '', cls = '', ic = ICB[id]) => `<section class="blk ${cls}" style="grid-area:${area};--ac:${ac}" data-blk="${id}"><header class="blk-cab">${ic ? `<i class="blk-ic" aria-hidden="true">${IC[ic]}</i>` : ''}<b>${tit}</b><span class="sep"></span>${extra}<span class="id">${id}</span></header><div class="blk-cu">${cuerpo}</div></section>`;
const num = (k, lab, val, uni, paso) => `<div class="num"><label for="n-${k}">${lab}</label><input id="n-${k}" type="number" inputmode="decimal" data-num="${k}" value="${val}" step="${paso}" min="0"><span>${uni}</span><div class="pm"><button type="button" data-pm="${k}" data-d="1" tabindex="-1" aria-label="Subir ${lab}">▲</button><button type="button" data-pm="${k}" data-d="-1" tabindex="-1" aria-label="Bajar ${lab}">▼</button></div></div>`;
const dato = (k, v) => `<div class="dato"><span>${k}</span><b>${v}</b></div>`;
function pintaRejilla() {
  const el = $('#rejilla'); if (!el) return;
  const TIPOS = [['INDOOR', 'Interior'], ['OUTDOOR', 'Exterior'], ['ESCAPARATE', 'Escaparate']];
  let h = blk('m1a', 'M1A', 'Tamaño', 'var(--marca)', `<div class="fila">${num('w', 'Ancho', +E.w.toFixed(2), 'm', .1)}</div><div class="fila">${num('h', 'Alto', +E.h.toFixed(2), 'm', .1)}</div><div class="fila tres" role="group" aria-label="Ajustar el alto a un formato">${[['16:9', 9 / 16], ['4:3', 3 / 4], ['1:1', 1], ['9:16', 16 / 9]].map((f) => `<button type="button" class="tog" data-formato="${f[1]}" title="Pone el alto que corresponde a ${f[0]} con este ancho">${f[0]}</button>`).join('')}</div>` + (R && R.r ? `<div class="nota">Con cabinets enteros queda en <b style="color:var(--txt)">${fmt(R.r.ancho * 100)} × ${fmt(R.r.alto * 100)} cm</b>${Math.abs(R.r.sobra.w) > .01 || Math.abs(R.r.sobra.h) > .01 ? ' (' + (R.r.sobra.w >= 0 ? 'sobran ' : 'faltan ') + fmt(Math.abs(R.r.sobra.w) * 100) + ' × ' + fmt(Math.abs(R.r.sobra.h) * 100) + ' cm)' : ' · medida exacta'}</div>` : ''));
  h += blk('m1b', 'M1B', 'Entorno y uso', 'var(--azul)', `<div class="fila tres">${TIPOS.map((t) => tog(E.tipo === t[0], `data-set="tipo" data-v="${t[0]}"`, t[1])).join('')}</div><div class="fila">${tog(E.clase === 'INSTALL', 'data-set="clase" data-v="INSTALL"', 'Fija')}${tog(E.clase === 'RENTAL', 'data-set="clase" data-v="RENTAL"', 'Alquiler')}</div>` + (R && R.nits ? `<div class="nota">Brillo mínimo para este entorno: ${fmt(R.nits)} nits.</div>` : '') + (R && R.relajado ? `<div class="nota" style="color:var(--ambar)">${R.relajado}</div>` : ''));
  if (!R || R.vacio) {
    const msg = ESTADO === 'cargando' ? 'Cargando el catálogo…' : ESTADO === 'error' ? 'No se ha podido leer el catálogo. Comprueba la conexión y vuelve a cargar.' : 'No hay modelos en el catálogo para este entorno.';
    h += ['m2a', 'm2b', 's1a', 's1b', 'm3a', 'm3b', 'm3c', 'm3d', 'm3e', 'm3f'].map((a) => blk(a, a.toUpperCase(), '&nbsp;', 'var(--linea)', a === 's1a' ? `<div class="nota" style="margin:auto;font-size:calc(var(--u)*20)">${msg}</div>` : '', '', a[0] === 's' ? 'pant' : '', '')).join('');
    el.innerHTML = h; return;
  }
  const { m, r } = R, ip = R.pitches.indexOf(R.pitch), ORIG = { pedido: ['ok', 'Pedido por ti'], cercano: ['av', 'El más cercano a ' + E.pitch], distancia: ['ok', 'Por distancia · ' + fmt(E.dist, 1) + ' m'], auto: ['av', 'Automático · el más fino'], elegido: ['ok', 'Elegido a mano'] }[R.origen];
  h += blk('m2a', 'M2A', 'Pitch', 'var(--violeta)', `<div class="fila"><button type="button" class="ic-bt g" data-pitch="-1" aria-label="Pitch más fino" title="Pitch más fino" ${ip <= 0 ? 'disabled' : ''}>${IC.ant}</button><div class="gran" style="flex:1;text-align:center">${String(R.pitch).replace('.', ',')}<small>mm</small></div><button type="button" class="ic-bt g" data-pitch="1" aria-label="Pitch más grueso" title="Pitch más grueso" ${ip >= R.pitches.length - 1 ? 'disabled' : ''}>${IC.sig}</button></div><div class="fila envuelve"><span class="chip ${ORIG[0]}">${ORIG[1]}</span><span class="chip">${ip + 1} de ${R.pitches.length}</span></div>${num('dist', 'Público a', E.dist || '', 'm', .5)}<div class="nota">Si indicas a qué distancia está el público, se elige el pitch que se ve bien desde ahí.</div>`);
  const foto = m.urlFoto ? `<img src="${esc(m.urlFoto)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<div class="sinfoto">sin foto</div>';
  h += blk('m2b', 'M2B', 'Cabinet', 'var(--violeta)', `<select class="sel" data-crm aria-label="Modelo de cabinet">${R.delPitch.map((x) => `<option value="${esc(x.crm)}"${x.crm === m.crm ? ' selected' : ''}>${esc(x.crm)}${enStock(x) ? ' · stock' : ''}</option>`).join('')}</select><div class="cabmini">${foto}<div style="min-width:0;flex:1">${dato('Cabinet', `${m.cabAncho}×${m.cabAlto} mm`)}${dato('Píxeles', `${m.cabPixAncho}×${m.cabPixAlto}`)}${dato('Brillo', m.nits ? fmt(m.nits) + ' nits' : '—')}</div></div><div class="fila envuelve"><span class="chip ${enStock(m) ? 'ok' : 'no'}">${enStock(m) ? 'En stock' : 'Bajo pedido'}</span><span class="chip">${esc(m.family || '')}</span></div>`, bt('ojo', 'Ver la ficha completa del cabinet', 'data-ver="equipo"'));
  h += blk('s1a', 'S1A', 'Simulación a escala', 'var(--marca)', `<div class="lienzo">${svgSim()}<div class="fondos" role="group" aria-label="Fondo de la pared">${FONDOS.map((f) => `<button type="button" data-fondo="${f}" aria-pressed="${E.fondo === f}" aria-label="Fondo ${f.replace(/-/g, ' ')}" title="${f.replace(/-/g, ' ')}" style="background-image:url(../assets/sim/${f}-mini.jpg)"></button>`).join('')}</div></div>`, bt('contenido', 'Simular contenido: fuentes de prueba, un enlace o un archivo tuyo', 'data-ver="contenido"') + (CONT ? bt('carta', 'Volver a la carta de ajuste', 'data-carta') : '') + bt('copia', 'Copiar una captura de esta pantalla', 'data-copia="S1A"') + bt('ojo', 'Ver en grande', 'data-ver="sim"'), 'pant');
  const V = VISTAS[E.vista] || VISTAS[0];
  h += blk('s1b', 'S1B', V[3](), 'var(--azul)', `<div class="lienzo papel">${V[2]()}${V[0] === 'senal' ? cosidoCtl() : ''}</div>`, `<div class="pestanas" role="group" aria-label="Qué se ve en esta pantalla">${VISTAS.map((v, i) => `<button type="button" data-vista="${i}" aria-pressed="${i === E.vista}">${v[1]}</button>`).join('')}</div>` + bt('copia', 'Copiar una captura de esta pantalla', 'data-copia="S1B"') + bt('ojo', 'Ver en grande', 'data-ver="vista"'), 'pant');
  const mcd = (a, b) => (b ? mcd(b, a % b) : a), q = mcd(Math.round(r.ancho * 1000), Math.round(r.alto * 1000)), fa = Math.round(r.ancho * 1000) / q, fb = Math.round(r.alto * 1000) / q, formato = fa <= 32 && fb <= 32 ? fa + ':' + fb : fmt(r.ancho / r.alto, 2) + ':1';
  h += blk('m3a', 'M3A', 'Dimensiones', 'var(--marca)', `<div class="gran">${fmt(r.ancho * 100)}<small>×</small> ${fmt(r.alto * 100)}<small>cm</small></div>${dato('Diagonal', fmt(R.diag * 100) + ' cm · ' + fmt(R.diag / .0254) + '″')}${dato('Formato', formato)}${dato('Superficie', fmt(r.ancho * r.alto, 2) + ' m²')}${dato('Fondo', m.thick ? fmt(m.thick) + ' mm' : '—')}`);
  const RES = [['HD', 1280, 720], ['FHD', 1920, 1080], ['4K', 3840, 2160], ['8K', 7680, 4320]];
  h += blk('m3b', 'M3B', 'Resolución', 'var(--azul)', `<div class="gran">${r.resW}<small>×</small> ${r.resH}<small>px</small></div><div class="res-chips">${RES.map((x) => `<span class="chip ${r.resW >= x[1] && r.resH >= x[2] ? 'ok' : 'no'}">${x[0]}</span>`).join('')}</div>${dato('Píxeles', fmt(r.pix / 1e6, 2) + ' Mpx')}${dato('Por cabinet', m.cabPixAncho + '×' + m.cabPixAlto)}${dato('Refresco', m.hz ? fmt(m.hz) + ' Hz' : '—')}`);
  const cs = Math.min(84 / r.cols, 84 / r.rows);
  h += blk('m3c', 'M3C', 'Cabinets', 'var(--violeta)', `<div class="fila"><div class="rej-cab" style="grid-template-columns:repeat(${r.cols},calc(var(--u) * ${cs.toFixed(2)}));grid-auto-rows:calc(var(--u) * ${(cs * Math.min(1.6, m.cabAlto / m.cabAncho)).toFixed(2)})">${'<i></i>'.repeat(Math.min(r.cab, 400))}</div><div class="gran" style="flex:1;text-align:right">${fmt(r.cab)}<small>ud</small></div></div>${dato('Rejilla', r.cols + ' de ancho × ' + r.rows + ' de alto')}${dato('Peso', fmt(r.peso, 1) + ' kg')}${dato('Por cabinet', m.cabKg ? fmt(m.cabKg, 1) + ' kg' : '—')}`);
  h += blk('m3d', 'M3D', 'Alimentación', 'var(--rojo)', `<div class="gran">${fmt(r.kw, 2)}<small>kW máx.</small></div>${dato('Corriente', fmt(r.cab * R.ampCab, 1) + ' A · 230 V')}${dato('Líneas de 16 A', R.nLin)}${dato('Por cabinet', (m.wMax ? fmt(m.wMax) + ' W' : '—') + (R.ampCab ? ' · ' + fmt(R.ampCab, 2) + ' A' : ''))}`, bt('ojo', 'Ver el reparto eléctrico', 'data-ver="elec"'));
  h += blk('m3e', 'M3E', 'Señal', 'var(--ambar)', `<div class="gran">${r.lineas}<small>línea${r.lineas > 1 ? 's' : ''} Ethernet</small></div>${dato('Backup', E.backup ? '+ ' + r.lineas + ' de reserva' : 'sin backup')}${dato('Cosido', R.cosido + (E.cosido === 'auto' ? ' (auto)' : ''))}${dato('Conexión', E.conexion === 'directo' ? 'RJ45 directo' : 'fibra óptica')}${dato('Salidas 4K', r.salidas4k)}${dato('Tarjeta', esc(m.card || '—'))}`, bt('ojo', 'Ver el cableado de señal', 'data-ver="senal"'));
  const p = R.proc, me = R.media;
  h += blk('m3f', 'M3F', 'Electrónica', 'var(--marca)', (p ? `<div style="font-weight:800;font-size:calc(var(--u)*19);line-height:1.15">${esc(p.modelo)}<div class="nota">${esc(p.marca)} · ${p.escalador ? 'con escalador' : 'sin escalador'}</div></div>${dato('Puertos', esc(p.puertos))}` : '<div class="nota">Sin procesador que cubra este proyecto con estas opciones: cambia la conexión o el backup en los ajustes.</div>') + (me ? dato('Mediaserver', esc(me.modelo)) : dato('Mediaserver', 'no pedido')) + (R.procs.length > 1 ? `<div class="nota">${R.procs.length} procesadores posibles: ábrelos con el ojo.</div>` : ''), bt('ojo', 'Ver la electrónica completa', 'data-ver="equipo"'));
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
  } else if (que === 'contenido') {
    const nom = (u) => { const y = String(u).match(/(?:v=|live\/|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/); return y ? 'YouTube · ' + y[1] : String(u).replace(/^https?:\/\/(www\.)?/, ''); };
    v.innerHTML = `<div class="vent ajustes" role="dialog" aria-modal="true" aria-label="Contenido de la pantalla"><div class="vent-cab">${IC.contenido.replace('<svg', '<svg style="width:1.2em;height:1.2em"')} Contenido de la pantalla<span class="sep"></span>${bt('x', 'Cerrar', 'data-cierra')}</div><div class="vent-cu">
      <div class="rot">Fuentes multimedia de prueba</div>
      <div class="fuentes">${[FUENTE_FIJA].concat(FU).map((u, i) => `<div class="fuente" data-on="${FSEL === i && !URLP}"><button type="button" class="tog" data-fu-sel="${i}" aria-pressed="${FSEL === i && !URLP}" title="Elegir esta fuente">${i + 1}</button>${i === 0 ? '<b>mediaservi.com 24/7</b>' : `<input type="url" class="pide" data-fu="${i - 1}" value="${esc(u)}" placeholder="Vacía · pega aquí un enlace" aria-label="Enlace de la fuente ${i + 1}" title="${esc(nom(u))}">`}</div>`).join('')}</div>
      <div class="nota">Las fuentes 2 a 6 se pueden editar; la primera es fija. Se guardan en este navegador, las mismas que en la versión clásica.</div>
      <div class="rot">O usa tu propio contenido</div>
      <div class="fila"><input type="url" class="pide" id="url-propia" value="${esc(URLP)}" placeholder="Pega un enlace de YouTube, Vimeo, imagen o vídeo" aria-label="Enlace de tu contenido"><button type="button" class="tog" data-sube style="flex:none">${IC.contenido}Subir imagen / vídeo</button></div>
      <div class="fila"><button type="button" class="calcular" data-cont-aplica style="font-size:calc(var(--u)*15)">APLICAR</button>${tog(false, 'data-cont-reinicia title="Volver a la carta de ajuste inicial"', 'Reiniciar')}${tog(false, 'data-cierra', 'Cerrar')}</div></div></div>`;
    VENT = { que };
  } else if (que === 'info') {
    v.innerHTML = `<div class="vent ajustes" role="dialog" aria-modal="true" aria-label="Información"><div class="vent-cab">${IC.info.replace('<svg', '<svg style="width:1.2em;height:1.2em"')} SCREENS · una pantalla LED<span class="sep"></span>${bt('x', 'Cerrar', 'data-cierra')}</div><div class="vent-cu" style="font-size:calc(var(--u)*16);line-height:1.5">
      <p style="margin:0"><b>BLOCKS</b> es la nueva interfaz de AVHUB: la pantalla no se desplaza y cada dato tiene siempre su sitio. Esta es una beta de prueba (${esc(VERSION)}).</p>
      <p style="margin:0"><b>Cómo se usa.</b> Escribe o dicta arriba la pantalla que necesitas («3 x 4 para exterior 3.9p a 8 m») y pulsa CALCULAR, o rellena los cuatro bloques de la izquierda: tamaño, entorno y uso, pitch y cabinet. Todo se recalcula al momento.</p>
      <p style="margin:0"><b>Las dos pantallas.</b> A la izquierda, la simulación a escala: puedes cambiar la pared, simular contenido (fuentes de prueba, un enlace de YouTube o Vimeo, o una imagen o vídeo tuyos), copiar una captura y abrirla en grande con el ojo. A la derecha, el cableado de señal, el eléctrico y la distancia de visionado.</p>
      <p style="margin:0"><b>La ruedita</b> guarda lo menos habitual: backup, escalador, conexión, mediaserver, ajuste a la medida, elevación y tema.</p>
      <p style="margin:0" class="nota">El PDF, la sala inmersiva, la proyección, el inglés y el catalán siguen en la versión clásica (botón del documento). Cálculo automático que puede contener errores: verifícalo antes de presupuestar o instalar.</p></div></div>`;
    VENT = { que };
  } else {
    const LISTA = R && R.r ? [['sim', 'Simulación a escala', () => `<div class="lienzo">${svgSim()}</div>`], ['senal', VISTAS[0][3](), () => `<div class="lienzo papel">${VISTAS[0][2]()}${cosidoCtl()}</div>`], ['elec', VISTAS[1][3](), () => `<div class="lienzo papel">${VISTAS[1][2]()}</div>`], ['dist', VISTAS[2][3](), () => `<div class="lienzo papel">${VISTAS[2][2]()}</div>`], ['equipo', 'Equipos del proyecto', fichas]] : [];
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
  R.procs.slice(0, 4).forEach((x, i) => f.push(FICHA.fichaHTML({ cat: i ? 'Procesador alternativo' : 'Procesador recomendado', icono: 'elec', marca: x.marca, modelo: x.modelo, foto: x.front, fotoTrasera: x.back, acento: '#d4ff00', stock: x.enStock ? true : null, sel: !i,
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
      <div data-blk="H1R" class="h1r">${bt('info', 'Qué es esto y cómo se usa', 'data-ver="info"', 'g')}<a class="ic-bt g" href="../" title="PDF y versión clásica" aria-label="PDF y versión clásica">${IC.clasico}</a><a class="ic-bt g" href="https://avhub.mediaservi.com/" title="AVHUB" aria-label="AVHUB">${IC.casa}</a><span id="hueco-comun" style="display:contents"></span><button type="button" class="ic-bt g" data-idioma title="Idioma: de momento BLOCKS solo está en castellano" aria-label="Idioma: castellano" style="font-weight:800;font-size:calc(var(--u)*13)">ES</button>${bt('tema', 'Cambiar entre gris oscuro y gris claro', 'data-cambiatema', 'g')}${bt('rueda', 'Ajustes', 'data-ver="ajustes"', 'g')}</div></header>
    <div class="franja f-hm"><div data-blk="HM1"><div class="fila grupo" style="flex:1">${tog(true, 'data-nada', 'Una', 'una')}<a class="tog" href="../" style="text-decoration:none" title="Varias pantallas: en la versión clásica">${IC.varias}Varias</a></div><div class="fila grupo" style="flex:1.25">${tog(true, 'data-nada', 'LED', 'led')}<a class="tog" href="../" style="text-decoration:none" title="Proyección: en la versión clásica">${IC.proy}Proyección</a></div></div>
      <div data-blk="HM2"><input class="pide" id="pide" type="text" autocomplete="off" spellcheck="false" placeholder="Escríbela: «pantalla de 3 x 4 para exterior 3.9p a 8 m»" aria-label="Describe la pantalla" value="${esc(E.texto)}">${bt('mic', 'Dictar la petición con el micrófono', 'data-mic', 'g')}${bt('audio', 'Pasar a texto una nota de voz (archivo de audio)', 'data-audio', 'g')}<input type="file" id="f-audio" accept="audio/*,.opus,.ogg,.m4a,.mp3,.wav,.webm" hidden><input type="file" id="f-cont" accept="image/*,video/*" hidden></div>
      <div data-blk="HM3"><button type="button" class="calcular" id="calcular">CALCULAR →</button></div></div>
    <main class="rejilla" id="rejilla"></main>
    <footer class="franja f-f1"><div data-blk="F1L" id="pie-l"></div><div data-blk="F1C" id="pie-c"></div><div data-blk="F1R" style="justify-content:flex-end"><span class="nota" style="text-align:right">Cálculo automático: verifícalo antes de presupuestar.</span></div></footer>
    <div class="f-cred">${esc(VERSION)} · 2026 · es un proyecto hecho con ♥ by mediaservi.com · <a href="../LEGAL.md">Aviso legal</a></div>
  </div><div class="velo" id="velo"></div><div class="tostada" id="tostada" role="status" aria-live="polite"></div><div class="aviso-movil">BLOCKS beta está pensada de momento para ordenador y pantalla apaisada.</div>`;
  const pide = () => { E.texto = $('#pide').value; const v = interpreta(E.texto); todo(); if (E.texto.trim() && !v.length) $('#pie-c').innerHTML = '<span class="pie-txt" style="color:var(--ambar)">No he entendido la petición: prueba con «3 x 2 interior» o rellena los bloques.</span>'; };
  $('#calcular').onclick = pide; $('#pide').addEventListener('keydown', (e) => { if (e.key === 'Enter') pide(); });
  const pon = (k, v) => { if (k === 'backup') E.backup = !!v; else E[k] = v; if (k === 'tipo' || k === 'clase') E.crm = ''; if (k === 'tema') document.documentElement.dataset.tema = v; todo(); if (VENT && VENT.que === 'ajustes') abre('ajustes'); else if (VENT && VENT.pinta) VENT.pinta(); };
  document.addEventListener('click', (e) => { const q = (s) => e.target.closest(s); let b;
    if ((b = q('[data-set]'))) pon(b.dataset.set, b.dataset.v);
    else if ((b = q('[data-pitch]'))) { const i = R.pitches.indexOf(R.pitch) + +b.dataset.pitch; if (R.pitches[i] != null) { E.pitch = R.pitches[i]; E.crm = ''; todo(); } }
    else if ((b = q('[data-pm]'))) { const k = b.dataset.pm, paso = k === 'elev' ? 10 : k === 'dist' ? .5 : .1; E[k] = Math.max(k === 'w' || k === 'h' ? .1 : 0, +((+E[k] || 0) + paso * +b.dataset.d).toFixed(2)); if (k === 'dist') { E.pitch = 0; E.crm = ''; } todo(); if (VENT && VENT.que === 'ajustes') abre('ajustes'); }
    else if ((b = q('[data-formato]'))) { E.h = Math.max(.1, +(E.w * +b.dataset.formato).toFixed(2)); todo(); }
    else if ((b = q('[data-copia]'))) captura(b.dataset.copia);
    else if (q('[data-sube]')) $('#f-cont').click();
    else if ((b = q('[data-fu-sel]'))) { FSEL = +b.dataset.fuSel; URLP = ''; abre('contenido'); }
    else if (q('[data-cont-aplica]')) { const i = $('#url-propia'); if (i) URLP = i.value.trim(); const c = deEnlace(URLP || (FSEL === 0 ? FUENTE_FIJA : FU[FSEL - 1])); sueltaCont(); CONT = c; cierra(); todo(); tostada(c ? 'Contenido aplicado a la pantalla.' : 'Esa fuente está vacía: se queda la carta de ajuste.'); }
    else if (q('[data-cont-reinicia]')) { sueltaCont(); CONT = null; FSEL = 0; URLP = ''; cierra(); todo(); tostada('Pantalla reiniciada: vuelve la carta de ajuste.'); }
    else if (q('[data-carta]')) { sueltaCont(); CONT = null; todo(); }
    else if (q('[data-audio]')) $('#f-audio').click();
    else if ((b = q('[data-mic]'))) dicta(b);
    else if (q('[data-idioma]')) tostada('BLOCKS está de momento solo en castellano; el inglés y el catalán llegarán en otra beta.');
    else if ((b = q('[data-fondo]'))) { E.fondo = b.dataset.fondo; todo(); }
    else if ((b = q('[data-vista]'))) { E.vista = +b.dataset.vista; todo(); }
    else if ((b = q('[data-ver]'))) abre(b.dataset.ver);
    else if ((b = q('[data-cambiatema]'))) pon('tema', E.tema === 'oscuro' ? 'claro' : 'oscuro');
    else if ((b = q('[data-paso]'))) { VENT.i = (VENT.i + +b.dataset.paso + VENT.LISTA.length) % VENT.LISTA.length; VENT.pinta(); }
    else if (q('[data-reset]')) { Object.assign(E, { backup: true, escalador: 'con', conexion: 'directo', marca: 'ninguno', ajuste: 'dentro', elev: 100, cosido: 'auto' }); todo(); abre('ajustes'); }
    else if (q('[data-cierra]') || e.target.id === 'velo') cierra(); });
  document.addEventListener('change', (e) => { const t = e.target;
    if (t.dataset.num) { const k = t.dataset.num, v = parseFloat(String(t.value).replace(',', '.')); if (k === 'dist') { E.dist = v > 0 ? v : 0; E.pitch = 0; E.crm = ''; } else if (v >= 0) E[k] = k === 'elev' ? v : Math.max(.1, v); todo(); if (VENT && VENT.que === 'ajustes') abre('ajustes'); }
    else if (t.dataset.crm !== undefined) { E.crm = t.value; todo(); }
    else if (t.dataset.fu !== undefined) { FU[+t.dataset.fu] = t.value.trim(); FSEL = +t.dataset.fu + 1; URLP = ''; try { localStorage.setItem('screens_fuentes_v2', JSON.stringify(FU)); } catch (er) {} abre('contenido'); }
    else if (t.id === 'url-propia') URLP = t.value.trim();
    else if (t.id === 'f-cont' && t.files && t.files[0]) { const f = t.files[0]; sueltaCont(); if (VENT) cierra(); CONT = { url: URL.createObjectURL(f), tipo: /^video\//.test(f.type) ? 'video' : 'img' }; t.value = ''; todo(); tostada('Contenido puesto en la pantalla. La flecha circular vuelve a la carta de ajuste.'); }
    else if (t.id === 'f-audio' && t.files && t.files[0]) { const f = t.files[0]; t.value = ''; tostada('Pasando el audio a texto… la primera vez tarda un poco.', 60000);
      globalThis.SC_VOZ.transcribir(f, 'es', () => {}).then((txt) => { if (!txt) { tostada('No se ha entendido nada en ese audio.'); return; } const i = $('#pide'); i.value = (i.value.trim() ? i.value.trim() + ' ' : '') + txt; tostada('Audio pasado a texto: revísalo y pulsa CALCULAR.'); }).catch(() => tostada('No se ha podido leer ese audio.')); } });
  document.addEventListener('keydown', (e) => { if (!VENT) return; if (e.key === 'Enter' && e.target.id === 'url-propia') { e.preventDefault(); URLP = e.target.value.trim(); const bta = document.querySelector('[data-cont-aplica]'); if (bta) bta.click(); return; } if (e.key === 'Escape') cierra(); else if (VENT.que === 'visor' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { VENT.i = (VENT.i + (e.key === 'ArrowRight' ? 1 : -1) + VENT.LISTA.length) % VENT.LISTA.length; VENT.pinta(); } });
}
/* ---------- avisos, dictado y captura ---------- */
let relojT = 0;
function tostada(txt, ms = 3200) { const t = $('#tostada'); if (!t) return; t.textContent = txt; t.classList.add('on'); clearTimeout(relojT); relojT = setTimeout(() => t.classList.remove('on'), ms); }
let oyendo = null;
function dicta(b) {
  if (oyendo) { try { oyendo.stop(); } catch (e) {} oyendo = null; b.setAttribute('aria-pressed', 'false'); return; }
  const i = $('#pide'), base = i.value.trim();
  oyendo = globalThis.SC_VOZ.dictar('es', (txt) => { i.value = (base ? base + ' ' : '') + txt; }, (e) => { if (e === 'sinMic') tostada('Este navegador no tiene dictado por voz.'); else if (e === 'escuchando') tostada('Te escucho: di la pantalla que necesitas y pulsa otra vez el micrófono al acabar.', 6000); else if (e === 'micFin') { oyendo = null; b.setAttribute('aria-pressed', 'false'); if (i.value.trim()) tostada('Dictado listo: pulsa CALCULAR.'); } });
  if (oyendo) b.setAttribute('aria-pressed', 'true');
}
const aDatos = (url) => fetch(url).then((r) => r.blob()).then((bl) => new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(bl); }));
const aImagen = (src) => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
let LETRAS = null;
const letras = () => LETRAS || (LETRAS = Promise.all([['Share Tech Mono', 400, '../assets/fonts/share-tech-mono-latin-400-normal.woff2'], ['Inter', 800, '../assets/fonts/inter-latin-800-normal.woff2']].map((f) => aDatos(f[2]).then((d) => `@font-face{font-family:'${f[0]}';font-weight:${f[1]};src:url(${d}) format('woff2')}`).catch(() => ''))).then((a) => a.join('')));
/* copia al portapapeles una imagen de lo que hay dentro del marco de una mini pantalla (S1A o S1B) */
async function captura(id) {
  const lz = $(`[data-blk="${id}"] .lienzo`), svg = lz && lz.querySelector('svg'); if (!svg) return;
  try {
    const r = lz.getBoundingClientRect(), k = Math.max(2, Math.min(3, 1800 / r.width)), cv = document.createElement('canvas'); cv.width = Math.round(r.width * k); cv.height = Math.round(r.height * k); const x = cv.getContext('2d'), cs = getComputedStyle(lz);
    x.fillStyle = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : '#1a1a1d'; x.fillRect(0, 0, cv.width, cv.height);
    const fondo = /url\(["']?([^"')]+)/.exec(lz.style.backgroundImage || ''); if (fondo) { const im = await aImagen(fondo[1]), e = Math.max(cv.width / im.width, cv.height / im.height); x.drawImage(im, (cv.width - im.width * e) / 2, (cv.height - im.height * e) / 2, im.width * e, im.height * e); }
    const c = svg.cloneNode(true); c.setAttribute('width', r.width); c.setAttribute('height', r.height); c.setAttribute('color', getComputedStyle(svg).color); c.removeAttribute('style');
    c.querySelectorAll('[fill="currentColor"]').forEach((e) => e.setAttribute('fill', getComputedStyle(svg).color)); c.querySelectorAll('[stroke="currentColor"]').forEach((e) => e.setAttribute('stroke', getComputedStyle(svg).color));
    const vid = svg.querySelector('video'), fo = c.querySelector('foreignObject');
    if (fo) { const t = document.createElement('canvas'); t.width = (vid && vid.videoWidth) || 640; t.height = (vid && vid.videoHeight) || 360; try { t.getContext('2d').drawImage(vid, 0, 0, t.width, t.height); } catch (e) {} const im = document.createElementNS('http://www.w3.org/2000/svg', 'image'); ['x', 'y', 'width', 'height'].forEach((a) => im.setAttribute(a, fo.getAttribute(a))); im.setAttribute('preserveAspectRatio', 'xMidYMid slice'); im.setAttribute('href', t.toDataURL('image/jpeg', .9)); fo.replaceWith(im); }
    for (const im of c.querySelectorAll('image')) { const h = im.getAttribute('href'); if (h && !/^data:/.test(h)) im.setAttribute('href', await aDatos(h)); }
    const st = document.createElementNS('http://www.w3.org/2000/svg', 'style'); st.textContent = await letras(); c.insertBefore(st, c.firstChild);
    const im = await aImagen('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c))); x.drawImage(im, 0, 0, cv.width, cv.height);
    const png = await new Promise((ok) => cv.toBlob(ok, 'image/png'));
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]); tostada('Captura copiada: pégala donde quieras (Ctrl+V).'); }
    catch (e) { const a = document.createElement('a'); a.href = URL.createObjectURL(png); a.download = 'SCREENS_' + id + '.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); tostada('Este navegador no deja copiar imágenes: la captura se ha descargado.'); }
  } catch (e) { console.warn('captura', e); tostada('No se ha podido hacer la captura.'); }
}
monta(); todo();
/* botones comunes de la familia: instalar y avisar de un fallo (los mismos de la versión clásica) */
{ const h = $('#hueco-comun'); if (h) { if (window.AVINSTALA) { try { h.appendChild(window.AVINSTALA.boton({ app: 'SCREENS', idioma: () => 'es', sw: false })); } catch (e) {} } if (window.AVFALLO) { try { h.appendChild(window.AVFALLO.boton({ app: 'SCREENS · BLOCKS', version: VERSION, idioma: () => 'es' })); } catch (e) {} } } }
cargarCatalogo((lista, origen) => { if (origen === 'error') { if (!CAT.length) ESTADO = 'error'; } else { CAT = lista; ESTADO = origen; } todo(); });
window.__blocks = { E, get R() { return R; }, todo };
