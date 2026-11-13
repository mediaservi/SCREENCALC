/* SCREENS · una pantalla LED en BLOCKS (beta) · mediaservi.com · GPL-3.0
   Misma lógica de cálculo que la consola (screens/led.js, comun/electronica.js) y el mismo catálogo en vivo (screens/catalogo.js);
   aquí solo cambia cómo se presenta: cada dato tiene su bloque fijo y no hay desplazamiento de página. */
import { cargarCatalogo, ordenar, enStock } from '../screens/catalogo.js';
import { calcularLed, lineasCosido, PX_PUERTO } from '../screens/led.js';
import { HUMAN_PATH } from '../screens/figura.js';
import '../comun/electronica.js';
import '../comun/ficha.js';
import '../comun/voz.js';
import { idiomaInicial, idioma, fijaIdioma, vigila, tr, IDIOMAS, NOMBRE } from './idiomas.js?v=10.42';
idiomaInicial();   /* el idioma guardado de la familia SCREENS o, la primera vez, el del navegador */
const ELEC = globalThis.SC_ELEC, FICHA = globalThis.SC_FICHA, VERSION = 'SCREENS v10.42';
const $ = (s, r = document) => r.querySelector(s), esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (v, d = 0) => Number(v).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
const SV = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
const IC = {
  completa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  normal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
  imprime: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/></svg>',
  guarda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M12 11v6M9 14.5l3 3 3-3"/></svg>',
  proyecto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2.5" width="8" height="4" rx="1"/><path d="M16 4.5h2a2 2 0 0 1 2 2V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2h2"/><path d="M8.5 12h7M8.5 16h5"/></svg>',
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
  nuevo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,14q-0.82,0-1.41-0.59T10,12t0.59-1.41T12,10t1.41,0.59Q14,11.18 14,12t-0.59,1.41T12,14Zm0,7q-3.47,0-6.03-2.29Q3.43,16.43 3.05,13H5.1q0.35,2.6 2.31,4.3T12,19q2.93,0 4.96-2.04Q19,14.93 19,12q0-2.93-2.04-4.96T12,5Q10.28,5 8.78,5.8T6.25,8H9v2H3V4H5V6.35q1.28-1.6 3.11-2.47T12,3q1.88,0 3.51,0.71t2.85,1.93t1.93,2.85T21,12t-0.71,3.51t-1.93,2.85t-2.85,1.93T12,21Z"/></svg>',
  gira: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="10" height="10" rx="1.5"/><path d="M8 6a9 9 0 0 1 10 10"/><path d="M21 13l-3 3-3-3"/></svg>',
  pega: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11v6M9 14l3 3 3-3"/></svg>',
  media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/><path d="M14 6.5l3 1-3 1z" fill="currentColor"/></svg>',
  eInt: SV('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>'),
  eExt: SV('<path d="M2 20h20"/><path d="M5 20l5-9 3 5 2-3 4 7"/><circle cx="17.5" cy="6" r="2"/>'),
  eEsc: SV('<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12.5V20h14v-7.5"/>'),
  eFija: SV('<path d="M12 21v-7"/><path d="M8 3h8l-1 6 3 4H6l3-4z"/>'),
  eAlq: SV('<rect x="2" y="7" width="11" height="9" rx="1"/><path d="M13 10h4l4 3v3h-8z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),
  eSol: SV('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  eNube: SV('<path d="M12 3v1.5M5.6 5.6l1 1M3 12h1.5M18.4 5.6l-1 1"/><path d="M8.5 11a4 4 0 0 1 7-2.6"/><path d="M8 20h9a3.5 3.5 0 0 0 .5-7 5 5 0 0 0-9.6 1.3A3 3 0 0 0 8 20z"/>'),
  eMar: SV('<path d="M2 16c2 0 2-1.5 4-1.5S8 16 10 16s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M2 20.5c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M12 3c2 2.5 3 4 3 5.5a3 3 0 0 1-6 0C9 7 10 5.5 12 3z"/>'),
  eTra: SV('<rect x="3" y="4" width="18" height="13" rx="1.5" stroke-dasharray="3 2.2"/><path d="M8 21h8M12 17v4"/><path d="M7 13l4-5M11 14l5-6"/>'),
  ePub: SV('<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>'),
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
/* icono de la simulación: el que mandó Josep (tabla con ojo) */
IC.sim = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5,21q-0.83,0-1.41-0.59T3,19V5Q3,4.17 3.59,3.59T5,3H19q0.83,0 1.41,0.59T21,5v8.32q-0.47-0.28-0.97-0.5T19,12.43V9H13v3.42q-1.15,0.35-2.15,1T9,15H5v4H7.05q0.27,0.55 0.55,1.05T8.2,21H5Zm0-8h6V9H5v4ZM5,7H19V5H5V7Zm11,16q-2.27,0-4.2-1.2T9,18.5q0.88-2.1 2.8-3.3T16,14q2.28,0 4.2,1.2T23,18.5q-0.88,2.1-2.8,3.3T16,23Zm2.69-2.65q1.26-0.65 2.06-1.85q-0.8-1.2-2.06-1.85Q17.43,16 16,16t-2.69,0.65T11.25,18.5q0.8,1.2 2.06,1.85T16,21q1.43,0 2.69-0.65Zm-3.75-0.79Q14.5,19.13 14.5,18.5t0.44-1.06T16,17t1.06,0.44T17.5,18.5t-0.44,1.06T16,20t-1.06-0.44Z"/></svg>';
/* iconos originales de SCREENS (los que eligió Josep para la versión clásica): sustituyen a los dibujados para BLOCKS allí donde existen */
Object.entries({"regla": "tamano", "entorno": "tipo", "pitch": "pitch", "cabinet": "cabinet", "cable": "cosido", "dims": "dimensiones", "res": "resolucion", "cabs": "cabinets", "red": "senal", "info": "info", "mic": "mic", "audio": "audio", "contenido": "contenido", "clasico": "pdf"}).forEach(([k, n]) => { IC[k] = `<span class="ic ic-${n}"></span>`; });
IC.dist = '<span class="ic ic-distancia"></span>'; IC.inst = '<span class="ic ic-instalacion"></span>'; IC.nits = '<span class="ic ic-nits"></span>';
const bt = (ic, tit, attrs = '', cls = '') => `<button type="button" class="ic-bt ${cls}" title="${esc(tit)}" aria-label="${esc(tit)}" ${attrs}>${IC[ic]}</button>`;
const tog = (on, attrs, txt, ic) => `<button type="button" class="tog" aria-pressed="${!!on}" ${attrs}>${ic ? IC[ic] : ''}${txt}</button>`;

/* ---------- estado ---------- */
const GUARDA = 'screens-blocks-1';
const DEF = { w: 3, h: 2, tipo: 'INDOOR', clase: 'INSTALL', pitch: 0, dist: 0, crm: '', elev: 100, fondo: 'hormigon', cosido: 'auto', backup: true, escalador: 'con', conexion: 'directo', marca: 'ninguno', ajuste: 'dentro', giro: false, gold: false, protegido: false, nitsMin: 0, uni: 'm', resMin: '', procSel: '', dante: false, mediaSel: '', sol: '', transp: false, vista: 0, tema: 'oscuro', texto: '', proy: '', cliente: '', entradas: 1, obs: '', tipoEntrada: 'HDMI', resEntrada: '', cableM: '0' };
const E = Object.assign({}, DEF,
  (() => { try { return JSON.parse(localStorage.getItem(GUARDA) || '{}'); } catch (e) { return {}; } })());
let USADO = false;   /* el resultado solo ocupa la casilla cuando ya se ha pedido o tocado algo: al abrir se ve la casilla vacía con su ejemplo */
let EDITA = false;   /* true mientras se escribe una petición: la casilla enseña el texto y no el resultado */
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
const SUELO = { hormigon: '#bfe6d8', madera: '#bcd9f2', marmol: '#f2c9d4', 'ladrillo-rojo': '#c7e8c0', 'ladrillo-oscuro': '#f3e3a8', 'ladrillo-claro': '#c9c6f0', ninguno: '#cfd3da', propio: '#cfd3da' };
/* v10.42 · además de las seis paredes: «ninguno» (sin fondo) y «propio» (una imagen subida o un enlace pegado) */
const FONDOS = ['hormigon', 'madera', 'marmol', 'ladrillo-rojo', 'ladrillo-oscuro', 'ladrillo-claro', 'ninguno', 'propio'];
const TEXV = '?v=10.42';
/* v10.42 · candado discreto del pie: abre el panel AVHUB ADMIN (Apps Script), como el de la consola */
const ADMIN_URL = 'https://script.google.com/macros/s/AKfycbwkc12y4LODbFe-kQidnR2MbbA6cbW1WbhU3UiqmDmshx-ncAdGYrFRy8PNjm9Wg6Mx3w/exec';   /* rompe la caché del navegador cuando cambia una textura */
/* fondo propio: la imagen ya reducida (data:) o el enlace, guardado en este navegador */
const FPROP_K = 'screens-fondo-propio';
let FPROP = (() => { try { return localStorage.getItem(FPROP_K) || ''; } catch (e) { return ''; } })();
if (E.fondo === 'propio' && !FPROP) E.fondo = DEF.fondo;

/* ---------- petición escrita ---------- */
function interpreta(raw) {
  const t = ' ' + String(raw || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(\d),(\d)/g, '$1.$2') + ' ', v = [];
  const U = '(mm|cm|m|mts?|metros?|metres?|meters?)?', aM = (n, u) => { n = parseFloat(n); return u === 'mm' ? n / 1000 : u === 'cm' ? n / 100 : n; };
  const d = t.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*' + U + '\\s*(?:x|×|\\*|por|by|per)\\s*(\\d+(?:\\.\\d+)?)\\s*' + U + '(?![a-z])'));
  let resto = t;
  if (d) { const u = d[4] || d[2], u1 = d[2] || d[4]; E.w = aM(d[1], u1); E.h = aM(d[3], u); v.push(fmt(E.w, 2) + ' × ' + fmt(E.h, 2) + ' m'); resto = t.replace(d[0], ' '); }
  if (/escaparate|vitrina|shop ?window|storefront|aparador/.test(t)) { E.tipo = 'ESCAPARATE'; v.push('escaparate'); }
  else if (/exterior|outdoor|outside|intemperie|aire libre|aire lliure|fachada|facana|facade|\bcalle\b|carrer|street|terraza|terrassa/.test(t)) { E.tipo = 'OUTDOOR'; v.push('exterior'); }
  else if (/interior|indoor|inside|\bsala\b|salon|oficina|office|\bstand\b|showroom/.test(t)) { E.tipo = 'INDOOR'; v.push('interior'); }
  if (/alquiler|lloguer|rental|\brent\b|evento|event|esdeveniment|\bgira\b|\btour\b|concierto|concert|feria|fira|escenario|escenari|\bstage\b|temporal/.test(t)) { E.clase = 'RENTAL'; v.push('alquiler'); }
  else if (/instalacion|instal.lacio|instalar|\bfij[oa]\b|\bfix[ae]?\b|fixed|permanent|install/.test(t)) { E.clase = 'INSTALL'; v.push('fija'); }
  const p = resto.match(/(?:pitch|paso)\s*(?:de\s*|:\s*)?(\d{1,2}(?:\.\d+)?)|\bp\s?(\d{1,2}(?:\.\d+)?)\b|(\d{1,2}(?:\.\d+)?)\s*(?:mm\s*)?(?:de\s*)?(?:pitch|paso)/) || (() => { const m = resto.match(/(?:^|[^\d.])(\d{1,2}(?:\.\d+)?)\s?p(?![a-z0-9])/); return m && (/\./.test(m[1]) || parseFloat(m[1]) <= 20) ? [0, m[1]] : null; })();
  if (p) { E.pitch = parseFloat(p[1] || p[2] || p[3]); E.crm = ''; v.push('pitch ' + E.pitch); } else if (d || v.length) { E.pitch = 0; E.crm = ''; }
  const ds = resto.match(/(?:\ba|\bat|desde|des de|from|hasta|fins a|distancia(?: de)?|distance(?: of)?|visto a|vist a|seen at)\s*(?:unos\s*|uns\s*|about\s*)?(\d+(?:\.\d+)?)\s*(m|mts?|metros?|metres?|meters?)(?![a-z])/);
  if (ds) { E.dist = parseFloat(ds[1]); v.push('a ' + fmt(E.dist, 1) + ' m'); } else if (d) E.dist = 0;
  if (/transparen|\bholo|t.?glass/.test(t)) { E.transp = true; v.push('transparente'); }
  if (/sol directo|sol directe|pleno sol|ple sol|direct sun/.test(t)) E.sol = 'directo'; else if (/sol indirecto|sol indirecte|sombra|ombra|indirect sun|shade/.test(t)) E.sol = 'indirecto';
  if (/(sin|sense|without|no) (backup|redundanc)/.test(t)) E.backup = false; else if (/backup|redundan/.test(t)) E.backup = true;
  if (/fibra|fiber|fibre/.test(t)) E.conexion = 'fibra';
  if (/(sin|sense|without|no) (mediaserver|media server|servidor)/.test(t)) E.marca = 'ninguno'; else if (/mediaserver|media server|servidor de|content server/.test(t)) E.marca = 'todos';
  return v;
}

/* ---------- cálculo ---------- */
/* brillo que hace falta según el sol (decisión pendiente de confirmar por Josep): a pleno sol, 5000 nits o más; con sol indirecto o sombra, de 2500 a 5000 */
const SOL_DIRECTO = 5000, SOL_INDIRECTO = 2500;
const famN = (m) => String(m.family || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, ''), esHolo = (m) => famN(m).includes('holo'), esTransp = (m) => esHolo(m) || famN(m) === 'tglass';
const HOLO_DRIVER = 75;   /* mm de caja de drivers de cada cabinet HOLO: no lleva píxeles */
const RESMIN = { HD: [1280, 720], FHD: [1920, 1080], '4K': [3840, 2160] };
const MIN_NITS = { OUTDOOR: 5000, ESCAPARATE: 2500, INDOOR: 0 };
function calcula() {
  R = null; if (!CAT.length) return;
  let lista = CAT.filter((m) => m.tipo === E.tipo && m.class === E.clase), relajado = '';
  if (!lista.length) { lista = CAT.filter((m) => m.tipo === E.tipo); relajado = 'No hay modelos de ' + (E.clase === 'RENTAL' ? 'alquiler' : 'instalación fija') + ' para este entorno: se muestran todos.'; }
  /* LED transparente: las familias HOLO y T·Glass solo se proponen con el botón TRANSPARENTE; sin él quedan fuera para que una petición normal no acabe en una malla */
  { const tr = lista.filter(esTransp); if (E.transp) { if (tr.length) lista = tr; else relajado += (relajado ? ' ' : '') + 'No hay LED transparente (HOLO o T·Glass) para este entorno: se muestran los normales.'; } else if (tr.length < lista.length) lista = lista.filter((m) => !esTransp(m)); }
  /* entorno marino o tropical: solo cabinets con contactos de oro (tecnología GOLD), como en la clásica */
  if (E.gold) { const g = lista.filter((m) => /gold/i.test(String(m.tech || ''))); if (g.length) lista = g; else relajado += (relajado ? ' ' : '') + 'No hay cabinets tropicalizados (GOLD) para este entorno: se muestran los normales.'; }
  const nitsLista = [...new Set(CAT.filter((m) => m.tipo === E.tipo && m.nits > 0).map((m) => +m.nits))].sort((a, b) => a - b);
  const conSol = E.tipo !== 'INDOOR' ? E.sol : '', base = conSol === 'directo' ? SOL_DIRECTO : conSol === 'indirecto' ? SOL_INDIRECTO : (MIN_NITS[E.tipo] || 0), nits = Math.max(base, +E.nitsMin || 0), tope = conSol === 'indirecto' && nits < SOL_DIRECTO ? SOL_DIRECTO : Infinity;
  { const enRango = lista.filter((m) => m.nits >= nits && m.nits < tope), conNits = lista.filter((m) => m.nits >= nits);
    if (enRango.length) lista = enRango; else if (conNits.length) { lista = conNits; if (conSol === 'indirecto') relajado += (relajado ? ' ' : '') + 'No hay cabinets entre ' + SOL_INDIRECTO + ' y ' + SOL_DIRECTO + ' nits: se muestran los de más brillo.'; }
    else if (conSol) relajado += (relajado ? ' ' : '') + 'Ningún cabinet de este entorno llega a ' + nits + ' nits: se muestran los que hay.'; }
  lista = ordenar(lista); if (!lista.length) { R = { vacio: true }; return; }
  /* al alcance del público: en interior fijo pasan delante los LED protegidos (UfixAvant HOB y UfixCOB), sin saltarse el stock */
  if (E.protegido && E.tipo === 'INDOOR') { const fam = (m) => String(m.family || '').toLowerCase().replace(/[^a-z0-9]/g, ''), tec = (m) => String(m.tech || '').toUpperCase().trim(), prot = (m) => (tec(m) === 'HOB' && fam(m) === 'ufixavant') || (tec(m) === 'COB' && fam(m) === 'ufixcob');
    lista = lista.map((m, i) => [m, i]).sort((a, b) => ((enStock(a[0]) ? 0 : 2) + (prot(a[0]) ? 0 : 1)) - ((enStock(b[0]) ? 0 : 2) + (prot(b[0]) ? 0 : 1)) || a[1] - b[1]).map((x) => x[0]); }
  const pitches = [...new Set(lista.map((m) => m.pitch))].sort((a, b) => a - b);
  let pitch, origen;
  if (E.crm && lista.some((m) => m.crm === E.crm)) { pitch = lista.find((m) => m.crm === E.crm).pitch; origen = E.pitch ? 'pedido' : 'elegido'; }
  else if (E.pitch) { pitch = pitches.reduce((b, x) => (Math.abs(x - E.pitch) < Math.abs(b - E.pitch) ? x : b), pitches[0]); origen = pitch === E.pitch ? 'pedido' : 'cercano'; }
  else if (E.resMin && RESMIN[E.resMin]) { const [tw, th] = RESMIN[E.resMin], vale = pitches.filter((x) => { const q = calcularLed({ ancho: E.w, alto: E.h }, lista.find((m) => m.pitch === x), E.ajuste); return q.resW >= tw && q.resH >= th; }); pitch = vale.length ? vale[vale.length - 1] : pitches[0]; origen = vale.length ? 'resolucion' : 'sinres'; }
  else if (E.dist) { const c = pitches.filter((x) => x <= E.dist + 1e-9); pitch = c.length ? c[c.length - 1] : pitches[0]; origen = 'distancia'; }
  else { pitch = pitches[0]; origen = 'auto'; }
  const delPitch = lista.filter((m) => m.pitch === pitch), m0 = delPitch.find((x) => x.crm === E.crm) || delPitch[0], giraPosible = +m0.cabAncho !== +m0.cabAlto,
    /* cabinet girado 90°: se intercambian su ancho y su alto, en milímetros y en píxeles */
    m = E.giro && giraPosible && !esHolo(m0) ? { ...m0, cabAncho: m0.cabAlto, cabAlto: m0.cabAncho, cabPixAncho: m0.cabPixAlto, cabPixAlto: m0.cabPixAncho, girado: true } : m0;
  let r = calcularLed({ ancho: E.w, alto: E.h }, m, E.ajuste), holo = null; const pixCab = m.cabPixAncho * m.cabPixAlto;
  /* HOLO (malla semitransparente colgada), igual que en la clásica: una fila o dos contrapuestas (la de arriba con su caja de drivers arriba y la de abajo con la suya abajo),
     alturas a elegir entre los cabinets HOLO del mismo ancho, anchos que pueden combinar el cabinet ancho y el estrecho, y píxeles solo en la malla (el alto menos la caja de drivers) */
  if (esHolo(m)) {
    const W = E.w * 1000, Hm = E.h * 1000, fam = CAT.filter(esHolo), alturas = [...new Set(fam.filter((x) => +x.cabAncho === +m.cabAncho).map((x) => +x.cabAlto))].sort((a, b) => a - b), hL = alturas.length ? alturas : [+m.cabAlto];
    const combos = hL.map((h) => ({ top: h, bot: 0, total: h })); hL.forEach((a, i) => hL.slice(i).forEach((b) => combos.push({ top: a, bot: b, total: a + b })));
    const alt = combos.reduce((b, c) => (Math.abs(c.total - Hm) < Math.abs(b.total - Hm) ? c : b), combos[0]);
    /* combinación de anchos: hermanos del mismo pitch y alto con otro ancho (por ejemplo 750 + 250 mm), dentro de un ±15 % de la medida */
    let comb = null; { const her = fam.filter((x) => +x.cabAlto === +m.cabAlto && +x.pitch === +m.pitch), an = [...new Set(her.map((x) => +x.cabAncho))].sort((a, b) => b - a);
      if (an.length >= 2) { const mA = her.find((x) => +x.cabAncho === an[0]), mE = her.find((x) => +x.cabAncho === an[1]), tope = Math.ceil(W / an[1]) + 1; let mejor = null, dif = Infinity;
        for (let g = 0; g <= tope; g++) for (let e = 0; e <= tope; e++) { if (!g && !e) continue; const tot = g * an[0] + e * an[1], d = Math.abs(tot - W); if (tot >= W * .85 && tot <= W * 1.15 && (d < dif || (d === dif && mejor && g + e < mejor.cA + mejor.cE))) { dif = d; mejor = { mA, mE, cA: g, cE: e, total: tot }; } }
        if (mejor && mejor.cA > 0 && mejor.cE > 0) comb = mejor; } }
    const porFila = comb ? comb.cA + comb.cE : Math.max(1, Math.round(W / m.cabAncho)), anchoMm = comb ? comb.total : porFila * m.cabAncho, filas = alt.bot ? 2 : 1, altoMm = alt.top + alt.bot;
    const suma = (k) => (comb ? comb.cA * (+comb.mA[k] || 0) + comb.cE * (+comb.mE[k] || 0) : porFila * (+m[k] || 0)) * filas;
    const ppm = m.cabAlto - HOLO_DRIVER > 0 ? m.cabPixAlto / (m.cabAlto - HOLO_DRIVER) : 0, resW = comb ? comb.cA * comb.mA.cabPixAncho + comb.cE * comb.mE.cabPixAncho : porFila * m.cabPixAncho, resH = Math.round((alt.top - HOLO_DRIVER) * ppm) + (alt.bot ? Math.round((alt.bot - HOLO_DRIVER) * ppm) : 0);
    r = { cols: porFila, rows: filas, cab: porFila * filas, ancho: anchoMm / 1000, alto: altoMm / 1000, resW, resH, pix: resW * resH, lineas: 1, peso: suma('cabKg'), kw: suma('wMax') / 1000, amp: suma('cabAmp'), salidas4k: Math.ceil(resW / 3840) * Math.ceil(resH / 2160), sobra: { w: E.w - anchoMm / 1000, h: E.h - altoMm / 1000 } };
    holo = { top: alt.top, bot: alt.bot, comb, anchos: comb ? Array(comb.cA).fill(+comb.mA.cabAncho).concat(Array(comb.cE).fill(+comb.mE.cabAncho)) : Array(porFila).fill(+m.cabAncho), alturas: hL };
  }
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
  const procs = ELEC.calcularElectronicas({ lines: r.lineas, totalPix: r.pix, porSup: null }, { backup: E.backup, escalador: E.escalador, conexion: E.conexion, entradas: Math.max(1, +E.entradas || 1), tipoEntrada: E.tipoEntrada === 'MIXTO' ? '' : E.tipoEntrada, resEntrada: E.resEntrada }, []);
  const medias = E.marca === 'ninguno' ? [] : ELEC.calcularMediaservers({ totalPix: Math.max(1, r.salidas4k) * ELEC.ELEC_PX_4K, resW: r.resW, resH: r.resH }, { marca: E.marca, dante: !!E.dante, entradas: Math.max(1, +E.entradas || 1) });
  const vert = cosido === 'vertical', puerto = (c, f) => dePuerto[c + '_' + f] || 0;
  const ampCab = holo && r.amp ? r.amp / r.cab : Number(m.cabAmp) || (m.wMax ? m.wMax / 230 : 0), cabLinea = ampCab > 0 ? Math.max(1, Math.floor(16 / ampCab)) : r.cab;
  /* reparto eléctrico en líneas de 16 A con el mismo criterio de cosido que la señal: columnas o filas enteras por línea */
  const colsPL = Math.floor(cabLinea / r.rows), filasPL = Math.floor(cabLinea / r.cols), eV = colsPL >= 1 ? Math.ceil(r.cols / colsPL) : 0, eH = filasPL >= 1 ? Math.ceil(r.rows / filasPL) : 0;
  const cosE = E.cosido === 'vertical' && eV ? 'vertical' : E.cosido === 'horizontal' && eH ? 'horizontal' : eV && eH ? (eH < eV ? 'horizontal' : 'vertical') : eV ? 'vertical' : eH ? 'horizontal' : 'serpentina';
  const nLin = cosE === 'vertical' ? eV : cosE === 'horizontal' ? eH : Math.ceil(r.cab / cabLinea), rutasE = Array.from({ length: nLin }, () => []);
  if (cosE === 'vertical') for (let c = 0; c < r.cols; c++) { const j = c % colsPL; for (let q = 0; q < r.rows; q++) rutasE[Math.floor(c / colsPL)].push([c, j % 2 ? r.rows - 1 - q : q]); }
  else if (cosE === 'horizontal') for (let f = 0; f < r.rows; f++) { const j = f % filasPL; for (let q = 0; q < r.cols; q++) rutasE[Math.floor(f / filasPL)].push([j % 2 ? r.cols - 1 - q : q, f]); }
  else for (let f = 0, n = 0; f < r.rows; f++) for (let q = 0; q < r.cols; q++, n++) rutasE[Math.floor(n / cabLinea)].push([f % 2 ? r.cols - 1 - q : q, f]);
  const deLinea = {}; rutasE.forEach((ru, i) => ru.forEach(([c, f]) => { deLinea[c + '_' + f] = i; }));
  const linea = (c, f) => deLinea[c + '_' + f] || 0;
  R = { m, r, lista, pitches, pitch, origen, delPitch, relajado, procs, proc: procs.find((x) => x.modelo === E.procSel) || procs[0] || null, nitsLista, formato: (() => { const mcd = (a, b) => (b ? mcd(b, a % b) : a), a = Math.round(r.ancho * 1000), b = Math.round(r.alto * 1000), q = mcd(a, b); return a / q <= 32 && b / q <= 32 ? a / q + ':' + b / q : fmt(r.ancho / r.alto, 2) + ':1'; })(), nivel: r.resW >= 7680 && r.resH >= 4320 ? ['8K', 'ULTRA HD'] : r.resW >= 3840 && r.resH >= 2160 ? ['4K', 'ULTRA HD'] : r.resW >= 1920 && r.resH >= 1080 ? ['FHD', 'FULL HD'] : r.resW >= 1280 && r.resH >= 720 ? ['HD', 'HD 720P'] : ['', ''], medias, media: medias.find((x) => x.modelo === E.mediaSel) || medias[0] || null, puerto, linea, nLin, ampCab, vert, nits, giraPosible: giraPosible && !holo, holo, cosido, cosidoNo, rutas, cabPuerto, rutasE, cosE,
    diag: Math.hypot(r.ancho, r.alto), lineasTxt: lineasCosido(r.cols, r.rows, pixCab) };
}

/* ---------- dibujos de las mini pantallas ---------- */
const FIG = (() => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('style', 'position:absolute;width:0;height:0;visibility:hidden'); s.innerHTML = `<path d="${HUMAN_PATH}"/>`; document.body.appendChild(s); let b = { x: 0, y: 0, width: 6400, height: 12800 }; try { const q = s.firstChild.getBBox(); if (q.height > 0) b = q; } catch (e) {} s.remove(); return b; })();
/* persona de 1,75 m: «cx» es el centro, «suelo» la línea de los pies y «k» los píxeles por metro */
const figura = (cx, suelo, k, relleno) => { const e = 1.75 * k / FIG.height; return `<g transform="translate(${cx - (FIG.x + FIG.width / 2) * e},${suelo + FIG.y * e}) scale(${e},${-e})" ${relleno}><path d="${HUMAN_PATH}"/></g>`; };
const COLS = ['#19b5b0', '#c264c8', '#62b85a', '#4b4bc8', '#c2c040', '#e0803a', '#3a9be0', '#d0507a', '#8a8f9a', '#40c090'];
/* medida real de lo que abarca cada textura de pared (ancho × alto en metros): así los ladrillos, las lamas y las losas salen a la misma escala que la pantalla y la persona, se vea la simulación al tamaño que se vea */
/* v10.42 · la madera es un friso de tablas de 15 cm (2,40 × 3,00 m por pieza): las lamas finas de antes se veían como palillos a esta escala */
const PARED = { hormigon: [3.6, 2.39, 1], madera: [2.4, 3.0], marmol: [2.4, 2.4], 'ladrillo-rojo': [1, .64], 'ladrillo-oscuro': [1, .912], 'ladrillo-claro': [1, .64] };
/* «prop» es ancho / alto del hueco donde se va a ver: el dibujo se hace con esa proporción para llenarlo */
function svgSim(prop, anchoPx) {
  if (!prop) { const c = document.querySelector('[data-blk="S1A"] .blk-cu'); prop = c && c.clientHeight > 40 ? c.clientWidth / c.clientHeight : 1.6; anchoPx = c ? c.clientWidth : 0; }
  /* hueco que hay que dejar arriba para los dos controles que van encima (elevación y pared), que no cambian de tamaño con el dibujo */
  const uPx = parseFloat(getComputedStyle(document.documentElement).fontSize) / 17 || 1, ARRIBA = anchoPx > 0 ? Math.max(120, Math.min(260, 92 * uPx / (anchoPx / 860) + 28)) : 150;
  const { r, m } = R, W = 860, H = Math.round(W / Math.max(.75, Math.min(1.5, prop))), sueloY = H - 56, elev = E.elev / 100, altoTotal = Math.max(2.2, r.alto + elev + .35), anchoTotal = Math.max(r.ancho + 1.9, 3), PANEL = 250, LIMA = '#c6e04a';
  const k = Math.min((sueloY - ARRIBA) / altoTotal, (W - PANEL - 70) / anchoTotal), pw = r.ancho * k, ph = r.alto * k, cx0 = PANEL + (W - PANEL) / 2, px = cx0 - pw / 2 + .4 * k, py = sueloY - elev * k - ph, hx = px - .62 * k;
  let g = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Simulación de la pantalla a escala con una persona de 1,75 m">`;
  g += `<defs><clipPath id="cp"><rect x="${px}" y="${py}" width="${pw}" height="${ph}"/></clipPath></defs>`;
  if (E.fondo === 'propio' && FPROP) { const vw = Math.max(W, H * prop), vh = Math.max(H, W / prop), vx = (W - vw) / 2, vy = H - vh;
    /* la foto propia cubre toda la pared que se ve (no tiene escala conocida) */
    g += `<rect x="-4000" y="-4000" width="9000" height="${4000 + sueloY}" fill="#3a3b40"/><image href="${esc(FPROP)}" x="${vx}" y="${vy}" width="${vw}" height="${sueloY - vy}" preserveAspectRatio="xMidYMid slice"/>`; }
  else if (E.fondo !== 'ninguno' && E.fondo !== 'propio') { const t = PARED[E.fondo] || PARED.hormigon, tw = t[0] * k, th = t[1] * k, u = `../assets/sim/${PARED[E.fondo] ? E.fondo : 'hormigon'}.jpg${TEXV}`, im = (tr) => `<image href="${u}" width="${tw + .6}" height="${th + .6}" preserveAspectRatio="none"${tr ? ` transform="${tr}"` : ''}/>`;
    /* el hormigón no es una textura continua: se repite en espejo para que no se vean las juntas */
    g += `<defs><pattern id="pared" patternUnits="userSpaceOnUse" x="${W / 2}" y="${sueloY - th * (t[2] ? 2 : 1)}" width="${tw * (t[2] ? 2 : 1)}" height="${th * (t[2] ? 2 : 1)}">${t[2] ? im() + im(`translate(${2 * tw},0) scale(-1,1)`) + im(`translate(0,${2 * th}) scale(1,-1)`) + im(`translate(${2 * tw},${2 * th}) scale(-1,-1)`) : im()}</pattern></defs><rect x="-4000" y="-4000" width="9000" height="${4000 + sueloY}" fill="url(#pared)"/>`; }
  /* el suelo es una banda de color pastel que contrasta con la pared, no una continuación de su textura */
  g += `<rect data-suelo x="-4000" y="${sueloY}" width="9000" height="900" fill="${SUELO[E.fondo] || '#bfe6d8'}"/><rect x="-4000" y="${sueloY}" width="9000" height="5" fill="#000" fill-opacity=".28"/>`;
  g += `<rect x="${px - 5}" y="${py - 5}" width="${pw + 10}" height="${ph + 10}" fill="#050506" rx="3"/>` + (CONT && CONT.tipo === 'marco' ? (() => { const e = Math.max(pw / 16, ph / 9), iw = 16 * e, ih = 9 * e; return `<foreignObject x="${px}" y="${py}" width="${pw}" height="${ph}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;overflow:hidden;position:relative;background:#000"><iframe src="${esc(CONT.url)}" title="Contenido simulado" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;left:${(pw - iw) / 2}px;top:${(ph - ih) / 2}px;width:${iw}px;height:${ih}px;border:0;pointer-events:none"></iframe></div></foreignObject>`; })() : CONT && CONT.tipo === 'video' ? `<foreignObject x="${px}" y="${py}" width="${pw}" height="${ph}"><video src="${CONT.url}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;display:block;background:#000"></video></foreignObject>` : `<image href="${CONT ? CONT.url : '../assets/SCCHART.jpg'}" x="${px}" y="${py}" width="${pw}" height="${ph}" preserveAspectRatio="${CONT ? 'xMidYMid slice' : 'none'}" clip-path="url(#cp)"/>`);
  if (!CONT && !R.holo) for (let c = 1; c < r.cols; c++) g += `<line x1="${px + c * pw / r.cols}" y1="${py}" x2="${px + c * pw / r.cols}" y2="${py + ph}" stroke="#d4ff00" stroke-opacity=".55" stroke-width="1"/>`;
  if (!CONT && !R.holo) for (let f = 1; f < r.rows; f++) g += `<line x1="${px}" y1="${py + f * ph / r.rows}" x2="${px + pw}" y2="${py + f * ph / r.rows}" stroke="#d4ff00" stroke-opacity=".55" stroke-width="1"/>`;
  g += figura(hx, sueloY, k, /marmol|claro/.test(E.fondo) || (E.fondo === 'ninguno' && E.tema === 'claro') ? 'fill="#3f4149" fill-opacity=".9"' : 'fill="#d5d5db" fill-opacity=".92" stroke="#1c1d22" stroke-opacity=".6" stroke-width="1.5" vector-effect="non-scaling-stroke"') + `<text x="${hx - .3 * k}" y="${sueloY - 9}" text-anchor="end" font-size="17" fill="#fff" stroke="#000" stroke-opacity=".6" stroke-width="3.2" paint-order="stroke" font-family="Share Tech Mono, monospace">175 cm</text>`;
  { const t1 = `PANTALLA LED ${esc(m.crm)} · ${fmt(r.ancho * 100)} × ${fmt(r.alto * 100)} cm · ${fmt(R.diag / .0254)}″ · ${r.cols}×${r.rows} = ${r.cab} cabinets · ${r.resW}×${r.resH} px`, f1 = Math.min(19, 1.72 * (W - 24) / t1.length);
    g += `<text x="${W / 2}" y="${sueloY + 35}" text-anchor="middle" font-size="${f1.toFixed(1)}" font-weight="800" fill="#1c1d22" font-family="Inter, sans-serif">${t1}</text>`; }
  /* HOLO, como en la clásica: malla semitransparente (se ve la pared a través), cajas de drivers arriba (y abajo si hay dos filas contrapuestas), anillas de colgar y columnas con su ancho real */
  if (R.holo) { const ho = R.holo, db = HOLO_DRIVER / (ho.top + ho.bot) * ph, an = ho.anchos, sumA = an.reduce((a, b) => a + b, 0), rs = Math.max(3.5, Math.min(9, pw / 70));
    const caja = (y) => `<rect x="${px}" y="${y}" width="${pw}" height="${db}" fill="#5a5a5e" stroke="#8a8a90" stroke-width="1"/>` + (db > 9 ? `<text x="${px + pw / 2}" y="${y + db * .74}" text-anchor="middle" font-size="${Math.min(13, db * .72).toFixed(1)}" font-weight="800" fill="#fff" fill-opacity=".72" letter-spacing="2" font-family="Inter, sans-serif">DRIVER</text>` : '');
    g += `<defs><pattern id="malla" patternUnits="userSpaceOnUse" width="6" height="6"><circle cx="3" cy="3" r="1.15" fill="#000" fill-opacity=".5"/></pattern></defs><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="url(#pared)" fill-opacity=".42"/><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="url(#malla)"/>` + caja(py) + (ho.bot ? caja(py + ph - db) + `<line x1="${px}" y1="${py + ho.top / (ho.top + ho.bot) * ph}" x2="${px + pw}" y2="${py + ho.top / (ho.top + ho.bot) * ph}" stroke="#d4ff00" stroke-opacity=".6" stroke-width="1"/>` : '');
    let x = px; an.forEach((a, i) => { const w = a / sumA * pw; [.28, .72].forEach((q) => { g += `<circle cx="${x + w * q}" cy="${py - rs}" r="${rs}" fill="#c8c8c8" fill-opacity=".3" stroke="#444" stroke-width="${(rs * .45).toFixed(1)}"/>`; }); x += w; if (i < an.length - 1) g += `<line x1="${x}" y1="${py}" x2="${x}" y2="${py + ph}" stroke="#d4ff00" stroke-opacity=".55" stroke-width="1"/>`; }); }
  /* sobre la carta de ajuste, como en la clásica: número de cada columna y fila de cabinets y el rótulo de resolución, nivel y formato */
  if (!CONT) { const cw = pw / r.cols, chh = ph / r.rows, tf = Math.max(8, Math.min(20, Math.min(cw, chh) * .2)), dos = (n) => String(n).padStart(2, '0'), ha = 'fill="#fff" stroke="#000" stroke-opacity=".7" stroke-width="' + (tf * .22).toFixed(1) + '" paint-order="stroke" font-weight="800" font-family="Inter, sans-serif" text-anchor="middle"';
    if (cw > 26 && chh > 20 && !R.holo) { for (let c = 0; c < r.cols; c++) g += `<text x="${px + c * cw + cw / 2}" y="${py + chh / 2 + tf * .36}" font-size="${tf}" ${ha}>${dos(c + 1)}</text>`; for (let f = 1; f < r.rows; f++) g += `<text x="${px + cw / 2}" y="${py + f * chh + chh / 2 + tf * .36}" font-size="${tf}" ${ha}>${dos(f + 1)}</text>`; }
    const rt = `${r.resW} × ${r.resH}${R.nivel[0] ? ' · ' + R.nivel[0] : ''} · ${R.formato}`, rf = Math.max(9, Math.min(22, pw / (rt.length * .72))), rw = rt.length * rf * .62 + rf * 1.6;
    if (rw < pw - 6 && ph > rf * 3) g += `<rect x="${px + pw / 2 - rw / 2}" y="${py + ph - rf * 2.5}" width="${rw}" height="${rf * 1.7}" rx="${rf * .3}" fill="#000" fill-opacity=".72"/><text x="${px + pw / 2}" y="${py + ph - rf * 1.3}" text-anchor="middle" font-size="${rf}" fill="#fff" font-family="Share Tech Mono, monospace">${rt}</text>`; }
  /* cuadros de datos a la izquierda, dentro de la imagen para que salgan en la captura: resolución, resumen y distancia de visionado */
  { const X = 16, AN = 218, caja = (y, al) => `<rect x="${X}" y="${y}" width="${AN}" height="${al}" rx="9" fill="#17181c" fill-opacity=".93" stroke="#000" stroke-width="1.5"/>`, mono = 'font-family="Share Tech Mono, monospace"', cmS = (v) => fmt(v * 100) + 'cm';
    let y = Math.max(70, Math.min(110, sueloY - 400));
    g += caja(y, 156) + `<rect x="${X + 34}" y="${y + 12}" width="${AN - 68}" height="80" rx="7" fill="#050506" stroke="${LIMA}" stroke-opacity=".7" stroke-width="1.5"/>` + (R.nivel[0] ? `<text x="${X + AN / 2}" y="${y + 50}" text-anchor="middle" font-size="34" fill="${LIMA}" ${mono}>${R.nivel[0]}</text><text x="${X + AN / 2}" y="${y + 80}" text-anchor="middle" font-size="20" fill="#fff" ${mono}>${R.nivel[1]}</text>` : `<text x="${X + AN / 2}" y="${y + 60}" text-anchor="middle" font-size="22" fill="${LIMA}" ${mono}>${R.formato}</text>`) + `<text x="${X + AN / 2}" y="${y + 118}" text-anchor="middle" font-size="22" fill="#fff" ${mono}>${r.resW}x${r.resH}</text><text x="${X + AN / 2}" y="${y + 143}" text-anchor="middle" font-size="19" fill="#fff" ${mono}>pixels</text>`;
    y += 168; const fila = (n, ic, t) => `<g transform="translate(${X + 18},${y + 16 + n * 30})" fill="none" stroke="${LIMA}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic}</g><text x="${X + 50}" y="${y + 33 + n * 30}" font-size="21" fill="#fff" ${mono}>${t}</text>`;
    g += caja(y, 140) + fila(0, '<rect x="1" y="1" width="7" height="7" rx="1"/><rect x="12" y="1" width="7" height="7" rx="1"/><rect x="1" y="12" width="7" height="7" rx="1"/><rect x="12" y="12" width="7" height="7" rx="1"/>', r.cols + 'x' + r.rows) + fila(1, `<circle cx="10" cy="10" r="6" fill="${LIMA}"/>`, m.pitch + 'p') + fila(2, '<path d="M1 10h18M5 6l-4 4 4 4M15 6l4 4-4 4"/>', cmS(r.ancho)) + fila(3, '<path d="M10 1v18M6 5l4-4 4 4M6 15l4 4 4-4"/>', cmS(r.alto)) + `<text x="${X + AN - 46}" y="${y + 74}" text-anchor="middle" font-size="${r.cab > 999 ? 30 : 44}" fill="${LIMA}" ${mono}>${r.cab}</text><text x="${X + AN - 46}" y="${y + 98}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#b9bbc4" font-family="Inter, sans-serif" letter-spacing=".5">CABINETS</text>`;
    y += 152;
    g += caja(y, 62) + `<g transform="translate(${X + 14},${y + 9}) scale(.8)" fill="none" stroke="${LIMA}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></g><text x="${X + 40}" y="${y + 24}" font-size="15.5" fill="#fff" ${mono}>Distancia visionado</text><text x="${X + 14}" y="${y + 49}" font-size="${Math.min(15.5, (AN - 26) / (('Mínima ' + cmS(m.pitch) + ' Óptima ' + cmS(m.pitch * 3)).length * .56)).toFixed(1)}" fill="#fff" ${mono}>Mínima ${cmS(m.pitch)} Óptima ${cmS(m.pitch * 3)}</text>`; }

  const cota = (x1, y1, x2, y2, txt, vert) => { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, tw = txt.length * 13.4 + 22; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#37c8ff" stroke-width="1.6" stroke-dasharray="5 4"/><g transform="translate(${mx},${my})${vert ? ' rotate(90)' : ''}"><rect x="${-tw / 2}" y="-18" width="${tw}" height="36" rx="7" fill="#fff" stroke="#0090d0" stroke-width="2"/><text y="8" text-anchor="middle" font-size="24" fill="#005a8a" font-family="Share Tech Mono, monospace">${txt}</text></g>`; };
  g += cota(px, py - 30, px + pw, py - 30, 'ANCHO ' + fmt(r.ancho * 100) + ' cm') + cota(px + pw + 34, py, px + pw + 34, py + ph, 'ALTO ' + fmt(r.alto * 100) + ' cm', true);
  if (elev > 0.05) { const ex = px + pw / 2, ey = (py + ph + sueloY) / 2, et = fmt(E.elev) + ' cm', ew = et.length * 13.4 + 22; g += `<line x1="${ex}" y1="${py + ph + 5}" x2="${ex}" y2="${sueloY}" stroke="#fff" stroke-width="4.2"/><line x1="${ex}" y1="${py + ph + 5}" x2="${ex}" y2="${sueloY}" stroke="#7a14d6" stroke-width="2" stroke-dasharray="6 4"/>` + (sueloY - py - ph > 44 ? `<g transform="translate(${ex},${ey})"><rect x="${-ew / 2}" y="-18" width="${ew}" height="36" rx="7" fill="#fff" stroke="#7a14d6" stroke-width="2"/><text y="8" text-anchor="middle" font-size="24" fill="#5a0aa8" font-family="Share Tech Mono, monospace">${et}</text></g>` : ''); }
  return g + '</svg>';
}
/* cableado de señal o eléctrico sobre la pantalla vista por detrás: qué cabinets van en cada puerto o línea y por dónde va el cable.
   v10.26 · para el instalador: cada cable sale de su cabinet de entrada hasta el borde de la pantalla y de ahí, por la MANGUERA (el tubo o caño
   que reúne todos los cables), hasta el procesador o el cuadro. Con backup, cada puerto lleva un segundo cable (en discontinua) que entra por
   el ÚLTIMO cabinet de su cadena, así que la manguera tiene que llegar también a ese lado. */
function svgRejilla(tipo) {
  const { r } = R, sen = tipo === 'senal', bk = sen && !!E.backup, W = 1000, H = 620, n = sen ? r.lineas : R.nLin, de = sen ? R.puerto : R.linea, rutas = sen ? R.rutas : R.rutasE;
  /* salida de la manguera: una de las 4 esquinas o de los 4 centros de lateral (E.mang; por defecto, abajo en el centro). La caja va por fuera, junto a la salida */
  const MG = MANG.includes(E.mang) ? E.mang : 'bc', mV = MG[0], mH = MG[1], lado = mV === 'm' ? (mH === 'l' ? 'l' : 'r') : '';
  const filasLey = Math.ceil(Math.min(n, 12) / 4), pyTop = 124 + (mV === 't' ? 74 : 0), bajo = 38 + (mV === 'b' ? 74 : 0) + filasLey * 44 + (n > 12 ? 18 : 0), anchoU = lado ? 690 : 840;
  const k = Math.min(anchoU / r.ancho, (H - pyTop - bajo) / r.alto), pw = r.ancho * k, ph = r.alto * k, px = lado === 'l' ? 240 + (W - 240 - pw) / 2 : lado === 'r' ? (W - 240 - pw) / 2 : (W - pw) / 2, py = pyTop, cw = pw / r.cols, chh = ph / r.rows;
  const tf = Math.max(9, Math.min(22, Math.min(cw, chh) * .42)), cx = (c) => px + c * cw + cw / 2, cy = (f) => py + (r.rows - 1 - f) * chh + chh / 2, CAB = sen ? COL_SENAL.eth : COL_SENAL.power, tc = 'currentColor';
  let g = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="color:var(--txt)" role="img" aria-label="${sen ? 'Reparto de cabinets por puerto de datos' : 'Reparto de cabinets por línea eléctrica'}">`;
  g += `<defs><marker id="fl" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#0b0b10"/></marker></defs>`;
  for (let f = 0; f < r.rows; f++) for (let c = 0; c < r.cols; c++) { const i = de(c, f), col = COLS[i % COLS.length]; g += `<rect x="${px + c * cw + .6}" y="${py + (r.rows - 1 - f) * chh + .6}" width="${cw - 1.2}" height="${chh - 1.2}" fill="${col}" fill-opacity=".8" stroke="rgba(0,0,0,.35)"/>`;
    if (cw > 20 && chh > 16) g += `<text x="${px + c * cw + cw * .2}" y="${py + (r.rows - 1 - f) * chh + tf * .62 + chh * .08}" text-anchor="middle" font-size="${tf * .62}" font-weight="800" fill="#0b0b10" fill-opacity=".72" font-family="Inter, sans-serif">${i + 1}</text>`; }
  const gr = Math.max(1.6, Math.min(5, Math.min(cw, chh) * .09));
  rutas.forEach((ru) => { if (!ru.length) return; g += `<polyline points="${ru.map(([c, f]) => cx(c).toFixed(1) + ',' + cy(f).toFixed(1)).join(' ')}" fill="none" stroke="#0b0b10" stroke-opacity=".82" stroke-width="${gr}" stroke-linejoin="round" stroke-linecap="round"${ru.length > 1 ? ' marker-end="url(#fl)"' : ''}/>`; });
  /* entradas de cable: la del cable principal (círculo) en el primer cabinet y, con backup, la del cable de reserva (cuadrado) en el último */
  const E2 = []; rutas.forEach((ru, i) => { if (!ru.length) return; E2.push({ i, c: ru[0][0], f: ru[0][1], bk: false }); if (bk) { const u = ru[ru.length - 1]; E2.push({ i, c: u[0], f: u[1], bk: true }); } });
  /* cada entrada sale por el borde que sigue el cosido: con cosido vertical, por abajo o por arriba; con horizontal, por la izquierda o por la derecha */
  const cos = sen ? R.cosido : R.cosE, borde = (e) => cos === 'vertical' ? (e.f <= (r.rows - 1) / 2 ? 'b' : 't') : cos === 'horizontal' ? (e.c <= (r.cols - 1) / 2 ? 'l' : 'r') : [['b', e.f], ['l', e.c], ['r', r.cols - 1 - e.c], ['t', r.rows - 1 - e.f]].reduce((a, b) => (b[1] < a[1] ? b : a))[0];
  const yB = py + ph + 22, yT = py - 20, xL = px - 24, xR = px + pw + 24, usa = { b: [], t: [], l: [], r: [] }; E2.forEach((e) => { e.b = borde(e); usa[e.b].push(e); });
  /* la manguera: un solo tubo gris que rodea la pantalla por el tramo más corto que recoge todas las entradas y llega a la salida elegida */
  const wR = xR - xL, hR = yB - yT, Lp = 2 * (wR + hR), xC = px + pw / 2, yM = (yT + yB) / 2;
  const tDe = (b, x, y) => b === 't' ? x - xL : b === 'r' ? wR + (y - yT) : b === 'b' ? wR + hR + (xR - x) : 2 * wR + hR + (yB - y);
  const enT = (t) => { t = ((t % Lp) + Lp) % Lp; if (t <= wR) return [xL + t, yT]; t -= wR; if (t <= hR) return [xR, yT + t]; t -= hR; if (t <= wR) return [xR - t, yB]; t -= wR; return [xL, yB - t]; };
  const P = { tl: [xL, yT], tc: [xC, yT], tr: [xR, yT], ml: [xL, yM], mr: [xR, yM], bl: [xL, yB], bc: [xC, yB], br: [xR, yB] }[MG], tP = tDe(mV === 'm' ? mH : mV, P[0], P[1]);
  const ts = [tP].concat(E2.map((e) => { const x = cx(e.c), y = cy(e.f); return tDe(e.b, e.b === 'l' ? xL : e.b === 'r' ? xR : x, e.b === 't' ? yT : e.b === 'b' ? yB : y); })).map((t) => ((t % Lp) + Lp) % Lp).sort((p, q) => p - q);
  let hueco = -1, gi = 0; ts.forEach((t, i) => { const h = (i === ts.length - 1 ? ts[0] + Lp : ts[i + 1]) - t; if (h > hueco) { hueco = h; gi = i; } });
  const t0 = ts[(gi + 1) % ts.length], largo = Lp - hueco, pts = [enT(t0)];
  [0, wR, wR + hR, 2 * wR + hR].map((c) => ((c - t0) % Lp + Lp) % Lp).filter((o) => o > .01 && o < largo - .01).sort((p, q) => p - q).forEach((o) => pts.push(enT(t0 + o))); pts.push(enT(t0 + largo));
  let tubos = largo > .5 ? `<path d="M${pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L')}"/>` : '';
  /* caja de destino: arriba o abajo (esquinas y centros de arriba y abajo) o a un lado (centros de los laterales) */
  const nC = sen ? r.lineas * (bk ? 2 : 1) : R.nLin, dest = sen ? (E.conexion === 'fibra' ? 'Al conversor de fibra' : 'Al procesador') : 'Al cuadro eléctrico';
  const cuenta = sen ? (bk ? `${r.lineas} + ${r.lineas} backup = ${nC} cables Cat6` : `${nC} ${nC > 1 ? 'cables' : 'cable'} Cat6`) : `${nC} ${nC > 1 ? 'líneas' : 'línea'} de 16 A`;
  let caja = '', yP = yB + 30;
  if (lado) { const bw = 200, bh = 96, xb = lado === 'r' ? xR + 30 : xL - 30 - bw, yb = Math.max(8, Math.min(H - bajo - bh, yM - bh / 2)), xt = xb + bw / 2;
    tubos += `<path d="M${P[0]} ${yM}H${lado === 'r' ? xb + 4 : xb + bw - 4}"/>`;
    const tx = (y, s, f, w) => `<text x="${xt}" y="${y}" text-anchor="middle" font-size="${f}" font-weight="${w}" fill="${tc}" font-family="${w > 400 ? 'Inter' : 'Share Tech Mono'}, sans-serif">${s}</text>`;
    caja = `<rect x="${xb}" y="${yb}" width="${bw}" height="${bh}" rx="10" fill="${CAB}" fill-opacity=".14" stroke="${CAB}" stroke-width="2"/>` + tx(yb + 22, 'MANGUERA', 16, 800) + tx(yb + 42, dest, 14, 700) + (sen && bk ? tx(yb + 64, `${nC} cables Cat6`, 15, 400) + tx(yb + 84, `${r.lineas} + ${r.lineas} backup`, 14, 400) : tx(yb + 70, cuenta, 15, 400));
  } else { const bw = 430, xb = Math.max(6, Math.min(W - bw - 6, P[0] - bw / 2)), yb = mV === 't' ? yT - 30 - 44 : yB + 30; yP = yb;
    tubos += `<path d="M${P[0]} ${P[1]}V${mV === 't' ? yb + 40 : yb + 4}"/>`;
    caja = `<rect x="${xb}" y="${yb}" width="${bw}" height="44" rx="10" fill="${CAB}" fill-opacity=".14" stroke="${CAB}" stroke-width="2"/><text x="${xb + bw / 2}" y="${yb + 19}" text-anchor="middle" font-size="16" font-weight="800" fill="${tc}" font-family="Inter, sans-serif">MANGUERA · ${dest}</text><text x="${xb + bw / 2}" y="${yb + 37}" text-anchor="middle" font-size="15" fill="${tc}" font-family="Share Tech Mono, monospace">${cuenta}</text>`; }
  g += `<g fill="none" stroke="${tc}" stroke-opacity=".2" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">${tubos}</g>`;
  /* cada cable, de su cabinet al tubo: continuo el principal y discontinuo el de backup */
  E2.forEach((e) => { const x = cx(e.c), y = cy(e.f), col = COLS[e.i % COLS.length], est = ` stroke="${CAB}" stroke-width="2.6" fill="none"${e.bk ? ' stroke-dasharray="6 4"' : ''}`;
    const d = e.b === 'b' ? `M${x} ${y}V${yB}` : e.b === 't' ? `M${x} ${y}V${yT}` : e.b === 'l' ? `M${x} ${y}H${xL}` : `M${x} ${y}H${xR}`; g += `<path d="${d}"${est}/>`;
    g += e.bk ? `<rect x="${x - gr * 2.3}" y="${y - gr * 2.3}" width="${gr * 4.6}" height="${gr * 4.6}" fill="#fff" stroke="${CAB}" stroke-width="${gr * .8}" stroke-dasharray="3 2"/>` : `<circle cx="${x}" cy="${y}" r="${gr * 2.1}" fill="#fff" stroke="#0b0b10" stroke-width="${gr * .7}"/>`;
    if (e.bk && cw > 26 && chh > 22) g += `<text x="${x}" y="${y + gr * .9}" text-anchor="middle" font-size="${gr * 2.6}" font-weight="900" fill="${col}" font-family="Inter, sans-serif">B</text>`; });
  g += caja;
  /* leyenda de puertos o líneas */
  const cols = Math.min(n, 4), lw = Math.min(236, 960 / cols), y0 = mV === 'b' ? yP + 58 : yB + 36;
  for (let i = 0; i < n && i < 12; i++) { const X = W / 2 - cols * lw / 2 + (i % cols) * lw, Y = y0 + Math.floor(i / cols) * 44, cabs = [...Array(r.cab).keys()].filter((q) => de(q % r.cols, Math.floor(q / r.cols)) === i).length;
    g += `<rect x="${X + 4}" y="${Y}" width="${lw - 8}" height="36" rx="7" fill="${COLS[i % COLS.length]}"/><text x="${X + lw / 2}" y="${Y + 25}" text-anchor="middle" font-size="21" font-weight="700" fill="#0b0b10" font-family="Share Tech Mono, monospace">${sen ? 'P' : 'L'}${i + 1} · ${cabs} cab${sen ? (bk ? ' · +B' : '') : ' · ' + fmt(cabs * R.ampCab, 1) + ' A'}</text>`; }
  if (n > 12) g += `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="19" fill="currentColor" font-family="Inter, sans-serif">… y ${n - 12} más</text>`;
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
  ['dist', 'Distancia', svgDistancia, () => 'Distancia de visionado'],
  ['esq', 'Esquema', () => svgEsquema(), () => 'Esquema de conexión']];

/* ---------- bloques ---------- */
const ICB = { M1A: 'entorno', M1B: 'cabinet', M2A: 'dims', M2B: 'cabs', M3A: 'res', M3B: 'chip', M3C: 'media', M3D: 'inst', M3E: 'red', M3F: 'rayo', S1A: 'sim', S1B: 'cable' };
const COSN = { auto: 'Auto', vertical: 'Vertical', horizontal: 'Horizontal' };
/* salida de la manguera: esquinas (tl, tr, bl, br) y centros de lateral (tc, ml, mr, bc). Cada flecha lleva a la siguiente posición en esa dirección */
const MANG = ['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'], MANGN = { tl: 'Arriba, izquierda', tc: 'Arriba, centro', tr: 'Arriba, derecha', ml: 'Izquierda, centro', mr: 'Derecha, centro', bl: 'Abajo, izquierda', bc: 'Abajo, centro', br: 'Abajo, derecha' };
const mueveMang = (p, d) => { const Y = 'tmb', X = 'lcr'; let y = Y.indexOf(p[0]), x = X.indexOf(p[1]); const dy = d === 'u' ? -1 : d === 'd' ? 1 : 0, dx = d === 'l' ? -1 : d === 'r' ? 1 : 0;
  for (let i = 0; i < 2; i++) { y += dy; x += dx; if (y < 0 || y > 2 || x < 0 || x > 2) return ''; if (!(y === 1 && x === 1)) return Y[y] + X[x]; } return ''; };
const FLE = { u: 'M12 19V5M5 12l7-7 7 7', d: 'M12 5v14M5 12l7 7 7-7', l: 'M19 12H5M12 5l-7 7 7 7', r: 'M5 12h14M12 5l7 7-7 7' }, FLEN = { u: 'arriba', d: 'abajo', l: 'a la izquierda', r: 'a la derecha' };
const mangCtl = () => { const p = MANG.includes(E.mang) ? E.mang : 'bc'; return `<div class="mangas" role="group" aria-label="Salida de la manguera"><span>Manguera</span>${['l', 'u', 'd', 'r'].map((d) => { const a = mueveMang(p, d); return `<button type="button" class="fle" data-set="mang" data-v="${a}" title="Mover la salida de la manguera ${FLEN[d]}" aria-label="Mover la salida de la manguera ${FLEN[d]}"${a ? '' : ' disabled'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="${FLE[d]}"/></svg></button>`; }).join('')}<em>${MANGN[p]}</em>${p !== 'bc' ? '<button type="button" data-set="mang" data-v="bc" title="Volver a la salida por defecto (abajo, centro)">Por defecto</button>' : ''}</div>`; };
const cosidoCtl = (v = 'senal') => `<div class="cosidos" role="group" aria-label="Cosido del cableado"><span>Cosido</span>${['auto', 'vertical', 'horizontal'].map((v) => `<button type="button" data-set="cosido" data-v="${v}" aria-pressed="${E.cosido === v}">${COSN[v]}</button>`).join('')}<em>${(() => { const c = v === 'elec' ? R.cosE : R.cosido, no = E.cosido !== 'auto' && E.cosido !== c; return (no ? 'No cabe así: ' : E.cosido === 'auto' ? '→ ' : '') + (no || E.cosido === 'auto' ? c : ''); })()}</em></div>` + mangCtl();
const blk = (area, id, tit, ac, cuerpo, extra = '', cls = '', ic = ICB[id]) => `<section class="blk ${cls}" style="grid-area:${area};--ac:${ac}" data-blk="${id}"><header class="blk-cab">${ic ? `<i class="blk-ic" aria-hidden="true">${IC[ic]}</i>` : ''}<b>${tit}</b><span class="sep"></span>${extra}<span class="id">${id}</span></header><div class="blk-cu">${cuerpo}</div></section>`;
const UNI = { m: 1, cm: 100, mm: 1000 };
/* campo primario con botones, como en la clásica: rótulo, − , valor en casilla de display y + */
const paso = (lab, val, menos, mas, cls = '') => `<div class="paso ${cls}"><span class="paso-r">${lab}</span><div class="paso-f"><button type="button" class="pb" ${menos}>−</button><b class="disp">${val}</b><button type="button" class="pb" ${mas}>+</button></div></div>`;
const num = (k, lab, val, uni, paso) => `<div class="num"><label for="n-${k}">${lab}</label><input id="n-${k}" type="number" inputmode="decimal" data-num="${k}" value="${val}" step="${paso}" min="0"><span>${uni}</span><div class="pm"><button type="button" data-pm="${k}" data-d="1" tabindex="-1" aria-label="Subir ${lab}">▲</button><button type="button" data-pm="${k}" data-d="-1" tabindex="-1" aria-label="Bajar ${lab}">▼</button></div></div>`;
const dato = (k, v) => `<div class="dato"><span>${k}</span><b>${v}</b></div>`;
function pintaRejilla() {
  const el = $('#rejilla'); if (!el) return;
  const TIPOS = [['INDOOR', 'Interior'], ['OUTDOOR', 'Exterior'], ['ESCAPARATE', 'Escaparate']];
  /* DIMENSIONES (M2A): lo que se pide (ancho, alto, formato, ajuste) y cómo queda con cabinets enteros, en un solo bloque */
  const dec = E.uni === 'm' ? 2 : 0, cel = (k, v) => `<div class="cel"><span>${k}</span><b>${v}</b></div>`;
  const dimEntra = `<div class="fila">${num('w', 'Ancho', +(E.w * UNI[E.uni]).toFixed(dec), E.uni, .1 * UNI[E.uni])}${num('h', 'Alto', +(E.h * UNI[E.uni]).toFixed(dec), E.uni, .1 * UNI[E.uni])}</div><div class="fila tres" role="group" aria-label="Ajustar el alto a un formato">${[['16:9', 9 / 16], ['4:3', 3 / 4], ['1:1', 1], ['9:16', 16 / 9]].map((f) => `<button type="button" class="tog" data-formato="${f[1]}" title="Pone el alto que corresponde a ${f[0]} con este ancho">${f[0]}</button>`).join('')}</div><div class="fila tres" role="group" aria-label="Cómo se ajusta a cabinets enteros">${tog(E.ajuste === 'dentro', 'data-set="ajuste" data-v="dentro" title="Cabinets enteros sin pasarse de la medida"', 'Que quepa')}${tog(E.ajuste === 'cerca', 'data-set="ajuste" data-v="cerca" title="Cabinets enteros lo más cerca posible de la medida, aunque se pase"', 'Lo más cercano')}</div>`;
  const dimUni = `<div class="pestanas" role="group" aria-label="Unidad de las medidas">${['m', 'cm', 'mm'].map((u) => `<button type="button" data-set="uni" data-v="${u}" aria-pressed="${E.uni === u}" style="text-transform:none">${u}</button>`).join('')}</div>`;
  const TIC = { INDOOR: 'eInt', OUTDOOR: 'eExt', ESCAPARATE: 'eEsc' }, tipoBt = (t) => tog(E.tipo === t[0], `data-set="tipo" data-v="${t[0]}"`, t[1], TIC[t[0]]);
  let h = blk('m1a', 'M1A', 'Entorno y uso', 'var(--azul)', `<div class="fila ico">${tipoBt(TIPOS[0])}${tipoBt(TIPOS[1])}</div><div class="fila ico">${tipoBt(TIPOS[2])}${tog(E.transp, 'data-set="transp" data-v="' + (E.transp ? '' : '1') + '" title="LED transparente: solo las familias HOLO y T·Glass"', 'Transparente', 'eTra')}</div><div class="fila ico">${tog(E.clase === 'INSTALL', 'data-set="clase" data-v="INSTALL"', 'Fija', 'eFija')}${tog(E.clase === 'RENTAL', 'data-set="clase" data-v="RENTAL"', 'Alquiler', 'eAlq')}</div>` +
    (E.tipo !== 'INDOOR' ? `<div class="fila ico">${tog(E.sol === 'directo', 'data-set="sol" data-v="directo" title="A pleno sol: solo cabinets de ' + SOL_DIRECTO + ' nits o más"', 'Sol directo', 'eSol')}${tog(E.sol === 'indirecto', 'data-set="sol" data-v="indirecto" title="A la sombra o con sol indirecto: cabinets de ' + SOL_INDIRECTO + ' a ' + SOL_DIRECTO + ' nits"', 'Sol indirecto', 'eNube')}</div>` : '') +
    `<div class="fila ico">${tog(E.gold, 'data-set="gold" data-v="' + (E.gold ? '' : '1') + '" title="Cerca del mar o con mucha humedad: cabinets tropicalizados con contactos de oro"', 'Marino / tropical', 'eMar')}${tog(E.protegido, 'data-set="protegido" data-v="' + (E.protegido ? '' : '1') + '" title="Al alcance del público: LED protegido contra golpes y contacto"', 'Alcance público', 'ePub')}</div>` +
    (R && R.r ? paso(IC.nits + ' Nits mín.', fmt(R.nits), 'data-nits="-1" aria-label="Menos brillo mínimo"', 'data-nits="1" aria-label="Más brillo mínimo"', 'lin') : '') + (R && R.relajado ? `<div class="nota" style="color:var(--ambar)">${R.relajado}</div>` : ''));
  if (!R || R.vacio) {
    const msg = ESTADO === 'cargando' ? 'Cargando el catálogo…' : ESTADO === 'error' ? 'No se ha podido leer el catálogo. Comprueba la conexión y vuelve a cargar.' : 'No hay modelos en el catálogo para este entorno.';
    h += blk('m2a', 'M2A', 'Dimensiones', 'var(--marca)', dimEntra, dimUni) + ['m1b', 'm2b', 's1a', 's1b', 'm3a', 'm3b', 'm3c', 'm3d', 'm3e', 'm3f'].map((a) => blk(a, a.toUpperCase(), '&nbsp;', 'var(--linea)', a === 's1a' ? `<div class="nota" style="margin:auto;font-size:calc(var(--u)*20)">${msg}</div>` : '', '', a[0] === 's' ? 'pant' : '', '')).join('');
    el.innerHTML = h; return;
  }
  const { m, r } = R, ip = R.pitches.indexOf(R.pitch), ORIG = { pedido: ['ok', 'Pitch pedido por ti', 'Pedido'], cercano: ['av', 'El más cercano al ' + E.pitch + ' que pediste', 'Cercano a ' + E.pitch], distancia: ['ok', 'Elegido por la distancia del público: ' + fmt(E.dist, 1) + ' m', 'Por distancia'], auto: ['av', 'Automático: el más fino', 'Automático'], resolucion: ['ok', 'Elegido para llegar a ' + E.resMin, 'Por ' + E.resMin], sinres: ['av', 'Ningún pitch llega a ' + E.resMin + ' con esta medida: el más fino', 'No llega a ' + E.resMin], elegido: ['ok', 'Elegido a mano', 'A mano'] }[R.origen];

  const foto = m.urlFoto ? `<img src="${esc(m.urlFoto)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<div class="sinfoto">sin foto</div>';
  h += blk('m1b', 'M1B', 'Cabinet', 'var(--violeta)', `<select class="sel" data-crm aria-label="Modelo de cabinet" title="Elegir el cabinet a mano: todos los modelos de este entorno, agrupados por pitch">${R.pitches.map((pt) => `<optgroup label="P${String(pt).replace('.', ',')}">${R.lista.filter((x) => x.pitch === pt).map((x) => `<option value="${esc(x.crm)}"${x.crm === m.crm ? ' selected' : ''}>${esc(x.crm)}${enStock(x) ? ' · stock' : ''}</option>`).join('')}</optgroup>`).join('')}</select><div class="cabmini">${foto}<div style="min-width:0;flex:1">${dato('Cabinet', `${m.cabAncho}×${m.cabAlto} mm${m.girado ? ' ⟳' : ''}`)}${dato('Píxeles', `${m.cabPixAncho}×${m.cabPixAlto}`)}${dato('Brillo', m.nits ? fmt(m.nits) + ' nits' : '—')}${dato('Refresco', m.hz ? fmt(m.hz) + ' Hz' : '—')}</div></div><div class="fila envuelve"><span class="chip ${enStock(m) ? 'ok' : 'no'}">${enStock(m) ? 'En stock' : 'Bajo pedido'}</span><span class="chip">${esc(m.family || '')}</span></div>` + (R.holo ? `<div class="nota">HOLO · ${R.holo.bot ? 'dos filas contrapuestas de ' + R.holo.top + ' + ' + R.holo.bot + ' mm' : 'una fila de ' + R.holo.top + ' mm'} · caja de drivers de ${HOLO_DRIVER} mm${R.holo.comb ? ' · ' + R.holo.comb.cA * r.rows + ' × ' + esc(R.holo.comb.mA.crm) + ' + ' + R.holo.comb.cE * r.rows + ' × ' + esc(R.holo.comb.mE.crm) : ''}</div>` : ''), `<button type="button" class="tog mini" data-set="giro" data-v="${E.giro ? '' : '1'}" aria-pressed="${!!(E.giro && R.giraPosible)}"${R.giraPosible ? '' : ' disabled'} title="${R.giraPosible ? 'Girar el cabinet 90°: se monta tumbado o de pie' : 'Este cabinet es cuadrado: girarlo no cambia nada'}">${IC.gira}90°</button>` + bt('ojo', 'Ver la ficha completa del cabinet', 'data-ver="equipo"'));
  h += blk('s1a', 'S1A', 'Simulación a escala', 'var(--marca)', `<div class="lienzo">${svgSim()}<div class="fondos" role="group" aria-label="Fondo de la pared">${FONDOS.map((f) => f === 'ninguno' ? `<button type="button" class="fo-ico" data-fondo="ninguno" aria-pressed="${E.fondo === f}" aria-label="Sin fondo" title="Sin fondo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M6.3 17.7 17.7 6.3"/></svg></button>` : f === 'propio' ? `<button type="button" class="fo-ico" data-fondo="propio" aria-pressed="${E.fondo === f}" aria-label="Fondo propio: sube una imagen o pega un enlace" title="Fondo propio: sube una imagen o pega un enlace"${FPROP ? ` style="background-image:url(&quot;${esc(FPROP)}&quot;)"` : ''}>${FPROP ? '' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V5"/><path d="m7 10 5-5 5 5"/><path d="M5 19h14"/></svg>'}</button>` : `<button type="button" data-fondo="${f}" aria-pressed="${E.fondo === f}" aria-label="Fondo ${f.replace(/-/g, ' ')}" title="${f.replace(/-/g, ' ')}" style="background-image:url(../assets/sim/${f}-mini.jpg${TEXV})"></button>`).join('')}</div><div class="elev" role="group" aria-label="Altura del borde inferior de la pantalla sobre el suelo"><span>Elevación desde el suelo</span><button type="button" data-pm="elev" data-d="-1" aria-label="Bajar la pantalla 10 cm">−</button><b>${fmt(E.elev)} cm</b><button type="button" data-pm="elev" data-d="1" aria-label="Subir la pantalla 10 cm">+</button></div></div>`, bt('contenido', 'Simular contenido: fuentes de prueba, un enlace o un archivo tuyo', 'data-ver="contenido"') + (CONT ? bt('carta', 'Volver a la carta de ajuste', 'data-carta') : '') + bt('copia', 'Copiar una captura de esta pantalla', 'data-copia="S1A"') + bt('ojo', 'Ver en grande', 'data-ver="sim"'), 'pant');
  const V = VISTAS[E.vista] || VISTAS[0];
  h += blk('s1b', 'S1B', ['Cableado', 'Cableado', 'Visionado', 'Conexión'][VISTAS.indexOf(V)] || V[3](), 'var(--azul)', `<div class="lienzo papel">${V[2]()}${V[0] === 'senal' || V[0] === 'elec' ? cosidoCtl(V[0]) : ''}</div>`, `<div class="pestanas" role="group" aria-label="Qué se ve en esta pantalla">${VISTAS.map((v, i) => `<button type="button" data-vista="${i}" aria-pressed="${i === E.vista}">${v[1]}</button>`).join('')}</div>` + bt('copia', 'Copiar una captura de esta pantalla', 'data-copia="S1B"') + bt('ojo', 'Ver en grande', 'data-ver="vista"'), 'pant');
  const mcd = (a, b) => (b ? mcd(b, a % b) : a), q = mcd(Math.round(r.ancho * 1000), Math.round(r.alto * 1000)), fa = Math.round(r.ancho * 1000) / q, fb = Math.round(r.alto * 1000) / q, formato = fa <= 32 && fb <= 32 ? fa + ':' + fb : fmt(r.ancho / r.alto, 2) + ':1';
  const sob = Math.abs(r.sobra.w) > .01 || Math.abs(r.sobra.h) > .01 ? (r.sobra.w >= 0 ? 'sobran ' : 'faltan ') + fmt(Math.abs(r.sobra.w) * 100) + ' × ' + fmt(Math.abs(r.sobra.h) * 100) + ' cm' : 'medida exacta';
  h += blk('m2a', 'M2A', 'Dimensiones', 'var(--marca)', dimEntra + `<div class="gran med" title="Medida real con cabinets enteros">${fmt(r.ancho * 100)}<small>×</small> ${fmt(r.alto * 100)}<small>cm · ${sob}</small></div><div class="celdas">${cel('Diagonal', fmt(R.diag * 100) + ' cm·' + fmt(R.diag / .0254) + '″')}${cel('Formato', formato)}${cel('Superficie', fmt(r.ancho * r.alto, 2) + ' m²')}${cel('Fondo', m.thick ? fmt(m.thick) + ' mm' : '—')}</div>`, dimUni);

  /* RESOLUCIÓN (M3A): el pitch (con el origen de la elección), la distancia del público, la resolución que sale y la mínima que se pide */
  h += blk('m3a', 'M3A', 'Resolución', 'var(--azul)', `${paso(`Pitch (mm)<span class="chip ${ORIG[0]}" title="${esc(ORIG[1])}">${ORIG[2]}</span>`, String(R.pitch).replace('.', ','), 'data-pitch="-1" aria-label="Pitch más fino" title="Pitch más fino"' + (ip <= 0 ? ' disabled' : ''), 'data-pitch="1" aria-label="Pitch más grueso" title="Pitch más grueso"' + (ip >= R.pitches.length - 1 ? ' disabled' : ''), 'eti')}${num('dist', 'Distancia de visionado', E.dist || '', 'm', .5)}<div class="res-man" title="Escribe la resolución que necesitas: se ajustan las columnas y las filas"><input type="number" inputmode="numeric" data-res="w" value="${r.resW}" min="1" aria-label="Resolución horizontal en píxeles"><span>×</span><input type="number" inputmode="numeric" data-res="h" value="${r.resH}" min="1" aria-label="Resolución vertical en píxeles"><span>px</span><small>${fmt(r.pix / 1e6, 2)} Mpx${R.nivel[0] ? ' · ' + R.nivel[0] : ''}</small></div><div class="fila tres op"><span>Mínima</span>${[['', 'Auto', 0, 0], ['HD', 'HD', 1280, 720], ['FHD', 'FHD', 1920, 1080], ['4K', '4K', 3840, 2160]].map((x) => tog(E.resMin === x[0], `data-set="resMin" data-v="${x[0]}" title="${x[0] ? (r.resW >= x[2] && r.resH >= x[3] ? 'Esta pantalla llega a ' + x[1] + '. ' : 'Esta pantalla no llega a ' + x[1] + '. ') + 'Pulsa para elegir el pitch que llegue al menos a ' + x[1] : 'Sin resolución mínima'}"`, (x[0] && r.resW >= x[2] && r.resH >= x[3] ? '✓' : '') + x[1])).join('')}</div>`);
  const cs = Math.min(84 / r.cols, 84 / r.rows);
  h += blk('m2b', 'M2B', 'Cabinets', 'var(--violeta)', `<div class="fila"><div class="rej-cab" style="grid-template-columns:repeat(${r.cols},calc(var(--u) * ${cs.toFixed(2)}));grid-auto-rows:calc(var(--u) * ${(cs * Math.min(1.6, m.cabAlto / m.cabAncho)).toFixed(2)})">${'<i></i>'.repeat(Math.min(r.cab, 400))}</div><div class="gran" style="flex:1;text-align:right">${fmt(r.cab)}<small>ud</small></div></div><div class="fila dos">${paso('Columnas', r.cols, 'data-cf="c" data-d="-1" aria-label="Una columna menos"', 'data-cf="c" data-d="1" aria-label="Una columna más"')}${paso('Filas', r.rows, 'data-cf="f" data-d="-1" aria-label="Una fila menos"', 'data-cf="f" data-d="1" aria-label="Una fila más"')}</div>`);
  /* INSTALACIÓN (M3D): peso, mantenimiento, receiving card y grosor, como la tarjeta de la clásica */
  h += blk('m3d', 'M3D', 'Instalación', 'var(--magenta)', `<div class="gran">${fmt(r.peso, 1)}<small>kg</small></div><div class="nota">peso total de la pantalla</div>${dato('Por cabinet', m.cabKg ? fmt(m.cabKg, 1) + ' kg' : '—')}${dato('Mantenimiento', esc(m.mant || m.mantenimiento || '—'))}${dato('Receiving card', esc(m.card || '—'))}${dato('Grosor', m.thick ? fmt(m.thick) + ' mm' : '—')}`);
  h += blk('m3f', 'M3F', 'Alimentación', 'var(--rojo)', `<div class="gran">${fmt(r.kw, 2)}<small>kW máx.</small></div>${dato('Corriente', fmt(r.cab * R.ampCab, 1) + ' A · 230 V')}${dato('Líneas de 16 A', R.nLin)}${dato('Por cabinet', (m.wMax ? fmt(m.wMax) + ' W' : '—') + (R.ampCab ? ' · ' + fmt(R.ampCab, 2) + ' A' : ''))}`, bt('ojo', 'Ver el reparto eléctrico', 'data-ver="elec"'));
  h += blk('m3e', 'M3E', 'Señal', 'var(--ambar)', `<div class="gran">${r.lineas}<small>línea${r.lineas > 1 ? 's' : ''} Ethernet</small></div><div class="fila dos bkp">${tog(E.backup, 'data-set="backup" data-v="1" title="Un segundo cable por puerto, que entra por el último cabinet de cada cadena: + ' + r.lineas + ' cables Cat6"', 'Con backup')}${tog(!E.backup, 'data-set="backup" data-v=""', 'Sin backup')}</div><div class="fila tres op"><span>Conexión</span>${tog(E.conexion === 'directo', 'data-set="conexion" data-v="directo" title="Del procesador a los cabinets por cable de red"', 'RJ45')}${tog(E.conexion === 'fibra', 'data-set="conexion" data-v="fibra" title="Del procesador a los cabinets por fibra óptica"', 'Fibra')}</div>${dato('Cosido', R.cosido + (E.cosido === 'auto' ? ' (auto)' : ''))}${dato('Salidas 4K', r.salidas4k)}`, bt('ojo', 'Ver el cableado de señal', 'data-ver="senal"'));
  const p = R.proc, me = R.media;
  h += blk('m3b', 'M3B', 'Electrónica', 'var(--marca)', (p ? `<div style="font-weight:800;font-size:calc(var(--u)*19);line-height:1.15">${R.procs.length > 1 ? `<select class="sel" data-proc aria-label="Procesador" title="Elegir otro procesador de los que valen para este proyecto">${R.procs.map((x, i) => `<option value="${esc(x.modelo)}"${x === p ? ' selected' : ''}>${esc(x.modelo)}${i ? '' : ' · recomendado'}</option>`).join('')}</select>` : esc(p.modelo)}<div class="nota">${esc(p.marca)} · ${p.escalador ? 'con escalador' : 'sin escalador'}</div></div>${dato('Puertos', esc(p.puertos))}` : '<div class="nota">Sin procesador que cubra este proyecto con estas opciones: cambia el backup, la conexión o el escalador.</div>') + `<div class="fila tres op"><span>Escalador</span>${tog(E.escalador === 'con', 'data-set="escalador" data-v="con"', 'Con')}${tog(E.escalador === 'sin', 'data-set="escalador" data-v="sin"', 'Sin')}${tog(E.escalador === 'indiferente', 'data-set="escalador" data-v="indiferente" title="Da igual que el procesador lleve escalador o no"', 'Igual')}</div>`, bt('ojo', 'Ver la electrónica completa', 'data-ver="equipo"'));
  /* MEDIASERVER (M3C): bloque propio, con marca, Dante y elección del modelo, como en la clásica */
  const conMs = E.marca !== 'ninguno';
  h += blk('m3c', 'M3C', 'Mediaserver', 'var(--azul)', `<div class="fila tres op"><span>Añadir</span>${tog(conMs, 'data-set="marca" data-v="todos" title="Añadir un servidor de contenidos"', 'Sí')}${tog(!conMs, 'data-set="marca" data-v="ninguno"', 'No')}</div>` + (conMs ? `<div class="fila tres op"><span>Marca</span>${tog(E.marca === 'todos', 'data-set="marca" data-v="todos"', 'Todas')}${tog(E.marca === 'novastar', 'data-set="marca" data-v="novastar"', 'Nova')}${tog(E.marca === 'pixelhue', 'data-set="marca" data-v="pixelhue"', 'Pixel')}</div><div class="fila tres op"><span>Audio Dante</span>${tog(E.dante, 'data-set="dante" data-v="1" title="Solo servidores con audio por red Dante"', 'Sí')}${tog(!E.dante, 'data-set="dante" data-v=""', 'No')}</div>` + (me ? `<select class="sel" data-media aria-label="Mediaserver" title="Elegir otro mediaserver de los que valen para este proyecto">${R.medias.map((x, i) => `<option value="${esc(x.modelo)}"${x === me ? ' selected' : ''}>${esc(x.modelo)}${i ? '' : ' · recomendado'}</option>`).join('')}</select><div class="nota">${esc(me.marca)} · ${me.out4k} salida${me.out4k > 1 ? 's' : ''} 4K (hacen falta ${me.need})</div>` : '<div class="nota" style="color:var(--ambar)">Ningún mediaserver cubre este proyecto con esta marca y estas opciones.</div>') : '<div class="nota">Servidor de contenidos para la pantalla. Actívalo si el proyecto lo lleva.</div>'), conMs && me ? bt('ojo', 'Ver la ficha del mediaserver', 'data-ver="equipo"') : '');
  el.innerHTML = h;
}
function pintaPie() {
  /* el resultado aparece en la propia casilla de la petición, destacado; al tocarlo vuelve a ser casilla de escribir */
  const res = $('#pide-res'), inp = $('#pide'); if (!res) return;
  const ver = !!(R && R.r) && !EDITA && USADO;
  res.hidden = !ver; inp.style.visibility = ver ? 'hidden' : '';
  if (ver) res.innerHTML = `<span>PANTALLA LED ${esc(R.m.crm)} · ${fmt(R.r.ancho * 100)} × ${fmt(R.r.alto * 100)} cm · ${fmt(R.diag / .0254)}″ · ${R.r.cols}×${R.r.rows} = ${R.r.cab} cabinets</span><span> · ${R.r.resW}×${R.r.resH} px · ${fmt(R.r.peso)} kg · ${fmt(R.r.kw, 2)} kW · ${R.r.lineas} línea${R.r.lineas > 1 ? 's' : ''}</span>`;
  $('#pie-l').innerHTML = '<span class="nota"><svg class="av-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.6 2.4 20.2h19.2z"/><path d="M12 9.6v5"/><path d="M12 17.6h.01"/></svg><span>Cálculo automático que puede contener errores: revísalo antes de presupuestar o instalar.</span></span>';
}
/* ningún texto de una línea se parte ni se corta: si no cabe, se le va bajando la letra hasta que quepa */
function encoge(el, min = 7) { if (!el || !el.clientWidth) return; el.style.fontSize = ''; let f = parseFloat(getComputedStyle(el).fontSize); for (let i = 0; i < 40 && el.scrollWidth > el.clientWidth + 1 && f > min; i++) { f *= .96; el.style.fontSize = f + 'px'; } }
function ajustaTextos() { const r = $('#pide-res'); if (r && !r.hidden) { const tr = [...r.querySelectorAll('span')]; if (tr.length && getComputedStyle(tr[0]).display === 'block') tr.forEach((x) => encoge(x)); else encoge(r); } document.querySelectorAll('#pie-l .nota, #pie-c, .elev > span').forEach((e) => encoge(e, 6)); }
function todo() { if (document.activeElement !== $('#pide')) EDITA = false; calcula(); pintaRejilla(); pintaPie(); guarda(); ajustaTextos(); }

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
      <div class="nota">Las fuentes 2 a 6 se pueden editar; la primera es fija. Se guardan en este navegador.</div>
      <div class="rot">O usa tu propio contenido</div>
      <div class="fila"><input type="url" class="pide" id="url-propia" value="${esc(URLP)}" placeholder="Pega un enlace de YouTube, Vimeo, imagen o vídeo" aria-label="Enlace de tu contenido"><button type="button" class="tog" data-sube style="flex:none">${IC.contenido}Subir imagen / vídeo</button></div>
      <div class="fila"><button type="button" class="calcular" data-cont-aplica style="font-size:calc(var(--u)*15)">APLICAR</button>${tog(false, 'data-cont-reinicia title="Volver a la carta de ajuste inicial"', 'Reiniciar')}${tog(false, 'data-cierra', 'Cerrar')}</div></div></div>`;
    VENT = { que };
  } else if (que === 'fondo') {
    v.innerHTML = `<div class="vent ajustes" role="dialog" aria-modal="true" aria-label="Fondo propio de la pared"><div class="vent-cab">${IC.contenido.replace('<svg', '<svg style="width:1.2em;height:1.2em"')} Fondo propio de la pared<span class="sep"></span>${bt('x', 'Cerrar', 'data-cierra')}</div><div class="vent-cu">
      <div class="rot">Sube una foto de la pared o pega su enlace</div>
      <div class="fila"><input type="url" class="pide" id="url-fondo" value="${FPROP && !/^data:/.test(FPROP) ? esc(FPROP) : ''}" placeholder="Pega el enlace de una imagen" aria-label="Enlace de la imagen de fondo"><button type="button" class="tog" data-fondo-sube style="flex:none">${IC.contenido}Subir imagen</button></div>
      <div class="nota">La imagen cubre toda la pared detrás de la pantalla: mejor una foto frontal. Se guarda en este navegador.</div>
      <div class="fila"><button type="button" class="calcular" data-fondo-aplica style="font-size:calc(var(--u)*15)">APLICAR</button>${FPROP ? tog(false, 'data-fondo-quita', 'Quitar') : ''}${tog(false, 'data-cierra', 'Cerrar')}</div></div></div>`;
    VENT = { que };
  } else if (que === 'info') {
    v.innerHTML = `<div class="vent ajustes" role="dialog" aria-modal="true" aria-label="Información"><div class="vent-cab">${IC.info.replace('<svg', '<svg style="width:1.2em;height:1.2em"')} SCREENS · una pantalla LED<span class="sep"></span>${bt('x', 'Cerrar', 'data-cierra')}</div><div class="vent-cu" style="font-size:calc(var(--u)*16);line-height:1.5">
      <div class="fila"><button type="button" class="tog" data-guia style="flex:none">Ver la guía rápida</button><a class="tog" style="flex:none;text-decoration:none" href="https://github.com/mediaservi/SCREENS#readme" target="_blank" rel="noopener">Manual completo</a></div>
      <p style="margin:0"><b>Cómo se usa.</b> Escribe o dicta arriba la pantalla que necesitas («3 x 4 para exterior 3.9p a 8 m») y pulsa CALCULAR, o rellena los bloques de la izquierda: entorno y uso, dimensiones, cabinet y resolución. Todo se recalcula al momento.</p>
      <p style="margin:0"><b>Las dos pantallas.</b> A la izquierda, la simulación a escala: puedes cambiar la pared, simular contenido (fuentes de prueba, un enlace de YouTube o Vimeo, o una imagen o vídeo tuyos), copiar una captura y abrirla en grande con el ojo. A la derecha, el cableado de señal, el eléctrico, la distancia de visionado y el esquema de conexión.</p>
      <p style="margin:0"><b>Cada opción en su bloque.</b> Las unidades, los formatos y el ajuste a la medida están en Dimensiones; marino, alcance del público y nits mínimos en Entorno; el pitch, la distancia del público y la resolución mínima en Resolución; columnas y filas en Cabinets; el giro de 90° en Cabinet; la altura sobre el suelo en la simulación; el cosido en el cableado; backup y conexión en Señal; el escalador y el procesador en Electrónica; marca, Dante y modelo en Mediaserver. El icono de reinicio de arriba, o un toque en el logo de SCREENS, empieza un cálculo nuevo.</p>
      <p style="margin:0"><b>Proyecto y PDF.</b> En «Datos del proyecto» se ponen el nombre, el cliente, las fuentes de vídeo y las observaciones. El botón PDF enseña antes una vista previa de las dos hojas (la pantalla con sus datos y, detrás, el esquema de conexión, el cableado y la lista de material), desde la que se puede ver a pantalla completa, imprimir o guardar. El ojo de cualquier bloque abre también la lista de material y los equipos.</p>
      <p style="margin:0"><b>Sin conexión.</b> El botón de descarga del pie instala SCREENS en el aparato y guarda una copia para usarlo sin red.</p>
      <p style="margin:0" class="nota">Cálculo automático que puede contener errores: revísalo antes de presupuestar o instalar.</p></div></div>`;
    VENT = { que };
  } else if (que === 'proyecto') {
    v.innerHTML = `<div class="vent ajustes" role="dialog" aria-modal="true" aria-label="Datos del proyecto"><div class="vent-cab">${IC.proyecto.replace('<svg', '<svg style="width:1.2em;height:1.2em"')} Datos del proyecto<span class="sep"></span>${bt('x', 'Cerrar', 'data-cierra')}</div><div class="vent-cu">
      <div class="rot">Proyecto y cliente</div>
      <div class="fila"><input type="text" class="pide" data-pr="proy" maxlength="80" value="${esc(E.proy || '')}" placeholder="Nombre del proyecto" aria-label="Nombre del proyecto"><input type="text" class="pide" data-pr="cliente" maxlength="80" value="${esc(E.cliente || '')}" placeholder="Cliente" aria-label="Cliente"></div>
      <div class="rot">Fuentes de vídeo</div>
      <div class="fila">${paso('Entradas', Math.max(1, +E.entradas || 1), 'data-pm="entradas" data-d="-1" aria-label="Una fuente menos"', 'data-pm="entradas" data-d="1" aria-label="Una fuente más"')}<div class="nota" style="flex:2">Ordenadores, cámaras o reproductores que entran al sistema. Salen en el esquema de conexión y en la lista de material.</div></div>
      <div class="fila op pr-op"><span>Señal de entrada</span>${[['HDMI', 'HDMI'], ['DP', 'DisplayPort'], ['SDI', 'SDI'], ['MIXTO', 'Varias'], ['', 'No lo sé']].map((o) => tog((E.tipoEntrada || '') === o[0], `data-set="tipoEntrada" data-v="${o[0]}"`, o[1])).join('')}</div>
      <div class="fila op pr-op"><span>Resolución de entrada</span>${[['HD', 'HD 720p'], ['FHD', 'Full HD 1080p'], ['4K', '4K / UHD'], ['', 'No lo sé']].map((o) => tog((E.resEntrada || '') === o[0], `data-set="resEntrada" data-v="${o[0]}"`, o[1])).join('')}</div>
      <div class="fila op pr-op"><span>Distancia de las fuentes</span>${[['3', 'Hasta 3 m'], ['5', '3–5 m'], ['10', '5–10 m'], ['15', '10–15 m'], ['20', '15–20 m'], ['0', 'No lo sé']].map((o) => tog(String(E.cableM || '0') === o[0], `data-set="cableM" data-v="${o[0]}"`, o[1])).join('')}</div>
      <div class="rot">Observaciones</div>
      <textarea class="pide obs" data-pr="obs" maxlength="900" rows="4" placeholder="Notas que saldrán en el PDF: accesos, estructura, plazos…" aria-label="Observaciones">${esc(E.obs || '')}</textarea>
      <div class="fila"><button type="button" class="calcular" data-pdf style="font-size:calc(var(--u)*15)">VER EL PDF</button>${tog(false, 'data-ver="mat"', 'Lista de material')}${tog(false, 'data-cierra', 'Cerrar')}</div></div></div>`;
    VENT = { que };
  } else {
    const LISTA = R && R.r ? [['sim', 'Simulación a escala', () => `<div class="lienzo">${svgSim((innerWidth * .88 - 30) / Math.max(200, innerHeight * .86 - 96), 0)}</div>`], ['senal', VISTAS[0][3](), () => `<div class="lienzo papel">${VISTAS[0][2]()}${cosidoCtl()}</div>`], ['elec', VISTAS[1][3](), () => `<div class="lienzo papel">${VISTAS[1][2]()}${cosidoCtl('elec')}</div>`], ['dist', VISTAS[2][3](), () => `<div class="lienzo papel">${VISTAS[2][2]()}</div>`], ['esq', VISTAS[3][3](), () => `<div class="lienzo papel">${VISTAS[3][2]()}</div>`], ['mat', 'Lista de material', () => `<div class="lienzo papel mat-caja">${tablaMaterial()}</div>`], ['equipo', 'Equipos del proyecto', fichas]] : [];
    if (!LISTA.length) return; if (que === 'vista') que = VISTAS[E.vista][0];
    let i = Math.max(0, LISTA.findIndex((x) => x[0] === que)); VENT = { que: 'visor', LISTA, i };
    const pinta = () => { const x = VENT.LISTA[VENT.i]; v.innerHTML = `<div class="vent" role="dialog" aria-modal="true" aria-label="${esc(x[1])}"><div class="vent-cab">${esc(x[1])}<span class="sep"></span><span class="nota">${VENT.i + 1} / ${VENT.LISTA.length}</span>${bt('ant', 'Anterior', 'data-paso="-1"')}${bt('sig', 'Siguiente', 'data-paso="1"')}${bt('x', 'Cerrar', 'data-cierra')}</div><div class="vent-cu">${x[2]()}</div></div>`; };
    VENT.pinta = pinta; pinta();
  }
  v.classList.add('on'); v.querySelectorAll('.pr-op .tog, .pr-op > span').forEach((b) => encoge(b, 7)); const c = v.querySelector('[data-cierra]'); if (c) c.focus();
}
function cierra() { if (VENT && VENT.que === 'pdf') { sueltaPv(); if (enCompleta()) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} } } $('#velo').classList.remove('on'); $('#velo').innerHTML = ''; VENT = null; }
function fichas() {
  const { m } = R, f = [];
  f.push(FICHA.fichaHTML({ cat: 'Cabinet LED', icono: 'led', marca: m.family || '', modelo: m.crm, foto: m.urlFoto, fotoTrasera: m.urlFotoTrasera || m.urlTrasera || m.urlFoto2, vistas: m.fotos, acento: '#b566ff', stock: enStock(m),
    specs: [['Pitch', m.pitch + ' mm'], ['Cabinet', `${m.cabAncho}×${m.cabAlto}${m.thick ? '×' + m.thick : ''} mm`], ['Píxeles', `${m.cabPixAncho}×${m.cabPixAlto}`], ['Brillo', m.nits ? m.nits + ' nits' : ''], ['Refresco', m.hz ? m.hz + ' Hz' : ''], ['Peso', m.cabKg ? fmt(m.cabKg, 1) + ' kg' : ''], ['Consumo máx.', m.wMax ? fmt(m.wMax) + ' W' : ''], ['Tarjeta', m.card || ''], ['Tecnología', m.tech || '']],
    enlace: m.crm ? 'https://traulux.net/buscar/?q=' + encodeURIComponent(m.crm) : '', enlaceTxt: 'Ficha del fabricante' }));
  R.procs.slice(0, 4).forEach((x, i) => f.push(FICHA.fichaHTML({ cat: i ? 'Procesador alternativo' : 'Procesador recomendado', icono: 'elec', marca: x.marca, modelo: x.modelo, foto: x.front, fotoTrasera: x.back, acento: '#d4ff00', stock: x.enStock ? true : null, sel: !i,
    specs: [['Puertos', x.puertos], ['Capacidad', x.capacidad], ['Escalador', x.escalador ? 'Sí' : 'No']], piezas: (x.equipos || []).map((q) => ({ cant: q.cant, ref: q.ref, desc: q.desc })), enlace: x.url, enlaceTxt: 'Ficha del fabricante' })));
  if (R.media) f.push(FICHA.fichaHTML({ cat: R.media.tipo === 'switcher' ? 'Switcher de presentación' : 'Mediaserver', icono: 'media', marca: R.media.marca, modelo: R.media.modelo, foto: R.media.front, fotoTrasera: R.media.back, acento: '#ffb000', enlaces: [[R.media.pdf, 'Ficha técnica (PDF)'], R.media.urlFab && R.media.url ? [R.media.url, 'Charmex'] : null].filter((x) => x && x[0]), specs: [['Salidas 4K', R.media.out4k], ['Necesarias', R.r.salidas4k]], notas: [R.media.resumen], enlace: R.media.urlFab || R.media.url, enlaceTxt: 'Ficha del fabricante' }));
  return `<div class="fichas-v">${f.join('')}</div>`;
}

/* ---------- plantilla fija y eventos ---------- */
function monta() {
  document.documentElement.dataset.tema = E.tema;
  $('#app').innerHTML = `<div class="blocks">
    <header class="franja f-h1"><div data-blk="H1L"><button type="button" data-nuevo title="Nuevo cálculo: lo deja todo como al empezar" aria-label="SCREENS · nuevo cálculo" style="display:flex;border:0;background:none;padding:0"><img class="logo t-osc" src="../assets/screens-logo.svg" alt="SCREENS"><img class="logo t-cla" src="../assets/screens-logo-claro.svg" alt="SCREENS"></button></div>
      <nav data-blk="H1C" class="fam" aria-label="Familia AVHUB"><a href="https://systems.mediaservi.com/"><img class="t-osc" src="../assets/fam/systems-logo.svg" alt="SYSTEMS"><img class="t-cla" src="../assets/fam/systems-logo-claro.svg" alt="SYSTEMS"></a><a href="https://adposter.mediaservi.com/"><img class="t-osc" src="../assets/fam/adposter-logo.svg" alt="ADPOSTER"><img class="t-cla" src="../assets/fam/adposter-logo-claro.svg" alt="ADPOSTER"></a><a class="av" href="https://avhub.mediaservi.com/"><img class="t-osc" src="../assets/avhub-logo.svg" alt="AVHUB"><img class="t-cla" src="../assets/avhub-logo-claro.svg" alt="AVHUB"></a><a href="https://vjshow.mediaservi.com/"><img class="t-osc" src="../assets/fam/vjshow-logo.svg" alt="VJSHOW"><img class="t-cla" src="../assets/fam/vjshow-logo-claro.svg" alt="VJSHOW"></a><a href="https://msgame.mediaservi.com/"><img src="../assets/fam/msgame-logo.svg" alt="MSGAME"></a></nav>
      <div data-blk="H1R" class="h1r">${bt('info', 'Qué es esto y cómo se usa', 'data-ver="info"', 'g')}${bt('pdf', 'Ver el PDF del proyecto', 'data-pdf', 'g')}${bt('nuevo', 'Nuevo cálculo: lo deja todo como al empezar', 'data-nuevo', 'g')}<button type="button" class="ic-bt g" data-idioma data-crudo title="${NOMBRE[idioma()]} → ${NOMBRE[IDIOMAS[(IDIOMAS.indexOf(idioma()) + 1) % 3]]}" aria-label="${NOMBRE[idioma()]} → ${NOMBRE[IDIOMAS[(IDIOMAS.indexOf(idioma()) + 1) % 3]]}" style="position:relative">${'<span class="ic ic-lang"></span>'}<small class="cod">${idioma().toUpperCase()}</small></button>${bt('tema', 'Cambiar entre gris oscuro y gris claro', 'data-cambiatema', 'g')}</div></header>
    <div class="franja f-hm"><div data-blk="HM1"><div class="fila grupo" style="flex:1">${tog(true, 'data-nada', 'Una', 'una')}<a class="tog" href="consola.html?modo=varias-led" style="text-decoration:none" title="Varias pantallas y sala inmersiva">${IC.varias}Varias</a></div><div class="fila grupo" style="flex:1.25">${tog(true, 'data-nada', 'LED', 'led')}<a class="tog" href="consola.html?modo=una-proy" style="text-decoration:none" title="Proyección">${IC.proy}Proyección</a></div></div>
      <div data-blk="HM2">${bt('proyecto', 'Datos del proyecto: nombre, cliente, fuentes de vídeo y observaciones', 'data-ver="proyecto"', 'g')}${bt('pega', 'Pegar una petición copiada', 'data-pega', 'g')}<div class="pide-caja"><input class="pide" id="pide" type="text" autocomplete="off" spellcheck="false" placeholder="Escríbela: «pantalla de 3 x 4 para exterior 3.9p a 8 m»" aria-label="Describe la pantalla" value="${esc(E.texto)}"><button type="button" class="pide-res" id="pide-res" hidden title="Resultado del cálculo. Toca para escribir otra petición"></button></div>${bt('copia', 'Copiar el texto de la casilla (la petición o el resultado)', 'data-copiatxt', 'g')}${bt('mic', 'Dictar la petición con el micrófono', 'data-mic', 'g')}${bt('audio', 'Pasar a texto una nota de voz (archivo de audio)', 'data-audio', 'g')}<input type="file" id="f-audio" accept="audio/*,.opus,.ogg,.m4a,.mp3,.wav,.webm" hidden><input type="file" id="f-cont" accept="image/*,video/*" hidden><input type="file" id="f-fondo" accept="image/*" hidden></div>
      <div data-blk="HM3"><button type="button" class="calcular" id="calcular">CALCULAR →</button></div></div>
    <main class="rejilla" id="rejilla"></main>
    <footer class="franja f-f1"><div data-blk="F1L" id="pie-l"></div><div data-blk="F1C" id="pie-c" class="f-cred">SCREENS ${esc(VERSION.split('SCREENS ')[1])} 2026 forma parte del proyecto AVHUB ideado por el fundador de <a href="https://mediaservi.com/" target="_blank" rel="noopener">mediaservi.com</a> · <a href="https://screens.mediaservi.com/#aviso" target="_blank" rel="noopener">Aviso legal</a></div><div data-blk="F1R" class="f1r" id="hueco-comun"></div><a class="admin-esq" href="${ADMIN_URL}" target="_blank" rel="noopener" title="Panel de administración" aria-label="Panel de administración"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></a></footer>
  </div><div class="velo" id="velo"></div><div class="tostada" id="tostada" role="status" aria-live="polite"></div>`;
  /* el pie común de AVHUB (credito.js): mismo texto que el resto de apps, editable desde el panel, y con el aviso legal en su ventana */
  if (window.AVCREDITO) { const pc = $('#pie-c'), pon2 = () => { pc.setAttribute('data-crudo', ''); pc.innerHTML = window.AVCREDITO.html('SCREENS', VERSION.split('SCREENS ')[1], idioma()); }; pon2(); if (window.AVCREDITO.alCambiar) window.AVCREDITO.alCambiar(() => { pon2(); ajustaTextos(); }); }
  const pide = () => { E.texto = $('#pide').value; const v = interpreta(E.texto); EDITA = false; USADO = true; todo(); if (E.texto.trim() && !v.length) tostada('No he entendido la petición: prueba con «3 x 2 interior» o usa los botones.', 5000); };
  $('#calcular').onclick = pide; $('#pide').addEventListener('keydown', (e) => { if (e.key === 'Enter') pide(); });
  const pon = (k, v) => { if (k === 'backup' || k === 'giro' || k === 'gold' || k === 'protegido' || k === 'dante' || k === 'transp') E[k] = !!v; else if (k === 'sol') E.sol = E.sol === v ? '' : v; else E[k] = v; if (k === 'sol') { E.nitsMin = 0; E.crm = ''; } if (k === 'tipo' || k === 'clase' || k === 'gold' || k === 'protegido' || k === 'transp') { E.crm = ''; if (k === 'transp') E.pitch = 0; } if (k === 'tipo') E.nitsMin = 0; if (k === 'resMin') { E.pitch = 0; E.crm = ''; } if (k === 'tema') document.documentElement.dataset.tema = v; todo(); if (VENT && (VENT.que === 'ajustes' || VENT.que === 'proyecto')) abre(VENT.que); else if (VENT && VENT.pinta) VENT.pinta(); };
  document.addEventListener('click', (e) => { const q = (s) => e.target.closest(s); let b; if (q('.rejilla button, .velo [data-set]')) USADO = true;
    if ((b = q('[data-set]'))) pon(b.dataset.set, b.dataset.v);
    else if ((b = q('[data-nits]'))) { const L = [0].concat(R.nitsLista.filter((x) => x > R.nits || x === +E.nitsMin)).sort((a, b) => a - b), i = Math.max(0, L.indexOf(+E.nitsMin || 0)) + +b.dataset.nits; if (L[i] != null) { E.nitsMin = L[i]; E.crm = ''; todo(); } }
    else if ((b = q('[data-cf]'))) { const { m, r } = R, d = +b.dataset.d; if (R.holo) { if (b.dataset.cf === 'c') E.w = Math.max(+m.cabAncho, r.ancho * 1000 + d * m.cabAncho) / 1000; else E.h = (d > 0 ? R.holo.top * 2 : R.holo.top) / 1000; } else if (b.dataset.cf === 'c') E.w = Math.max(1, r.cols + d) * m.cabAncho / 1000 + .0004; else E.h = Math.max(1, r.rows + d) * m.cabAlto / 1000 + .0004; if (E.resMin) { E.pitch = R.pitch; } todo(); }
    else if ((b = q('[data-pitch]'))) { const i = R.pitches.indexOf(R.pitch) + +b.dataset.pitch; if (R.pitches[i] != null) { E.pitch = R.pitches[i]; E.crm = ''; todo(); } }
    else if ((b = q('[data-pm]'))) { const k = b.dataset.pm, paso = k === 'elev' ? 10 : k === 'dist' ? .5 : k === 'entradas' ? 1 : .1; E[k] = Math.max(k === 'w' || k === 'h' ? .1 : 0, +((+E[k] || (k === 'entradas' ? 1 : 0)) + paso * +b.dataset.d).toFixed(2)); if (k === 'entradas') E[k] = Math.max(1, Math.min(16, Math.round(E[k]))); if (k === 'dist') { E.pitch = 0; E.crm = ''; } todo(); if (VENT && (VENT.que === 'ajustes' || VENT.que === 'proyecto')) abre(VENT.que); }
    else if (q('[data-pdf]')) pdf();
    else if ((b = q('[data-pv]'))) accionPv(b.dataset.pv);
    else if ((b = q('[data-formato]'))) { E.h = Math.max(.1, +(E.w * +b.dataset.formato).toFixed(2)); todo(); }
    else if ((b = q('[data-copia]'))) captura(b.dataset.copia);
    else if (q('#pide-res')) { EDITA = true; pintaPie(); ajustaTextos(); const i = $('#pide'); i.focus(); i.select(); }
    else if (q('[data-copiatxt]')) { const r = $('#pide-res'), t = (r && !r.hidden ? r.textContent : $('#pide').value).trim(); if (!t) tostada('La casilla está vacía: no hay nada que copiar.'); else (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => tostada(r && !r.hidden ? 'Resultado copiado: pégalo en WhatsApp o donde quieras.' : 'Petición copiada.'), () => tostada('Este navegador no deja copiar desde aquí.')); }
    else if (q('[data-pega]')) { (navigator.clipboard && navigator.clipboard.readText ? navigator.clipboard.readText() : Promise.reject()).then((t) => { t = String(t || '').replace(/\s+/g, ' ').trim(); if (!t) { tostada('No hay texto copiado que pegar.'); return; } EDITA = true; pintaPie(); const i = $('#pide'); i.value = t.slice(0, 400); i.focus(); tostada('Petición pegada: pulsa CALCULAR.'); }, () => { EDITA = true; pintaPie(); $('#pide').focus(); tostada('Este navegador no deja pegar con el botón: usa Ctrl+V en la casilla.', 5000); }); }
    else if (q('[data-guia]')) { cierra(); guia(0); }
    else if (q('[data-sube]')) $('#f-cont').click();
    else if ((b = q('[data-fu-sel]'))) { FSEL = +b.dataset.fuSel; URLP = ''; abre('contenido'); }
    else if (q('[data-cont-aplica]')) { const i = $('#url-propia'); if (i) URLP = i.value.trim(); const c = deEnlace(URLP || (FSEL === 0 ? FUENTE_FIJA : FU[FSEL - 1])); sueltaCont(); CONT = c; cierra(); todo(); tostada(c ? 'Contenido aplicado a la pantalla.' : 'Esa fuente está vacía: se queda la carta de ajuste.'); }
    else if (q('[data-cont-reinicia]')) { sueltaCont(); CONT = null; FSEL = 0; URLP = ''; cierra(); todo(); tostada('Pantalla reiniciada: vuelve la carta de ajuste.'); }
    else if (q('[data-carta]')) { sueltaCont(); CONT = null; todo(); }
    else if (q('[data-audio]')) $('#f-audio').click();
    else if ((b = q('[data-mic]'))) dicta(b);
    else if (q('[data-idioma]')) { fijaIdioma(IDIOMAS[(IDIOMAS.indexOf(idioma()) + 1) % IDIOMAS.length]); guarda(); location.reload(); }
    else if ((b = q('[data-fondo]'))) { const f = b.dataset.fondo; if (f === 'propio' && (!FPROP || E.fondo === 'propio')) abre('fondo'); else { E.fondo = f; todo(); } }
    else if (q('[data-fondo-sube]')) $('#f-fondo').click();
    else if (q('[data-fondo-aplica]')) { const i = $('#url-fondo'), u = i ? i.value.trim() : ''; if (u && u !== FPROP) fondoUrl(u); else if (FPROP) { E.fondo = 'propio'; cierra(); todo(); } else tostada('Pega un enlace o sube una imagen.'); }
    else if (q('[data-fondo-quita]')) { FPROP = ''; try { localStorage.removeItem(FPROP_K); } catch (er) {} if (E.fondo === 'propio') E.fondo = DEF.fondo; cierra(); todo(); tostada('Fondo propio quitado.'); }
    else if ((b = q('[data-vista]'))) { E.vista = +b.dataset.vista; todo(); }
    else if ((b = q('[data-ver]'))) abre(b.dataset.ver);
    else if ((b = q('[data-cambiatema]'))) pon('tema', E.tema === 'oscuro' ? 'claro' : 'oscuro');
    else if ((b = q('[data-paso]'))) { VENT.i = (VENT.i + +b.dataset.paso + VENT.LISTA.length) % VENT.LISTA.length; VENT.pinta(); }
    else if (q('[data-nuevo]')) { const tema = E.tema; Object.assign(E, DEF, { tema }); sueltaCont(); CONT = null; FSEL = 0; URLP = ''; $('#pide').value = ''; EDITA = false; USADO = false; todo(); tostada('Nuevo cálculo: todo vuelve a como al empezar.'); }
    else if (q('[data-cierra]') || e.target.id === 'velo') cierra(); });
  document.addEventListener('change', (e) => { const t = e.target; if (t.closest('.rejilla')) USADO = true;
    if (t.dataset.num) { const k = t.dataset.num, v = parseFloat(String(t.value).replace(',', '.')); if (k === 'dist') { E.dist = v > 0 ? v : 0; E.pitch = 0; E.crm = ''; } else if (v >= 0) E[k] = k === 'elev' ? v : Math.max(.1, v / UNI[E.uni]); todo(); if (VENT && VENT.que === 'ajustes') abre('ajustes'); }
    else if (t.dataset.res) { const { m } = R, v = Math.max(1, Math.round(parseFloat(t.value) || 0)), ancho = t.dataset.res === 'w'; if (ancho) E.w = Math.ceil(v / m.cabPixAncho) * m.cabAncho / 1000 + .0004; else E.h = Math.ceil(v / m.cabPixAlto) * m.cabAlto / 1000 + .0004; E.pitch = R.pitch; E.crm = m.crm; E.resMin = ''; USADO = true; todo(); if (R && R.r && (ancho ? R.r.resW : R.r.resH) !== v) tostada('Con cabinets enteros queda en ' + R.r.resW + ' × ' + R.r.resH + ' px.', 4500); }
    else if (t.dataset.crm !== undefined) { E.crm = t.value; E.pitch = 0; E.resMin = ''; E.dist = 0; todo(); }
    else if (t.dataset.proc !== undefined) { E.procSel = t.value; todo(); }
    else if (t.dataset.media !== undefined) { E.mediaSel = t.value; todo(); }
    else if (t.dataset.fu !== undefined) { FU[+t.dataset.fu] = t.value.trim(); FSEL = +t.dataset.fu + 1; URLP = ''; try { localStorage.setItem('screens_fuentes_v2', JSON.stringify(FU)); } catch (er) {} abre('contenido'); }
    else if (t.dataset.pr) { E[t.dataset.pr] = String(t.value).slice(0, 900); guarda(); }
    else if (t.id === 'url-propia') URLP = t.value.trim();
    else if (t.id === 'f-fondo' && t.files && t.files[0]) { const f = t.files[0]; t.value = ''; fondoArchivo(f); }
    else if (t.id === 'f-cont' && t.files && t.files[0]) { const f = t.files[0]; sueltaCont(); if (VENT) cierra(); CONT = { url: URL.createObjectURL(f), tipo: /^video\//.test(f.type) ? 'video' : 'img' }; t.value = ''; todo(); tostada('Contenido puesto en la pantalla. La flecha circular vuelve a la carta de ajuste.'); }
    else if (t.id === 'f-audio' && t.files && t.files[0]) { const f = t.files[0]; t.value = ''; tostada('Pasando el audio a texto… la primera vez tarda un poco.', 60000);
      globalThis.SC_VOZ.transcribir(f, idioma(), () => {}).then((txt) => { if (!txt) { tostada('No se ha entendido nada en ese audio.'); return; } EDITA = true; pintaPie(); const i = $('#pide'); i.value = (i.value.trim() ? i.value.trim() + ' ' : '') + txt; tostada('Audio pasado a texto: revísalo y pulsa CALCULAR.'); }).catch(() => tostada('No se ha podido leer ese audio.')); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#guia')) { guia(null); return; } if (!VENT) return; if (e.key === 'Enter' && e.target.id === 'url-fondo') { e.preventDefault(); const bf = document.querySelector('[data-fondo-aplica]'); if (bf) bf.click(); return; } if (e.key === 'Enter' && e.target.id === 'url-propia') { e.preventDefault(); URLP = e.target.value.trim(); const bta = document.querySelector('[data-cont-aplica]'); if (bta) bta.click(); return; } if (e.key === 'Escape') cierra(); else if (VENT.que === 'visor' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { VENT.i = (VENT.i + (e.key === 'ArrowRight' ? 1 : -1) + VENT.LISTA.length) % VENT.LISTA.length; VENT.pinta(); } });
}
/* ---------- avisos, dictado y captura ---------- */
let relojT = 0;
function tostada(txt, ms = 3200) { const t = $('#tostada'); if (!t) return; t.textContent = txt; t.classList.add('on'); clearTimeout(relojT); relojT = setTimeout(() => t.classList.remove('on'), ms); }
let oyendo = null;
function dicta(b) {
  if (oyendo) { try { oyendo.stop(); } catch (e) {} oyendo = null; b.setAttribute('aria-pressed', 'false'); return; }
  EDITA = true; pintaPie(); const i = $('#pide'), base = i.value.trim();
  oyendo = globalThis.SC_VOZ.dictar(idioma(), (txt) => { i.value = (base ? base + ' ' : '') + txt; }, (e) => { if (e === 'sinMic') tostada('Este navegador no tiene dictado por voz.'); else if (e === 'escuchando') tostada('Te escucho: di la pantalla que necesitas y pulsa otra vez el micrófono al acabar.', 6000); else if (e === 'micFin') { oyendo = null; b.setAttribute('aria-pressed', 'false'); if (i.value.trim()) tostada('Dictado listo: pulsa CALCULAR.'); } });
  if (oyendo) b.setAttribute('aria-pressed', 'true');
}
const aDatos = (url) => fetch(url).then((r) => r.blob()).then((bl) => new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(bl); }));
const aImagen = (src) => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
/* fondo propio de la pared: se reduce a 1920 px de lado como mucho y se guarda como JPEG en este navegador (así sale también en capturas y PDF) */
const reduceImg = (src) => aImagen(src).then((im) => { const e = Math.min(1, 1920 / Math.max(im.naturalWidth || 1, im.naturalHeight || 1)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.naturalWidth * e)); c.height = Math.max(1, Math.round(im.naturalHeight * e)); const x = c.getContext('2d'); x.fillStyle = '#808080'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .84); });
function ponFondo(src, aviso) {
  FPROP = src; let ok = true; try { localStorage.setItem(FPROP_K, src); } catch (e) { ok = false; }
  E.fondo = 'propio'; if (VENT) cierra(); todo(); tostada(aviso || (ok ? 'Fondo propio puesto en la pared.' : 'Fondo propio puesto. No cabe en este navegador: se usará hasta que cierres la página.'), 5000);
}
function fondoArchivo(f) {
  if (!/^image\//.test(f.type)) { tostada('Ese archivo no es una imagen.'); return; }
  const u = URL.createObjectURL(f); reduceImg(u).then((d) => ponFondo(d)).catch(() => tostada('No se ha podido leer esa imagen.')).finally(() => URL.revokeObjectURL(u));
}
function fondoUrl(u) {
  if (!/^https?:\/\/\S+$/i.test(u)) { tostada('Pega un enlace que empiece por http:// o https://', 4500); return; }
  u = u.replace(/"/g, '%22'); tostada('Cargando la imagen…', 10000);
  /* si la web deja copiarla, se guarda reducida; si no, se usa el enlace tal cual (se ve en pantalla, pero no en capturas ni PDF) */
  fetch(u, { mode: 'cors' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); }).then((bl) => { const o = URL.createObjectURL(bl); return reduceImg(o).finally(() => URL.revokeObjectURL(o)); }).then((d) => ponFondo(d))
    .catch(() => aImagen(u).then(() => ponFondo(u, 'Fondo puesto. Esa web no deja copiar la imagen: en capturas y PDF la pared saldrá vacía; si la necesitas ahí, descárgala y súbela.')).catch(() => tostada('No se ha podido cargar esa imagen: comprueba que el enlace lleva a una foto.', 5000)));
}
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
    for (const im of c.querySelectorAll('image')) { const h = im.getAttribute('href'); if (h && !/^data:/.test(h)) { try { im.setAttribute('href', await aDatos(h)); } catch (e) { im.remove(); } } }
    const st = document.createElementNS('http://www.w3.org/2000/svg', 'style'); st.textContent = await letras(); c.insertBefore(st, c.firstChild);
    const im = await aImagen('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c))); x.drawImage(im, 0, 0, cv.width, cv.height);
    const png = await new Promise((ok) => cv.toBlob(ok, 'image/png'));
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]); tostada('Captura copiada: pégala donde quieras (Ctrl+V).'); }
    catch (e) { const a = document.createElement('a'); a.href = URL.createObjectURL(png); a.download = 'SCREENS_' + id + '.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); tostada('Este navegador no deja copiar imágenes: la captura se ha descargado.'); }
  } catch (e) { console.warn('captura', e); tostada('No se ha podido hacer la captura.'); }
}
/* ---------- esquema de conexión, lista de material y PDF ---------- */
/* colores por tipo de señal, los mismos de la versión clásica (vídeo azul, Ethernet verde, fibra naranja, alimentación rojo, control violeta), en tonos que se leen en claro y en oscuro */
const COL_SENAL = { video: '#2f7fe0', eth: '#3fae4f', fibra: '#f07020', power: '#e5404f', ctrl: '#8b55e8' };
const COL_GRUPO = { pantalla: '#9aa3b2', video: COL_SENAL.video, elec: '#14a38b', fibra: COL_SENAL.fibra, eth: COL_SENAL.eth, power: COL_SENAL.power, ctrl: COL_SENAL.ctrl, extra: '#d08a00' };
/* cables HDMI PureLink FlexInstall (Charmex): FI-H100 pasivo HDMI 2.1 8K hasta 3 m y FI-H150 AOC 8K de 5 a 20 m; el más corto que cubre la distancia, o el de 3 m si no se sabe */
const PURELINK_FI = [['FI-H100-005', .5, 'pasivo'], ['FI-H100-010', 1, 'pasivo'], ['FI-H100-015', 1.5, 'pasivo'], ['FI-H100-020', 2, 'pasivo'], ['FI-H100-030', 3, 'pasivo'], ['FI-H150-050', 5, 'AOC'], ['FI-H150-075', 7.5, 'AOC'], ['FI-H150-100', 10, 'AOC'], ['FI-H150-125', 12.5, 'AOC'], ['FI-H150-150', 15, 'AOC'], ['FI-H150-200', 20, 'AOC']].map((x) => ({ ref: x[0], m: x[1], tipo: x[2] }));
const cableHdmiFI = (dist) => { if (!dist) return { ...PURELINK_FI[4], estandar: true }; const c = PURELINK_FI.find((x) => x.m >= dist); return c ? { ...c, estandar: false } : null; };
/* lo que necesitan el esquema y la lista de material */
function datosProyecto() {
  const { m, r } = R, p = R.proc, me = R.media, backup = !!E.backup, rack = E.conexion === 'fibra', mult = backup ? 2 : 1, nF = Math.max(1, +E.entradas || 1), cableM = parseFloat(E.cableM) || 0;
  const cvtEq = p && (p.equipos || []).find((q) => q.ref === (ELEC.ELEC_CVT || {}).ref || q.ref === (ELEC.ELEC_MX_CVT || {}).ref), cvt = cvtEq ? cvtEq.cant : 0;
  const cab = E.tipoEntrada !== 'DP' && E.tipoEntrada !== 'SDI' ? cableHdmiFI(cableM) : null, conCable = E.tipoEntrada !== 'DP' && E.tipoEntrada !== 'SDI';
  return { m, r, p, me, backup, rack, mult, nF, cvt, cvtRef: cvtEq ? cvtEq.ref : (ELEC.ELEC_CVT || {}).ref || 'CVT10 Pro', fibras: cvt * mult, lines: r.lineas, cab, conCable, cableM, amps: fmt(r.cab * R.ampCab, 1), kw: fmt(r.kw, 2) };
}
/* lista de material, fila a fila como en la clásica: { c, ref, url, desc, g, titulo, pieza } */
function material() {
  const d = datosProyecto(), { m, r, p, me } = d, L = [], busca = ELEC.charmexBusca || ((x) => '');
  const cabDesc = (x) => 'Cabinet LED ' + x.pitch + 'p ' + x.cabAncho + '×' + x.cabAlto + ' mm';
  if (R.holo && R.holo.comb) { [[R.holo.comb.mA, R.holo.comb.cA], [R.holo.comb.mE, R.holo.comb.cE]].forEach(([x, n]) => L.push({ c: n * r.rows, ref: x.crm, url: x.urlProd || busca(x.crm), desc: cabDesc(x), g: 'pantalla' })); }
  else L.push({ c: r.cab, ref: m.crm, url: m.urlProd || busca(m.crm), desc: cabDesc(m), g: 'pantalla' });
  L.push({ c: d.nF, ref: E.tipoEntrada && E.tipoEntrada !== 'MIXTO' ? E.tipoEntrada : 'HDMI', desc: 'Fuentes de vídeo del cliente' + (E.resEntrada ? ' (' + E.resEntrada + ')' : ''), g: 'video' });
  if (d.conCable) { if (d.cab) L.push({ c: d.nF, ref: d.cab.ref, url: busca(d.cab.ref), desc: 'Cable HDMI PureLink FlexInstall ' + (d.cab.tipo === 'AOC' ? 'AOC' : 'pasivo') + ' 8K ' + String(d.cab.m).replace('.', ',') + ' m (fuente → ' + (me ? 'mediaserver' : 'electrónica') + ')' + (d.cab.estandar ? ' · estándar, distancia no indicada' : ''), g: 'video' });
    else L.push({ c: d.nF, ref: 'HDMI > 20 m', desc: 'Más de 20 m: consultar con Charmex (extensor HDMI sobre fibra / IP)', g: 'video' }); }
  if (me) L.push({ c: d.backup && !me.backupNativo ? 2 : 1, ref: me.modelo, url: me.url || busca(me.modelo), desc: (me.tipo === 'switcher' ? 'Switcher de presentación ' : 'Mediaserver ') + me.marca + (me.backupNativo ? ' (backup nativo)' : ''), g: 'video' });
  if (p) { const eq = (p.equipos || []).filter((q) => q.cant > 0), tit = 'Electrónica ' + p.marca + ' ' + (p.serie || '') + (p.escalador ? ' con escalador' : '');
    if (p.modular) { L.push({ c: '', ref: p.modelo, desc: tit + ', montada por piezas:', g: 'elec', titulo: true }); eq.forEach((q) => L.push({ c: q.cant, ref: q.ref, url: busca(q.ref), desc: q.desc, g: 'elec', pieza: true })); }
    else { L.push({ c: 1, ref: p.modelo, url: p.url || busca(p.modelo), desc: tit, g: 'elec' }); eq.forEach((q) => L.push({ c: q.cant, ref: q.ref, url: busca(q.ref), desc: q.desc, g: 'elec' })); } }
  else L.push({ c: '', ref: 'Sin equipo adecuado', desc: 'Cambia backup, escalador o conexión', g: 'elec' });
  if (d.rack) { L.push({ c: d.fibras, ref: 'Fibra óptica', desc: 'Latiguillo electrónica → conversor' + (d.backup ? ' (+ backup)' : ''), g: 'fibra' }); L.push({ c: d.lines * d.mult, ref: 'Cat6 (RJ45)', desc: 'Conversor → pantalla' + (d.backup ? ' (+ backup)' : ''), g: 'eth' }); }
  else L.push({ c: d.lines * d.mult, ref: 'Cat6 (RJ45)', desc: 'Electrónica → pantalla' + (d.backup ? ' (+ backup)' : ''), g: 'eth' });
  L.push({ c: 1, ref: 'Distribución eléctrica', desc: d.amps + ' A · ' + d.kw + ' kW máx. · ' + R.nLin + ' × 16 A + cableado de alimentación', g: 'power' });
  L.push({ c: 1, ref: 'PC de control', desc: 'Con el software del fabricante y cable USB / Ethernet', g: 'ctrl' });
  /* v10.35 · pantalla de exterior (v10.36: y de escaparate): siempre el sensor de luz, que ajusta solo el brillo a la luz ambiente (se conecta a la electrónica) */
  if (E.tipo === 'OUTDOOR' || E.tipo === 'ESCAPARATE') L.push({ c: 1, ref: 'NS060', url: busca('NS060'), desc: 'Sensor de luz 5 m para pantalla LED (brillo automático según la luz ambiente; se conecta a la electrónica)', g: 'ctrl' });
  if (E.gold) L.push({ c: '', ref: 'Variante tropicalizada', desc: 'Entorno marino / húmedo: contactos chapados en oro y protección anticorrosión en cabinets, tarjetas y electrónica (consultar disponibilidad por fabricante)', g: 'extra' });
  return L;
}
const NOTA_MAT = '* Propuesta orientativa: confirmar referencias, tarjetas y cableado con el fabricante antes de ofertar.';
const vineta = (x) => `<i class="mat-v${x.pieza ? ' pz' : ''}" style="background:${COL_GRUPO[x.g] || '#999'}"></i>`;
const tablaMaterial = () => `<table class="mat"><thead><tr><th>Cant.</th><th>Referencia</th><th>Descripción</th></tr></thead><tbody>${material().map((x) => `<tr class="${x.titulo ? 'tit' : x.pieza ? 'pz' : ''}"><td>${x.c === '' ? '' : fmt(x.c) + (x.pieza ? '×' : '')}</td><td data-crudo>${vineta(x)}${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.ref)}</a>` : esc(tr(x.ref))}</td><td>${esc(x.desc)}</td></tr>`).join('')}</tbody></table><div class="nota">${NOTA_MAT}</div>`;
/* esquema de conexiones, como en la clásica: PC de control, fuentes → (mediaserver) → electrónica → (conversor de fibra) → pantalla, con el color de cada tipo de cable, el backup en discontinua, la alimentación y la leyenda */
function svgEsquema() {
  const d = datosProyecto(), { m, r, p, me } = d, W = 1000, H = 620, tc = 'currentColor', S = COL_SENAL;
  const keys = ['fuentes']; if (me) keys.push('media'); keys.push('elec'); if (d.rack) keys.push('cvt'); keys.push('pantalla');
  const n = keys.length, bw = n >= 5 ? 146 : n === 4 ? 168 : 190, by = 132, bh = 196, cy = by + bh / 2, gx = (W - 40 - bw * n) / (n - 1), X = {}; keys.forEach((k, i) => { X[k] = 20 + i * (bw + gx); }); const cx = (k) => X[k] + bw / 2;
  const T = { fuentes: ['#64748b', 'FUENTES DE VÍDEO'], media: ['#14a38b', 'MEDIASERVER'], elec: ['#14a38b', 'ELECTRÓNICA'], cvt: [S.fibra, 'CONVERSOR'], pantalla: ['#5b6472', 'PANTALLA LED'] };
  const tx = (x, y, s, o = {}) => { s = String(s); const sz = o.sz || 14, max = o.max || 0, lj = max && s.length * sz * (o.mono ? .62 : .56) > max ? ` textLength="${max}" lengthAdjust="spacingAndGlyphs"` : ''; return `<text x="${x}" y="${y}" font-size="${sz}" font-weight="${o.w || 400}" fill="${o.c || tc}" text-anchor="${o.a || 'middle'}" font-family="${o.mono ? 'Share Tech Mono, monospace' : 'Inter, sans-serif'}"${lj}>${esc(s)}</text>`; };
  const linea = (x1, y1, x2, y2, c, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${S[c]}" stroke-width="3.2"${dash ? ' stroke-dasharray="8 6"' : ''} marker-end="url(#ar-${c})"/>`;
  const caja = (k, cu) => `<g><rect x="${X[k]}" y="${by}" width="${bw}" height="${bh}" rx="8" fill="${T[k][0]}" fill-opacity=".1" stroke="${T[k][0]}" stroke-width="2.5"/><path d="M${X[k]} ${by + 30}V${by + 8}a8 8 0 0 1 8-8h${bw - 16}a8 8 0 0 1 8 8V${by + 30}z" fill="${T[k][0]}"/>${tx(cx(k), by + 21, T[k][1], { c: '#fff', w: 800, sz: 13.5, max: bw - 12 })}${cu}</g>`;
  let g = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="color:var(--txt)" role="img" aria-label="Esquema de conexiones del proyecto"><defs>${Object.keys(S).map((c) => `<marker id="ar-${c}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="${S[c]}"/></marker>`).join('')}</defs>`;
  /* PC de control (violeta) */
  const pcK = 'elec'; g += `<rect x="${cx(pcK) - 115}" y="18" width="230" height="56" rx="8" fill="${S.ctrl}" fill-opacity=".12" stroke="${S.ctrl}" stroke-width="2.5"/>${tx(cx(pcK), 42, 'PC DE CONTROL', { w: 800, c: S.ctrl, sz: 15 })}${tx(cx(pcK), 62, 'Software del fabricante', { sz: 12.5 })}${linea(cx(pcK), 74, cx(pcK), by - 3, 'ctrl')}${tx(cx(pcK) + 10, 104, 'USB / Ethernet', { a: 'start', sz: 12.5, c: S.ctrl, w: 700 })}`;
  /* fuentes */
  const verF = Math.min(d.nF, d.nF > 4 ? 3 : 4); let cu = '';
  for (let i = 0; i < verF; i++) { const x = X.fuentes + 16, y = by + 42 + i * 34; cu += `<rect x="${x}" y="${y}" width="36" height="23" rx="2" fill="${tc}" fill-opacity=".15" stroke="${tc}" stroke-width="1.6"/><rect x="${x + 15}" y="${y + 23}" width="6" height="4" fill="${tc}"/><rect x="${x + 9}" y="${y + 27}" width="18" height="2.5" fill="${tc}"/>` + tx(x + 46, y + 17, 'FUENTE ' + (i + 1), { a: 'start', sz: 12.5, w: 700 }); }
  if (d.nF > verF) cu += tx(cx('fuentes'), by + 42 + verF * 34 + 16, '+ ' + (d.nF - verF) + ' más', { sz: 12.5, w: 700 });
  g += caja('fuentes', cu);
  if (me) { cu = ''; for (let i = 0; i < 3; i++) cu += `<rect x="${X.media + 16}" y="${by + 44 + i * 24}" width="${bw - 32}" height="17" rx="2" fill="#14a38b" fill-opacity=".22" stroke="#14a38b"/><circle cx="${X.media + 28}" cy="${by + 52.5 + i * 24}" r="3" fill="#14a38b"/><line x1="${X.media + 40}" y1="${by + 52.5 + i * 24}" x2="${X.media + bw - 28}" y2="${by + 52.5 + i * 24}" stroke="#14a38b" stroke-width="1.4"/>`;
    g += caja('media', cu + tx(cx('media'), by + 140, me.modelo, { w: 800, sz: 15, max: bw - 14 }) + tx(cx('media'), by + 160, me.marca, { sz: 12.5 }) + (d.backup && !me.backupNativo ? tx(cx('media'), by + 180, '×2 (backup)', { sz: 12, c: '#d08a00', w: 800 }) : '')); }
  cu = `<rect x="${X.elec + 14}" y="${by + 42}" width="${bw - 28}" height="42" rx="3" fill="#14a38b" fill-opacity=".18" stroke="#14a38b"/>`; for (let i = 0; i < 5; i++) cu += `<circle cx="${X.elec + 28 + i * 14}" cy="${by + 54}" r="3.2" fill="${i < 2 ? S.eth : '#c6e04a'}" stroke="#14a38b" stroke-width=".7"/>`; for (let i = 0; i < 6; i++) cu += `<rect x="${X.elec + 22 + i * ((bw - 46) / 6)}" y="${by + 65}" width="11" height="10" fill="#fff" stroke="#14a38b"/>`;
  g += caja('elec', cu + (p ? tx(cx('elec'), by + 118, p.modelo, { w: 800, sz: 15, max: bw - 14 }) + tx(cx('elec'), by + 138, p.marca + (p.serie ? ' · ' + p.serie : ''), { sz: 12.5, max: bw - 14 }) + tx(cx('elec'), by + 160, d.lines + (d.lines > 1 ? ' líneas' : ' línea') + (d.backup ? ' + backup' : ''), { sz: 12.5, w: 700, max: bw - 14 }) : tx(cx('elec'), by + 128, 'Sin equipo adecuado', { sz: 13, c: S.power, w: 800, max: bw - 14 })));
  if (d.rack) g += caja('cvt', `<rect x="${X.cvt + 16}" y="${by + 46}" width="${bw - 32}" height="36" rx="4" fill="${S.fibra}" fill-opacity=".14" stroke="${S.fibra}" stroke-width="1.8"/><path d="M${X.cvt + 28} ${by + 64}h26m-6-5 6 5-6 5" stroke="${S.fibra}" stroke-width="2.4" fill="none"/><path d="M${X.cvt + bw - 56} ${by + 64}h26m-6-5 6 5-6 5" stroke="${S.eth}" stroke-width="2.4" fill="none"/>` + tx(cx('cvt'), by + 118, d.cvtRef + ' ×' + d.cvt, { w: 800, sz: 14, max: bw - 14 }) + tx(cx('cvt'), by + 138, 'Fibra → Ethernet', { sz: 12.5 }));
  { const cC = Math.min(r.cols, 12), cR = Math.min(r.rows, 7), cw = (bw - 28) / cC, ch = Math.min(64 / cR, cw * .75); cu = ''; for (let f = 0; f < cR; f++) for (let c = 0; c < cC; c++) cu += `<rect x="${X.pantalla + 14 + c * cw}" y="${by + 40 + f * ch}" width="${cw - 1.2}" height="${ch - 1.2}" fill="#0b1220" stroke="#ccff00" stroke-width=".8"/>`;
    g += caja('pantalla', cu + tx(cx('pantalla'), by + 132, r.cols + '×' + r.rows + ' cabinets', { w: 800, sz: 14, max: bw - 14 }) + tx(cx('pantalla'), by + 152, r.resW + '×' + r.resH + ' px', { sz: 12.5, mono: true }) + tx(cx('pantalla'), by + 172, String(m.pitch).replace('.', ',') + 'p · ' + fmt(r.ancho, 2) + '×' + fmt(r.alto, 2) + ' m', { sz: 12.5, max: bw - 14 })); }
  /* conexiones: el color dice el tipo de cable; el backup va en discontinua */
  const etqTipo = E.tipoEntrada === 'DP' ? 'DisplayPort' : E.tipoEntrada && E.tipoEntrada !== 'MIXTO' ? E.tipoEntrada : 'HDMI/DP/SDI', etqRes = E.resEntrada === '4K' ? '4K' : E.resEntrada === 'FHD' ? '1080p' : E.resEntrada === 'HD' ? '720p' : '';
  for (let i = 0; i < n - 1; i++) { const a = keys[i], b = keys[i + 1]; let c, l1, l2, bk;
    if (a === 'fuentes') { c = 'video'; l1 = etqTipo + ' ×' + d.nF; l2 = [etqRes, d.conCable ? (d.cab ? d.cab.ref : 'HDMI > 20 m') : ''].filter(Boolean).join(' · '); bk = false; }
    else if (a === 'media') { c = 'video'; l1 = 'HDMI/DP 4K'; l2 = '×' + (me.need || r.salidas4k || 1); bk = d.backup && !me.backupNativo; }
    else if (a === 'elec' && b === 'cvt') { c = 'fibra'; l1 = 'Fibra ×' + d.fibras + (d.backup ? ' (' + d.cvt + ' + ' + d.cvt + ' backup)' : ''); l2 = 'SM/MM'; bk = d.backup; }
    else { c = 'eth'; l1 = 'Cat6 ×' + d.lines + (d.backup ? ' + ' + d.lines + ' backup' : ''); l2 = d.backup ? '= ' + d.lines * 2 + ' cables' : ''; bk = d.backup; }
    const x1 = X[a] + bw + 2, x2 = X[b] - 4, mid = (x1 + x2) / 2, ly = by + bh + 26 + (n >= 4 && i % 2 ? 40 : 0), mx = Math.min(bw + gx - 16, 230);
    g += linea(x1, cy - (bk ? 12 : 0), x2, cy - (bk ? 12 : 0), c) + (bk ? linea(x1, cy + 14, x2, cy + 14, c, true) : '') + `<line x1="${mid}" y1="${cy + (bk ? 18 : 4)}" x2="${mid}" y2="${ly - 16}" stroke="${S[c]}" stroke-width="1" stroke-dasharray="2 3" stroke-opacity=".7"/>` + tx(mid, ly, l1, { sz: 13.5, w: 800, c: S[c], max: mx, mono: true }) + (l2 ? tx(mid, ly + 18, l2, { sz: 12, c: S[c], max: mx, mono: true }) : ''); }
  /* alimentación (rojo) */
  const pw = 250, pwX = Math.max(20, Math.min(W - 20 - pw, cx('elec') - pw / 2)), pwY = 452, ph = 58;
  g += `<rect x="${pwX}" y="${pwY}" width="${pw}" height="${ph}" rx="8" fill="${S.power}" fill-opacity=".1" stroke="${S.power}" stroke-width="2.5"/>${tx(pwX + pw / 2, pwY + 24, 'DISTRIBUCIÓN ELÉCTRICA', { w: 800, c: S.power, sz: 14, max: pw - 16 })}${tx(pwX + pw / 2, pwY + 45, d.amps + ' A · ' + d.kw + ' kW máx.', { sz: 12.5, mono: true })}`;
  g += linea(cx('elec'), pwY, cx('elec'), by + bh + 3, 'power') + tx(cx('elec') + 9, pwY - 8, '230 V', { a: 'start', sz: 12.5, w: 800, c: S.power });
  g += `<path d="M${pwX + pw} ${pwY + ph / 2}H${cx('pantalla')}V${by + bh + 3}" stroke="${S.power}" stroke-width="3.2" fill="none" marker-end="url(#ar-power)"/>` + tx((pwX + pw + cx('pantalla')) / 2, pwY + ph / 2 - 9, 'Alimentación cabinets · ' + R.nLin + ' × 16 A', { sz: 12.5, w: 800, c: S.power, max: Math.max(80, cx('pantalla') - pwX - pw - 30) });
  if (E.gold) g += `<rect x="${W - 262}" y="18" width="242" height="56" rx="8" fill="#d08a00" fill-opacity=".14" stroke="#d08a00" stroke-width="2"/>${tx(W - 141, 41, 'ENTORNO MARINO / HÚMEDO', { sz: 12.5, w: 800, c: '#d08a00' })}${tx(W - 141, 61, 'Tropicalizado · contactos oro', { sz: 12 })}`;
  /* leyenda */
  { const LEY = [['video', tr('Vídeo (' + etqTipo + ')'), 0], ['eth', tr('Ethernet Cat6 / RJ45'), 0], ['fibra', tr('Fibra óptica'), 0], ['power', tr('Alimentación'), 0], ['ctrl', tr('Control (USB/LAN)'), 0], ['eth', tr('Backup (discontinua)'), 1]], an = LEY.map((x) => 34 + 7 + x[1].length * 7.1 + 24), tot = an.reduce((a, b) => a + b, 0), k = Math.min(1, (W - 40) / tot); let x = 20 + Math.max(0, (W - 40 - tot) / 2);
    LEY.forEach(([c, l, dash], i) => { g += `<line x1="${x}" y1="${H - 26}" x2="${x + 34 * k}" y2="${H - 26}" stroke="${S[c]}" stroke-width="3.4"${dash ? ' stroke-dasharray="8 6"' : ''}/>` + tx(x + 41 * k, H - 21, l, { a: 'start', sz: 12.5 * Math.max(.8, k), max: (an[i] - 34 - 7 - 24) * k }); x += an[i] * k; }); }
  return g + '</svg>';
}
/* triángulo de aviso del pie del PDF (html2canvas solo lee atributos y estilos en línea del <svg>) */
const AV_TRI = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;width:1.2em;height:1.2em;vertical-align:-.25em;margin-right:.35em"><path d="M12 3.6 2.4 20.2h19.2z"/><path d="M12 9.6v5"/><path d="M12 17.6h.01"/></svg>';
/* un dibujo SVG de la app convertido en imagen (con sus fotos y sus letras dentro), para la hoja del PDF */
async function svgImg(svgTxt, w, h, fondo, tinta) {
  const caja = document.createElement('div'); caja.innerHTML = svgTxt; const c = caja.querySelector('svg'); c.querySelectorAll('text').forEach((e) => { if (!e.children.length) { const n = tr(e.textContent); if (n !== e.textContent) e.textContent = n; } }); c.setAttribute('width', w); c.setAttribute('height', h); c.removeAttribute('style'); c.setAttribute('color', tinta);
  c.querySelectorAll('[fill="currentColor"]').forEach((e) => e.setAttribute('fill', tinta)); c.querySelectorAll('[stroke="currentColor"]').forEach((e) => e.setAttribute('stroke', tinta));
  const fo = c.querySelector('foreignObject'); if (fo) { const vid = document.querySelector('[data-blk="S1A"] svg video'), t = document.createElement('canvas'); t.width = (vid && vid.videoWidth) || 640; t.height = (vid && vid.videoHeight) || 360; let ok = false; try { if (vid) { t.getContext('2d').drawImage(vid, 0, 0, t.width, t.height); t.toDataURL(); ok = true; } } catch (e) {} if (ok) { const im = document.createElementNS('http://www.w3.org/2000/svg', 'image'); ['x', 'y', 'width', 'height'].forEach((a) => im.setAttribute(a, fo.getAttribute(a))); im.setAttribute('preserveAspectRatio', 'xMidYMid slice'); im.setAttribute('href', t.toDataURL('image/jpeg', .9)); fo.replaceWith(im); } else fo.remove(); }
  for (const im of c.querySelectorAll('image')) { const hr = im.getAttribute('href'); if (hr && !/^data:/.test(hr)) { try { im.setAttribute('href', await aDatos(new URL(hr, document.baseURI).href)); } catch (e) { im.remove(); } } }
  const st = document.createElementNS('http://www.w3.org/2000/svg', 'style'); st.textContent = await letras(); c.insertBefore(st, c.firstChild);
  const im = await aImagen('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c))), cv = document.createElement('canvas'), k = 2; cv.width = w * k; cv.height = h * k; const x = cv.getContext('2d'); x.fillStyle = fondo; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(im, 0, 0, cv.width, cv.height);
  return cv.toDataURL('image/jpeg', .9);
}
/* PDF del proyecto en dos hojas: 1) la pantalla, la simulación y todos sus datos; 2) el esquema de conexión, el cableado y la lista de material */
let HACIENDO_PDF = false;
async function pdf() {
  if (!R || !R.r) { tostada('Calcula primero una pantalla.'); return; } if (!window.AVPDF) { tostada('No se ha podido cargar el módulo de PDF.'); return; } if (HACIENDO_PDF) return; HACIENDO_PDF = true;
  const hoja = document.createElement('div');
  try {
    if (VENT) cierra(); const { m, r } = R, p = R.proc, me = R.media, TI = '#17181c', G = '#c9ccd3', hoy = new Date().toLocaleDateString(idioma() === 'en' ? 'en-GB' : idioma() === 'ca' ? 'ca-ES' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const img = async (svg, w, h, bg) => `<img src="${await svgImg(svg, w, h, bg, TI)}" alt="" style="display:block;width:100%;height:auto;border:1px solid ${G};border-radius:6px">`;
    const sim = await img(svgSim(1.5, 0), 860, 573, '#1a1a1d'), sen = await img(svgRejilla('senal'), 1000, 620, '#f4f5f7'), ele = await img(svgRejilla('elec'), 1000, 620, '#f4f5f7'), esq = await img(svgEsquema(), 1000, 620, '#f4f5f7');
    const fila = (k, v) => (v === '' || v == null ? '' : `<tr><td style="padding:1.5px 0;color:#555">${k}</td><td style="padding:1.5px 0 1.5px 8px;font-weight:700;text-align:right">${v}</td></tr>`), rot = (s) => `<div style="font:800 8.5px/1.2 Inter,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#555;margin:0 0 3px">${s}</div>`;
    const caja = (tit, filas) => `<div style="border:1px solid ${G};border-radius:6px;padding:6px 9px;background:#fff">${rot(tit)}<table style="width:100%;border-collapse:collapse;font:400 9.5px/1.35 Inter,Arial,sans-serif">${filas}</table></div>`;
    const cab = (sub) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:2px solid ${TI};padding-bottom:7px;margin-bottom:9px"><img src="../assets/screens-logo-claro.svg" alt="SCREENS" style="height:30px;width:auto"><div style="text-align:right;font:400 9.5px/1.35 Inter,Arial,sans-serif"><div style="font:800 13px/1.2 Inter,Arial,sans-serif" data-crudo>${esc(E.proy || 'Pantalla LED ' + m.crm)}</div><div>${E.cliente ? '<span data-crudo>' + esc(E.cliente) + '</span> · ' : ''}${hoy}</div></div></div>`;
    const TIPO = { INDOOR: 'Interior', OUTDOOR: 'Exterior', ESCAPARATE: 'Escaparate' }[E.tipo], sob = Math.abs(r.sobra.w) > .01 || Math.abs(r.sobra.h) > .01 ? (r.sobra.w >= 0 ? 'sobran ' : 'faltan ') + fmt(Math.abs(r.sobra.w) * 100) + ' × ' + fmt(Math.abs(r.sobra.h) * 100) + ' cm' : 'medida exacta';
    const p1 = cab('hoja 1 de 2') +
      `<div style="border:1px solid ${TI};border-radius:6px;padding:7px 10px;margin-bottom:9px;font:700 11px/1.4 Inter,Arial,sans-serif">PANTALLA LED <span data-crudo>${esc(m.crm)}</span> · ${fmt(r.ancho * 100)} × ${fmt(r.alto * 100)} cm · ${fmt(R.diag / .0254)}″ · ${r.cols}×${r.rows} = ${r.cab} cabinets · ${r.resW}×${r.resH} px · ${fmt(r.peso)} kg · ${fmt(r.kw, 2)} kW</div>` +
      `<div style="margin-bottom:9px">${sim}</div>` +
      `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:8px">` +
      caja('Dimensiones', fila('Medida pedida', fmt(E.w * 100) + ' × ' + fmt(E.h * 100) + ' cm') + fila('Medida real', fmt(r.ancho * 100) + ' × ' + fmt(r.alto * 100) + ' cm') + fila('Ajuste', sob) + fila('Diagonal', fmt(R.diag * 100) + ' cm · ' + fmt(R.diag / .0254) + '″') + fila('Formato', R.formato) + fila('Superficie', fmt(r.ancho * r.alto, 2) + ' m²') + fila('Elevación desde el suelo', fmt(E.elev) + ' cm')) +
      caja('Cabinet', fila('Modelo', '<span data-crudo>' + esc(m.crm) + '</span>') + fila('Familia', '<span data-crudo>' + esc(m.family || '—') + '</span>') + fila('Pitch', String(R.pitch).replace('.', ',') + ' mm') + fila('Cabinet', m.cabAncho + '×' + m.cabAlto + (m.thick ? '×' + m.thick : '') + ' mm' + (m.girado ? ' · girado 90°' : '')) + fila('Columnas × filas', r.cols + ' × ' + r.rows + ' = ' + r.cab) + fila('Brillo', m.nits ? fmt(m.nits) + ' nits' : '') + fila('Refresco', m.hz ? fmt(m.hz) + ' Hz' : '') + fila('Disponibilidad', enStock(m) ? 'En stock' : 'Bajo pedido')) +
      caja('Resolución', fila('Píxeles', r.resW + ' × ' + r.resH) + fila('Total', fmt(r.pix / 1e6, 2) + ' Mpx' + (R.nivel[0] ? ' · ' + R.nivel[0] : '')) + fila('Salidas 4K', r.salidas4k) + fila('Distancia mínima', fmt(m.pitch * 100) + ' cm') + fila('Distancia óptima', 'desde ' + fmt(m.pitch * 300) + ' cm') + fila('Distancia de visionado', E.dist ? fmt(E.dist, 1) + ' m' : '') + fila('Entorno', TIPO + ' · ' + (E.clase === 'RENTAL' ? 'Alquiler' : 'Fija')) + fila('Opciones', [E.transp && 'Transparente', E.gold && 'Marino / tropical', E.protegido && 'Alcance público', E.sol === 'directo' && 'Sol directo', E.sol === 'indirecto' && 'Sol indirecto'].filter(Boolean).join(' · '))) +
      caja('Instalación', fila('Peso total', fmt(r.peso, 1) + ' kg') + fila('Por cabinet', m.cabKg ? fmt(m.cabKg, 1) + ' kg' : '') + fila('Mantenimiento', esc(m.mant || m.mantenimiento || '')) + fila('Receiving card', '<span data-crudo>' + esc(m.card || '') + '</span>') + fila('Grosor', m.thick ? fmt(m.thick) + ' mm' : '')) +
      caja('Alimentación', fila('Consumo máximo', fmt(r.kw, 2) + ' kW') + fila('Corriente', fmt(r.cab * R.ampCab, 1) + ' A · 230 V') + fila('Líneas de 16 A', R.nLin) + fila('Por cabinet', (m.wMax ? fmt(m.wMax) + ' W' : '') + (R.ampCab ? ' · ' + fmt(R.ampCab, 2) + ' A' : ''))) +
      caja('Señal y electrónica', fila('Procesador', p ? '<span data-crudo>' + esc(p.modelo) + '</span>' : '—') + fila('Puertos', p ? esc(p.puertos) : '') + fila('Escalador', p ? (p.escalador ? 'Sí' : 'No') : '') + fila('Mediaserver', me ? '<span data-crudo>' + esc(me.modelo) + '</span>' : 'No') + fila('Líneas Ethernet', r.lineas + (E.backup ? ' + ' + r.lineas + ' de backup' : '')) + fila('Conexión', E.conexion === 'fibra' ? 'Fibra' : 'RJ45') + fila('Cosido', R.cosido) + fila('Fuentes de vídeo', Math.max(1, +E.entradas || 1) + ' × ' + (E.tipoEntrada && E.tipoEntrada !== 'MIXTO' ? E.tipoEntrada : 'HDMI/DP/SDI') + (E.resEntrada ? ' ' + E.resEntrada : ''))) + `</div>` +
      (E.obs && E.obs.trim() ? `<div style="border:1px solid ${G};border-radius:6px;padding:6px 9px">${rot('Observaciones')}<div data-crudo style="font:400 9.5px/1.45 Inter,Arial,sans-serif;white-space:pre-wrap">${esc(E.obs.trim())}</div></div>` : '');
    const p2 = cab('hoja 2 de 2') + rot('Esquema de conexión') + `<div style="margin-bottom:9px">${esq}</div>` +
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:9px"><div>${rot('Cableado de señal')}${sen}</div><div>${rot('Cableado eléctrico')}${ele}</div></div>` +
      rot('Lista de material') + `<table style="width:100%;border-collapse:collapse;font:400 9.5px/1.4 Inter,Arial,sans-serif;margin-bottom:5px"><thead><tr>${['Cant.', 'Referencia', 'Descripción'].map((s, i) => `<th style="text-align:${i ? 'left' : 'right'};padding:3px 6px;border-bottom:1.5px solid ${TI};font-weight:800">${s}</th>`).join('')}</tr></thead><tbody>${material().map((x) => `<tr><td style="text-align:right;padding:3px 6px;border-top:1px ${x.pieza ? 'dotted' : 'solid'} ${G};font-weight:700;white-space:nowrap">${x.c === '' ? '' : fmt(x.c) + (x.pieza ? '×' : '')}</td><td data-crudo style="padding:3px 6px 3px ${x.pieza ? 22 : 6}px;border-top:1px ${x.pieza ? 'dotted' : 'solid'} ${G};white-space:nowrap;font-weight:700"><span style="display:inline-block;width:${x.pieza ? 6 : 8}px;height:${x.pieza ? 6 : 8}px;border-radius:${x.pieza ? 1 : 4}px;margin-right:6px;vertical-align:0;background:${COL_GRUPO[x.g] || '#999'}"></span>${esc(x.url ? x.ref : tr(x.ref))}</td><td style="padding:3px 6px;border-top:1px ${x.pieza ? 'dotted' : 'solid'} ${G}">${esc(x.desc)}</td></tr>`).join('')}</tbody></table>` +
      `<div style="font:400 8.5px/1.4 Inter,Arial,sans-serif;color:#555">${tr(NOTA_MAT)}</div>`;
    hoja.id = 'hoja'; hoja.style.cssText = `position:fixed;left:-20000px;top:0;width:702px;background:#fff;color:${TI};font:400 10px/1.4 Inter,Arial,sans-serif`;
    hoja.innerHTML = `<div class="pdf-p1"><div style="padding:0 0 6px">${p1}</div></div><div style="height:60px"></div><div class="pdf-p2"><div style="padding:0 0 6px">${p2}</div></div>`;
    document.body.appendChild(hoja); await Promise.all([...hoja.querySelectorAll('img')].map((i) => (i.complete ? 0 : new Promise((ok) => { i.onload = i.onerror = ok; })))); await new Promise((ok) => setTimeout(ok, 60));
    const pv = await window.AVPDF.exporta({ previa: true, raiz: hoja, paginas: [['.pdf-p1'], ['.pdf-p2']], margen: 12, claro: false, nombre: window.AVPDF.sello('SCREENS'), titulo: 'SCREENS · ' + (E.proy || m.crm),
      /* v10.42 · el pie del PDF es el mismo que el de la pantalla: aviso con su triángulo y, debajo, la línea de crédito común */
      pieHtml: AV_TRI + tr('Cálculo automático que puede contener errores: revísalo antes de presupuestar o instalar.') + '\n' + (window.AVCREDITO ? window.AVCREDITO.html('SCREENS', VERSION.split('SCREENS ')[1], idioma(), { sinEnlaces: true }) : VERSION + ' ' + new Date().getFullYear() + ' · mediaservi.com'),
      alClonar: (doc, raiz) => { raiz.style.setProperty('position', 'absolute', 'important'); raiz.style.setProperty('left', '0', 'important'); raiz.style.setProperty('top', '0', 'important'); [...doc.body.children].forEach((e) => { if (e !== raiz && !e.contains(raiz)) e.style.setProperty('display', 'none', 'important'); }); } });
    previa(pv);
  } catch (e) { console.warn('pdf', e); tostada('No se ha podido generar el PDF.', 5000); }
  finally { hoja.remove(); HACIENDO_PDF = false; }
}
/* vista previa del PDF: ventana al 80 % de la pantalla con las hojas tal cual salen, y botones de pantalla completa, imprimir, guardar y cerrar */
let PV = null;
function previa(pv) {
  if (!pv || !pv.blob) return; sueltaPv(); PV = { ...pv, url: URL.createObjectURL(pv.blob) };
  const v = $('#velo'), b = (k, ic, txt) => `<button type="button" class="tog pv-bt" data-pv="${k}" title="${txt}" aria-label="${txt}">${IC[ic]}<span>${txt}</span></button>`;
  v.innerHTML = `<div class="vent previa" role="dialog" aria-modal="true" aria-label="Vista previa del PDF"><div class="vent-cab">${IC.pdf.replace('<svg', '<svg style="width:1.2em;height:1.2em;flex:none"')}<span class="pv-tit">Vista previa del PDF</span><span class="sep"></span>${b('completa', 'completa', 'Pantalla completa')}${b('imprime', 'imprime', 'Imprimir')}${b('guarda', 'guarda', 'Guardar')}${b('cierra', 'x', 'Cerrar')}</div>
    <div class="vent-cu pv-hojas">${pv.paginas.map((src, i) => `<img class="pv-hoja" src="${src}" alt="Hoja ${i + 1} de ${pv.paginas.length}">`).join('')}</div></div>`;
  VENT = { que: 'pdf' }; v.classList.add('on'); const c = v.querySelector('[data-pv="guarda"]'); if (c) c.focus(); ajustaPv();
}
function sueltaPv() { if (PV && PV.url) URL.revokeObjectURL(PV.url); PV = null; }
const enCompleta = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
function ajustaPv() { const w = $('.vent.previa'); if (!w) return; const full = w.classList.contains('completa'), bt2 = w.querySelector('[data-pv="completa"]'); if (bt2) { const txt = full ? 'Salir de pantalla completa' : 'Pantalla completa'; bt2.innerHTML = (full ? IC.normal : IC.completa) + `<span>${tr(txt)}</span>`; bt2.title = tr(txt); bt2.setAttribute('aria-label', tr(txt)); } w.querySelectorAll('.pv-bt span').forEach((s) => encoge(s, 8)); }
async function accionPv(k) {
  const w = $('.vent.previa'); if (!w || !PV) return;
  if (k === 'cierra') { if (enCompleta()) { try { await (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} } cierra(); return; }
  if (k === 'completa') { const poner = !w.classList.contains('completa');
    if (poner) { w.classList.add('completa'); try { const el = $('#velo'), rf = el.requestFullscreen || el.webkitRequestFullscreen; if (rf) await rf.call(el); } catch (e) {} }
    else { w.classList.remove('completa'); if (enCompleta()) { try { await (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} } }
    ajustaPv(); return; }
  if (k === 'guarda') { const a = document.createElement('a'); a.href = PV.url; a.download = PV.nombre; document.body.appendChild(a); a.click(); a.remove(); tostada(tr('PDF guardado: ' + PV.nombre + '.'), 5000); return; }
  if (k === 'imprime') {
    /* se imprimen las mismas hojas de la vista previa, una por página A4 y sin márgenes (funciona igual en todos los navegadores) */
    const f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    f.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(PV.nombre)}</title><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}img{display:block;width:210mm;height:297mm;page-break-after:always;break-after:page}img:last-child{page-break-after:auto;break-after:auto}</style></head><body>${PV.paginas.map((s) => `<img src="${s}" alt="">`).join('')}</body></html>`;
    f.onload = () => { const cw = f.contentWindow; const fuera = () => setTimeout(() => f.remove(), 1000); try { cw.addEventListener('afterprint', fuera); cw.focus(); cw.print(); } catch (e) { tostada(tr('Este navegador no deja imprimir desde aquí: guarda el PDF e imprímelo desde el archivo.'), 6000); f.remove(); } setTimeout(() => { if (f.isConnected) f.remove(); }, 120000); };
    document.body.appendChild(f); return; }
}
document.addEventListener('fullscreenchange', () => { const w = $('.vent.previa'); if (w && !enCompleta() && w.classList.contains('completa')) { w.classList.remove('completa'); ajustaPv(); } });
/* ---------- guía rápida (la primera vez, o desde Información) ---------- */
const GUIA = [
  [null, 'Hola 👋', 'Hay dos formas de calcular una pantalla LED. Te las enseño en tres pasos.'],
  [['HM2', 'HM3'], '1 · Dímelo', 'Escribe, dicta o suelta un audio con lo que necesitas y pulsa CALCULAR.'],
  [['M1A', 'M2A', 'M1B', 'M2B', 'M3A', 'M3B'], '2 · O elige con los botones', 'Entorno, medidas, cabinet y resolución. Se calcula al momento.'],
  [['S1A', 'S1B', 'M3C', 'M3D', 'M3E', 'M3F'], '3 · Y retócalo', 'Lo que salga se puede cambiar desde los mismos botones: todo se recalcula solo.']];
function guia(n) {
  let g = $('#guia'); const fin = () => { if (g) g.remove(); try { localStorage.setItem('screens-blocks-guia', '1'); } catch (e) {} };
  if (n == null || n >= GUIA.length) { fin(); return; }
  if (!g) { g = document.createElement('div'); g.id = 'guia'; g.className = 'guia'; document.body.appendChild(g); g.addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (b) { e.stopPropagation(); guia(b.dataset.g === 'x' ? null : +b.dataset.g); } }); }
  const [ids, tit, txt] = GUIA[n], W = innerWidth, H = innerHeight; let r = null;
  if (ids) { const rs = ids.map((i) => document.querySelector(`[data-blk="${i}"]`)).filter(Boolean).map((e) => e.getBoundingClientRect()).filter((x) => x.width > 0); if (rs.length) { const m = 6; r = { l: Math.max(4, Math.min(...rs.map((x) => x.left)) - m), t: Math.max(4, Math.min(...rs.map((x) => x.top)) - m), r: Math.min(W - 4, Math.max(...rs.map((x) => x.right)) + m), b: Math.max(...rs.map((x) => x.bottom)) + m }; const zona = $('#rejilla').getBoundingClientRect(); if (r.t >= zona.top - 8) { r.t = Math.max(r.t, zona.top); r.b = Math.min(r.b, zona.bottom); } r.b = Math.min(H - 4, r.b); if (r.b - r.t < 20) r = null; } }
  g.innerHTML = (r ? `<div class="guia-foco" style="left:${r.l}px;top:${r.t}px;width:${r.r - r.l}px;height:${r.b - r.t}px"></div>` : '<div class="guia-foco nada"></div>') + `<div class="guia-caja" role="dialog" aria-modal="true" aria-label="Guía rápida"><i class="guia-flecha"></i><b>${tit}</b><p>${txt}</p><div class="guia-pie"><span>${GUIA.map((x, i) => `<i class="${i === n ? 'on' : ''}"></i>`).join('')}</span><button type="button" class="tog" data-g="x">Cerrar guía</button><button type="button" class="calcular" data-g="${n + 1}">${n === GUIA.length - 1 ? 'Empezar' : 'Siguiente →'}</button></div></div>`;
  /* la caja se coloca donde haya más sitio junto a lo resaltado y la flecha apunta hacia ello */
  const c = g.querySelector('.guia-caja'), fl = g.querySelector('.guia-flecha'), cw = c.offsetWidth, ch = c.offsetHeight, sep = 18; let x = (W - cw) / 2, y = (H - ch) / 2, lado = '';
  if (r) { const esp = { abajo: H - r.b, arriba: r.t, dcha: W - r.r, izda: r.l };
    lado = esp.abajo > ch + sep + 8 ? 'abajo' : esp.dcha > cw + sep + 8 ? 'dcha' : esp.izda > cw + sep + 8 ? 'izda' : esp.arriba > ch + sep + 8 ? 'arriba' : '';
    const cx = (r.l + r.r) / 2, cy = (r.t + r.b) / 2;
    if (lado === 'abajo') { x = cx - cw / 2; y = r.b + sep; } else if (lado === 'arriba') { x = cx - cw / 2; y = r.t - sep - ch; } else if (lado === 'dcha') { x = r.r + sep; y = cy - ch / 2; } else if (lado === 'izda') { x = r.l - sep - cw; y = cy - ch / 2; }
    x = Math.max(8, Math.min(W - cw - 8, x)); y = Math.max(8, Math.min(H - ch - 8, y));
    if (lado) { fl.className = 'guia-flecha ' + lado; if (lado === 'abajo' || lado === 'arriba') fl.style.left = Math.max(18, Math.min(cw - 18, cx - x)) + 'px'; else fl.style.top = Math.max(18, Math.min(ch - 18, cy - y)) + 'px'; } }
  if (!lado) fl.remove(); c.style.left = x + 'px'; c.style.top = y + 'px'; const sig = c.querySelector('.calcular'); if (sig) sig.focus();
}
monta(); todo(); vigila(); requestAnimationFrame(ajustaTextos); if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustaTextos); { let rz = 0; addEventListener('resize', () => { ajustaTextos(); clearTimeout(rz); rz = setTimeout(() => { if (R && R.r && !document.querySelector('.rejilla :focus')) { pintaRejilla(); ajustaTextos(); } }, 250); }); }
{ let vista = false; try { vista = !!localStorage.getItem('screens-blocks-guia'); } catch (e) {} if (!vista) setTimeout(() => guia(0), 600); }
addEventListener('resize', () => { const g = $('#guia'); if (g) { const n = [...g.querySelectorAll('.guia-pie span i')].findIndex((i) => i.classList.contains('on')); guia(Math.max(0, n)); } });
/* botones comunes de la familia: instalar y avisar de un fallo (los mismos de la versión clásica) */
{ const h = $('#hueco-comun'); if (h) { if (window.AVINSTALA) { try { h.appendChild(window.AVINSTALA.boton({ app: 'SCREENS', idioma: () => idioma(), sw: false })); } catch (e) {} } if (window.AVFALLO) { try { h.appendChild(window.AVFALLO.boton({ app: 'SCREENS', version: VERSION, idioma: () => idioma() })); } catch (e) {} }
  /* v10.42 · el candado del panel, el último del grupo de la derecha (pegado a la esquina lo recortaban las ventanas redondeadas) */
  const ae = document.querySelector('.admin-esq'); if (ae) h.appendChild(ae); } }
cargarCatalogo((lista, origen) => { if (origen === 'error') { if (!CAT.length) ESTADO = 'error'; } else { CAT = lista; ESTADO = origen; } todo(); });
window.__blocks = { E, get R() { return R; }, todo };
