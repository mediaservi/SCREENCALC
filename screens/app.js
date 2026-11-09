// SCREENS · interfaz (consola fija con petición en lenguaje natural, panel de rack, simulación 3D y resultados)
import { cargarCatalogo, ordenar, enStock } from './catalogo.js';
import { superficies, distanciaPublico, elegirModelo, calcularLed, totales, aplicarPuertas, obstaculoMundo, puertaMundo } from './led.js';
import { PROYECTORES, CUERPOS, calcularPared, calcularSuelo, SOLAPE_MAX, analizarSombras, obstaculosEnHaces } from './proyeccion.js';
import '../comun/electronica.js';
import '../comun/ficha.js';
import '../comun/voz.js';
import { interpretar } from './peticion.js';
import { vistasTecnicas, activarVistas } from './vistas.js';
import { t, idiomaInicial, fijarIdioma, idioma, IDIOMAS } from './i18n.js';

const VERSION = 'v8.3';
const ELEC = globalThis.SC_ELEC, { fichaHTML } = globalThis.SC_FICHA;
const DEF = () => ({
  cantidad: 'varias', tecnologia: 'led',
  esp: { tipo: 'sala', ancho: 8, fondo: 6, alto: 3.5, elev: 0, altoCubierto: 0,
    paredes: { frontal: true, izquierda: true, derecha: true, trasera: false, suelo: false },
    sueltas: { n: 3, disp: 'arco', ancho: 4, alto: 2.25, elev: 0.6, sep: 0.1, angulo: 25, dist: 5, techo: 3, central: false, cAncho: 6, cAlto: 3.4 },
    obst: [] },
  led: { clase: 'INSTALL', tipo: 'INDOOR', crm: '', ajuste: 'dentro' },
  proy: { tipo: 'pared', cuerpo: '', optica: '', idSuelo: '', solape: 15, lux: 140, ganancia: 1, dist: 0, orient: 'auto', montaje: 'auto', altura: 0, oos: false },
  elec: { backup: false, escalador: 'con', conexion: 'directo', sel: '', marca: 'todos', dante: false, selMedia: '' },
  vista: { contenido: 'carta', etiquetas: true, camara: 'exterior', zona: true, modo: 'continuo', tec: 'todas', vtSup: 0 }
});
let E = DEF();
try { const g = JSON.parse(localStorage.getItem('screens_estado') || 'null'); if (g && g.esp) { const d = DEF(); E = Object.assign(d, g, { elec: Object.assign(d.elec, g.elec || {}), vista: Object.assign(d.vista, g.vista || {}), proy: Object.assign(d.proy, g.proy || {}), esp: Object.assign(d.esp, g.esp, { sueltas: Object.assign(d.esp.sueltas, (g.esp || {}).sueltas || {}) }) }); } } catch (e) {}
delete E.paso; // v7.0 · consola única: se entra directamente al cuadro de mandos (ya no hay página de selector)
// ?led (enlaces de siempre al cálculo de una pantalla LED): la consola se abre en «Una + LED»
try { if (new URLSearchParams(location.search).has('led')) { E.cantidad = 'una'; E.tecnologia = 'led'; } } catch (e) {}
const guardar = () => { try { localStorage.setItem('screens_estado', JSON.stringify(E)); } catch (e) {} };
let catalogo = [], estadoCat = 'cargando', escena = null, calculo = null;
let medio = null;   // vídeo o imagen propios (solo en este navegador, no se guarda)

const $ = (s, r = document) => r.querySelector(s);
const fmt = (v, d = 2) => Number(v || 0).toLocaleString(idioma() === 'en' ? 'en-GB' : 'es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d });
const fmtPx = (v) => Number(v || 0).toLocaleString(idioma() === 'en' ? 'en-GB' : 'es-ES');
const ICO = {
  espacio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>',
  led: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="12" rx="1"/><path d="M9 5v12M15 5v12M3 11h18M8 21h8"/></svg>',
  proy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2" y="8" width="13" height="8" rx="1.5"/><circle cx="11" cy="12" r="2.2"/><path d="M15 10l7-4v12l-7-4"/></svg>',
  elec: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2" y="8" width="20" height="8" rx="1"/><path d="M5 11h2v2H5zM9 11h2v2H9zM13 11h2v2h-2z"/><path d="M18 12h1.5"/></svg>',
  sup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>'
};

// ---------- cálculo ----------
function listaLed() {
  return ordenar(catalogo.filter(m => m.class === E.led.clase && m.tipo === E.led.tipo));
}
// v8.2 · tipo de proyección y relación de proyección preferida en mapping sin distancia (unas 2 veces el ancho de la imagen)
const tipoProy = () => (E.cantidad === 'varias' && E.esp.tipo === 'sala' ? 'sala' : E.proy.tipo === 'mapping' ? 'mapping' : 'pared');
const TR_MAPPING = 2;
// mapping de noche: con la luz de sala por defecto (140 lx) pasa a la de exterior de noche (5 lx), y al volver, al revés
const LUX_DEF = 140, LUX_MAPPING = 5;
function luzSegunTipo() { const m = tipoProy() === 'mapping', lx = Number(E.proy.lux); if (m && lx === LUX_DEF) E.proy.lux = LUX_MAPPING; else if (!m && lx === LUX_MAPPING) E.proy.lux = LUX_DEF; }
// luz de la sala según el uso (valores típicos de luz ambiente sobre la superficie)
const USOS_LUZ = [['mapping', 5], ['oscura', 10], ['auditorio', 50], ['reunion', 140], ['aula', 300], ['feria', 500]];
function nombreSup(s) { return s.tipo === 'pantalla' ? `${t('pantalla')} ${s.num}${s.central ? ' · ' + t('central') : ''}` : t(s.id); }
function calcular() {
  const esp = JSON.parse(JSON.stringify(E.esp));
  if (E.cantidad === 'una') { esp.tipo = 'sueltas'; esp.sueltas.n = 1; esp.sueltas.disp = 'linea'; }
  if (E.tecnologia === 'led') esp.paredes.suelo = false; // el suelo LED necesita cabinets de suelo específicos
  const dist = distanciaPublico(esp);
  if (E.tecnologia === 'led') {
    const lista = listaLed();
    const modelo = (E.led.crm && lista.find(m => m.crm === E.led.crm)) || elegirModelo(lista, dist);
    if (!modelo) return { esp, dist, filas: [], modelo: null, lista };
    const grosor = (modelo.thick || 80) / 1000;
    const sups = superficies(esp, grosor);
    const puertas = puertasDe(esp);
    const filas = sups.map(s => ({ s, r: aplicarPuertas(calcularLed(s, modelo, E.led.ajuste), s, modelo, puertas.filter(p => p.pared === s.id)), nombre: nombreSup(s), grosor }));
    const c = { esp, dist, modelo, lista, filas, tot: totales(filas) };
    c.elec = electronica(c); return c;
  }
  const sups = superficies(esp, 0);
  const opc = { solapeMin: E.proy.solape / 100, oos: !!E.proy.oos };
  // v8.0 · distancia fija (torres al otro lado de la calle, truss…), orientación (horizontal / vertical) y montaje con su altura
  const fijaDist = Math.max(0, Number(E.proy.dist) || 0);
  // v8.2 · tipo de proyección: mapping (fachada a distancia), pared (auditorio o pared normal) o sala inmersiva
  const tipoP = tipoProy();
  // sin distancia fijada, el proyector va donde suele ir: en mapping, lejos (unas 2 veces el ancho de la imagen); en pared, a la distancia del público
  const tiroPared = tipoP === 'pared' && !fijaDist ? Math.max(1, dist) : 0;
  const optPared = { ...opc, dist: fijaDist, orient: E.proy.orient || 'auto', trObjetivo: tipoP === 'mapping' && !fijaDist ? TR_MAPPING : 0, tiroObjetivo: tiroPared };
  // alcance: en sala, la pared de enfrente; en pared, el público y un poco más; en mapping o con la distancia fijada, sin límite
  const alcanceDe = (s) => (tipoP === 'mapping' || (fijaDist > 0 && esp.tipo !== 'sala') ? null : alcance(esp, s, dist));
  // preferencia según el tipo, en «proyectores» (a igual número de equipos): en mapping, los más luminosos y, sin distancia, nada de
  // ópticas cortas y la relación cerca de 2:1 (el proyector lejos, en torre); en pared, la óptica que llega a la distancia del público
  // y mejor no ultracorta; en sala, la que quepa
  const desvTR = (q, r) => (r < q.trMin ? Math.log(q.trMin / r) : r > q.trMax ? Math.log(r / q.trMax) : 0);
  const pared1 = sups.find(s => s.tipo !== 'suelo'), trPared = tiroPared && pared1 ? tiroPared / pared1.ancho : 0;
  const pref = (q) => (tipoP === 'mapping' ? (!fijaDist ? ((q.ust || q.trMax < 1) ? 80 : 0) + desvTR(q, TR_MAPPING) * 0.3 : 0) - q.lumens / 20000
    : tipoP === 'pared' ? (q.ust ? 0.5 : 0) + (trPared ? desvTR(q, trPared) * 0.3 : 0) : 0);
  const coloc = { montaje: E.proy.montaje || 'auto', altura: Math.max(0, Number(E.proy.altura) || 0) };
  const altoEsc = esp.tipo === 'sala' ? esp.alto : Math.max(3, ...sups.map(s => s.elev + s.alto)) + 0.8;
  const obs = obstaculosDe(esp), haySuelo = sups.some(s => s.tipo === 'suelo');
  // un mismo modelo para todas las paredes; el suelo puede llevar el mismo u otro
  const montar = (pP, pS) => {
    const filas = sups.map(s => s.tipo === 'suelo'
      ? { s, p: calcularSuelo(s, pS, { altoSala: esp.alto, ...opc }), proyector: pS, nombre: nombreSup(s) }
      : { s, p: calcularPared(s, pP, { alcance: alcanceDe(s), ...optPared }), proyector: pP, nombre: nombreSup(s) });
    const S = analizarSombras(filas, esp, altoEsc, coloc); S.obst = obstaculosEnHaces(obs, S.haces);
    return { filas, S, coste: costeInstalacion(filas, S) + pref(pP) * 100 };
  };
  // AUTO: la instalación limpia (sin chasis que choquen ni proyectores dentro de otros haces) con menos equipos y más brillo.
  // Con el catálogo completo (cuerpos × ópticas), primero se puntúa cada combinación con el cálculo rápido de las paredes
  // y solo las mejores pasan por la colocación completa con sombras y choques
  const rapido = (q) => { let k = pref(q) * 1000; sups.forEach(s => { if (s.tipo === 'suelo') return; const r = calcularPared(s, q, { alcance: alcanceDe(s), ...optPared });
    k += (r.fuera ? 1e7 : 0) + (r.noCubre ? 4e6 : 0) + (r.limite ? 2e6 : 0) + r.n * 1000 + (r.recorte + r.recorteX) * 300 - Math.min(r.nits, 250) * 0.5; }); return k; };
  const supS = sups.find(s => s.tipo === 'suelo');
  const rapidoS = (q) => { const r = calcularSuelo(supS, q, { altoSala: esp.alto, ...opc }); return r.n * 1000 - Math.min(r.nits, 250) * 0.5; };
  const mejores = (lista, k = 10, fc = rapido) => lista.length <= k ? lista : lista.map(q => ({ q, c: fc(q) })).sort((a, b) => a.c - b.c).slice(0, k).map(x => x.q);
  const mejorDe = (lista, fn) => lista.map(q => ({ q, r: fn(q) })).sort((x, y) => x.r.coste - y.r.coste)[0];
  const cand = PROYECTORES.filter(q => (!E.proy.cuerpo || q.modelo === E.proy.cuerpo) && (!E.proy.optica || q.optica === E.proy.optica));
  const lista = cand.length ? cand : PROYECTORES;
  const fijo = lista.length === 1 ? lista[0] : null, fijoS = E.proy.idSuelo && PROYECTORES.find(p => p.id === E.proy.idSuelo);
  let proyector, prSuelo, inst, auto = null;
  if (fijo) { proyector = fijo; }
  else { const m = mejorDe(mejores(lista), q => montar(q, fijoS || q)); proyector = m.q; }
  if (fijoS) prSuelo = fijoS;
  else if (haySuelo) prSuelo = mejorDe(mejores(PROYECTORES, 8, rapidoS), q => montar(proyector, q)).q;
  else prSuelo = proyector;
  inst = montar(proyector, prSuelo);
  // con un modelo elegido a mano que no deja una instalación limpia, se propone el de AUTO
  if (fijo && (inst.S.conflictos.length || inst.S.choques.length)) { const m = mejorDe(mejores(PROYECTORES), q => montar(q, fijoS || q)); if (m.q !== fijo && !m.r.S.conflictos.length && !m.r.S.choques.length) auto = m.q; }
  const filas = inst.filas;
  const tot = { n: 0, lumenes: 0, nitsMin: Infinity, lienzoW: 0, lienzoH: 0 };
  filas.forEach(f => { tot.n += f.p.n; tot.lumenes += f.p.n * f.proyector.lumens; tot.nitsMin = Math.min(tot.nitsMin, f.p.nits); if (f.s.tipo !== 'suelo') { tot.lienzoW += f.p.resW; tot.lienzoH = Math.max(tot.lienzoH, f.p.resH); } });
  // brillo: iluminancia = lúmenes / superficie de la imagen; luminancia = iluminancia × ganancia / π;
  // contraste real = (iluminancia + luz de la sala) / luz de la sala (mismas fórmulas que el calculador de Epson)
  const lx = Math.max(1, Number(E.proy.lux) || 140), gan = Math.max(0.1, Number(E.proy.ganancia) || 1);
  filas.forEach(f => { const q = f.p; q.nits = q.lux * gan / Math.PI; q.contraste = (q.lux + lx) / lx; });
  tot.nitsMin = Math.min(...filas.map(f => f.p.nits)); tot.contrasteMin = Math.min(...filas.map(f => f.p.contraste));
  // posición final de cada proyector (tras resolver choques): distancia óptica–pared, alturas y lens shift
  filas.forEach(f => { if (f.s.tipo === 'suelo') return;
    const hs = inst.S.haces.filter(h => h.fila === f); if (!hs.length) return;
    const q = f.p, sh = (x) => (x.lente.y - (x.y0 + x.y1) / 2) / q.imgH * 100;
    // con varias filas: el desplazamiento mayor, la lente más baja y la imagen conjunta
    const h = hs.reduce((a, x) => (Math.abs(sh(x)) > Math.abs(sh(a)) ? x : a), hs[0]);
    const altoCh = (x) => (x.vert ? x.prod.chasis[0] : x.prod.chasis[2]);
    const bajo = hs.reduce((a, x) => (x.lente.y < a.lente.y ? x : a), hs[0]), alto = hs.reduce((a, x) => (x.lente.y > a.lente.y ? x : a), hs[0]);
    f.pos = { dist: Math.max(...hs.map(x => x.zL)), yLente: Math.min(...hs.map(x => x.lente.y)), y0: Math.min(...hs.map(x => x.y0)), y1: Math.max(...hs.map(x => x.y1)), techo: esp.tipo === 'sala' ? esp.alto : (esp.sueltas.techo || 0),
      shiftV: sh(h), diag: Math.hypot(q.imgW, q.imgH) / 0.0254,
      apoyo: !!bajo.apoyo, altura: bajo.apoyo ? bajo.lente.y - altoCh(bajo) / 2 : alto.lente.y + altoCh(alto) / 2 + 0.05 }; });
  const c = { esp, dist, proyector, prSuelo, filas, tot, autoPropone: auto, lx, gan, tipoP };
  c.sombras = inst.S;
  c.elec = electronica(c); return c;
}
// coste de una instalación de proyección: primero que quepa, luego que no haya sombras de equipos ni choques, luego menos proyectores y más brillo
function costeInstalacion(filas, S) {
  let n = 0, fuera = 0, limite = 0, nits = Infinity;
  filas.forEach(f => { n += f.p.n; if (f.p.fuera) fuera++; if (f.p.limite) limite++; nits = Math.min(nits, f.p.nits); });
  const zona = S.zona && S.zona.ok ? S.zona.ancho * S.zona.fondo : 0;
  return fuera * 1e7 + (S.conflictos.length + S.choques.length) * 1e5 + (S.obst ? S.obst.length : 0) * 1e4 + limite * 2000 + n * 100 - Math.min(nits, 250) - zona * 2;
}
// puertas (solo en sala, en paredes) y obstáculos del espacio
const puertasDe = (esp) => (esp.tipo === 'sala' ? (esp.obst || []).filter(o => o.tipo === 'puerta') : []);
const obstaculosDe = (esp) => (esp.obst || []).filter(o => o.tipo === 'obstaculo').map(o => obstaculoMundo(o, esp));
// Electrónica de control (LED) y mediaserver (LED y proyección) con el motor común (comun/electronica.js)
function electronica(c) {
  const e = E.elec, out = { procesadores: [], proc: null, medias: [], media: null, need: 0 };
  if (E.tecnologia === 'led' && c.tot) {
    let L = 1; c.filas.forEach(f => { if (f.r) { f.lin = [L, L + f.r.lineas - 1]; L += f.r.lineas; } });
    const porSup = c.esp.tipo === 'sueltas' ? c.filas.map(f => (f.r ? f.r.lineas : 0)) : null;   // v7.9 · pantallas separadas: conversores por pantalla
    out.procesadores = ELEC.calcularElectronicas({ lines: c.tot.lineas, totalPix: c.tot.pix, porSup }, { backup: e.backup, escalador: e.escalador, conexion: e.conexion, entradas: 0 }, []);
    out.proc = out.procesadores.find(x => x.key === e.sel) || out.procesadores[0] || null;
    out.need = Math.max(1, c.tot.salidas4k);
  } else if (c.tot) out.need = Math.max(1, c.tot.n);
  if (e.marca !== 'ninguno' && out.need) {
    out.medias = ELEC.calcularMediaservers({ totalPix: out.need * ELEC.ELEC_PX_4K }, { marca: e.marca, dante: e.dante });
    out.media = out.medias.find(x => x.id === e.selMedia) || out.medias[0] || null;
  }
  return out;
}
// distancia disponible delante de cada pared para el proyector (la pared opuesta, con 0,3 m de margen)
function alcance(esp, s, dist) {
  if (esp.tipo !== 'sala') return Math.max(1, dist + 3);
  return (s.id === 'frontal' || s.id === 'trasera' ? esp.fondo : esp.ancho) - 0.3;
}

// ---------- plantilla ----------
const tog = (on, attrs, txt, extra = '') => `<button type="button" class="tog${on ? ' on' : ''}" aria-pressed="${on}" ${attrs} ${extra}>${txt}</button>`;
// casilla numérica: se escribe directamente o se cambia con ▲▼ (como en el cálculo de una pantalla); mantener pulsado repite y acelera
const FLECHA = (d) => `<svg viewBox="0 0 10 6" aria-hidden="true"><path d="${d > 0 ? 'M5 .5 9.5 5.5H.5z' : 'M.5 .5h9L5 5.5z'}" fill="currentColor"/></svg>`;
const numIn = (k, val, uni, paso = 0.1, min = 0, max = 60) => `<div class="num"><input type="number" inputmode="decimal" data-num="${k}" value="${val}" step="${paso}" min="${min}" max="${max}"><span>${uni}</span><div class="flechas">` +
  `<button type="button" class="flecha" data-flecha="1" data-k="${k}" tabindex="-1" aria-label="${t('subirV')}">${FLECHA(1)}</button><button type="button" class="flecha" data-flecha="-1" data-k="${k}" tabindex="-1" aria-label="${t('bajarV')}">${FLECHA(-1)}</button></div></div>`;
const campo = (lab, html) => `<div class="campo"><label>${lab}</label>${html}</div>`;

// ---------- fichas de equipo (componente común comun/ficha.js) ----------
// los textos del motor común de electrónica están en castellano: aquí se pasan a inglés o catalán
const MOTOR = {
  en: [[/conv\. por pantalla/g, 'conv. per screen'], [/Chasis \(mainframe\)/g, 'Chassis (mainframe)'], [/Tarjeta de salida/g, 'Output card'], [/Tarjeta salida/g, 'Output card'], [/Tarjeta de entrada/g, 'Input card'], [/Tarjeta entrada/g, 'Input card'], [/Tarjeta base/g, 'Base card'],
    [/de previo \/ monitorización \(recomendada\)/g, 'preview / monitoring (recommended)'], [/\(mínima del equipo\)/g, '(minimum for the unit)'], [/Conv\. fibra→10 RJ45 multimodo \(incluye sus módulos SFP\+\)/g, 'Fibre→10 RJ45 multimode converter (SFP+ modules included)'],
    [/Conv\. fibra→10 RJ45 \(pantalla\)/g, 'Fibre→10 RJ45 converter (screen)'], [/Módulo SFP\+ 10G multimodo \(puertos de la tarjeta de salida\)/g, '10G SFP+ multimode module (output card ports)'], [/serie MX/g, 'MX series'], [/multimodo/g, 'multimode'],
    [/no disponible en este chasis: verificar con el fabricante/g, 'not available for this chassis: check with the manufacturer'], [/líneas?/g, m => m === 'línea' ? 'line' : 'lines'], [/fibras?/g, m => m === 'fibra' ? 'fibre' : 'fibres'], [/\(de /g, '(of '], [/proyecto/g, 'project'],
    [/salidas?/g, m => m === 'salida' ? 'output' : 'outputs'], [/entradas?/g, m => m === 'entrada' ? 'input' : 'inputs'], [/capas?/g, m => m === 'capa' ? 'layer' : 'layers'], [/hasta/g, 'up to'], [/ o /g, ' or '], [/ y /g, ' and '], [/Como /g, 'Like '],
    [/sincronismo, cascada y backup entre equipos/g, 'sync, cascade and backup between units'], [/backup de equipo/g, 'unit backup'], [/ranura/g, 'slot'], [/con escalador/g, 'with scaler']],
  ca: [[/conv\. por pantalla/g, 'conv. per pantalla'], [/fibras/g, 'fibres'], [/Chasis \(mainframe\)/g, 'Xassís (mainframe)'], [/Tarjeta de salida/g, 'Targeta de sortida'], [/Tarjeta salida/g, 'Targeta sortida'], [/Tarjeta de entrada/g, "Targeta d'entrada"], [/Tarjeta entrada/g, 'Targeta entrada'], [/Tarjeta base/g, 'Targeta base'],
    [/de previo \/ monitorización \(recomendada\)/g, 'de previ / monitoratge (recomanada)'], [/\(mínima del equipo\)/g, "(mínima de l'equip)"], [/Conv\. fibra→10 RJ45 multimodo \(incluye sus módulos SFP\+\)/g, 'Conv. fibra→10 RJ45 multimode (inclou els mòduls SFP+)'],
    [/Conv\. fibra→10 RJ45 \(pantalla\)/g, 'Conv. fibra→10 RJ45 (pantalla)'], [/Módulo SFP\+ 10G multimodo \(puertos de la tarjeta de salida\)/g, 'Mòdul SFP+ 10G multimode (ports de la targeta de sortida)'], [/multimodo/g, 'multimode'],
    [/no disponible en este chasis: verificar con el fabricante/g, 'no disponible en aquest xassís: verificar amb el fabricant'], [/líneas?/g, m => m === 'línea' ? 'línia' : 'línies'], [/proyecto/g, 'projecte'],
    [/salidas?/g, m => m === 'salida' ? 'sortida' : 'sortides'], [/entradas?/g, m => m === 'entrada' ? 'entrada' : 'entrades'], [/capas?/g, m => m === 'capa' ? 'capa' : 'capes'], [/hasta/g, 'fins a'], [/ y /g, ' i '], [/Como /g, 'Com '],
    [/sincronismo, cascada y backup entre equipos/g, 'sincronisme, cascada i backup entre equips'], [/backup de equipo/g, "backup d'equip"], [/ranura/g, 'ranura'], [/con escalador/g, 'amb escalador']]
};
const trMotor = (txt) => { let r = String(txt || ''); (MOTOR[idioma()] || []).forEach(([a, b]) => { r = r.replace(a, b); }); return r; };
function fichaCab(m) {
  return fichaHTML({ cat: t('fCab'), icono: 'led', marca: m.family || '', modelo: m.crm, foto: m.urlFoto, fotoTrasera: m.urlFotoTrasera || m.urlTrasera || m.urlFoto2, vistas: m.fotos, acento: '#b566ff', stock: enStock(m),
    specs: [[t('kPitch'), m.pitch + ' mm'], [t('kCab'), `${m.cabAncho}×${m.cabAlto}${m.thick ? '×' + m.thick : ''} mm`], [t('kPx'), `${m.cabPixAncho}×${m.cabPixAlto}`], [t('kNits'), m.nits ? m.nits + ' nits' : ''], [t('kHz'), m.hz ? m.hz + ' Hz' : ''],
      [t('kKg'), m.cabKg ? fmt(m.cabKg, 1) + ' kg' : ''], [t('kW'), m.wMax ? fmt(m.wMax, 0) + ' W' : ''], [t('kCard'), m.card || ''], [t('kTech'), m.tech || '']],
    enlace: m.crm ? 'https://traulux.net/buscar/?q=' + encodeURIComponent(m.crm) : '', enlaceTxt: t('fichaFab') });
}
// Epson: manual y especificaciones en setupnavi (referencia absoluta) y calculador oficial para verificar
const epsonManual = (q) => `https://support.epson.net/setupnavi/?MKN=${encodeURIComponent(q.modelo)}&PINF=support&LG2=${({ es: 'ES', en: 'EN', ca: 'CA' })[idioma()] || 'ES'}&OSC=MI`;
const EPSON_CALC = 'https://support.epson-europe.com/TDS/#/page/advanceMode';
const ADMIN_URL = 'https://script.google.com/macros/s/AKfycbwkc12y4LODbFe-kQidnR2MbbA6cbW1WbhU3UiqmDmshx-ncAdGYrFRy8PNjm9Wg6Mx3w/exec';
// relación de proyección de una combinación cuerpo + óptica («0,35:1» o «1,57–2,56:1»)
const trTxt = (q) => (q.trMin === q.trMax ? fmt(q.trMin, 2) : fmt(q.trMin, 2) + '–' + fmt(q.trMax, 2)) + ':1';
function fichaProy(q, cat) {
  return fichaHTML({ cat, icono: 'proy', marca: q.marca, modelo: q.nombre, claveFoto: q.modelo, foto: q.imagen, fotoTrasera: q.trasera, acento: '#00b4ff',
    enlaces: q.marca === 'EPSON' ? [[epsonManual(q), t('epsonManual')], [EPSON_CALC, t('epsonCalc')]] : [],
    specs: [[t('kTR'), trTxt(q)], [t('kLm'), fmtPx(q.lumens) + ' lm'], [t('kFmt'), q.arTxt], [t('kRes'), q.resX + '×' + q.resY], [t('kDiag'), q.maxDiagPulg + '"'], [t('k4k'), q.k4nativo ? '4K' : q.k4 ? 'Enhancement' : '—'],
      [t('kShift'), q.shiftV ? `${q.shiftSube ? '+' : '±'}${q.shiftV} % / ±${q.shiftH} %` : '']] });
}
function fichaProc(x) {
  return fichaHTML({ cat: t('procesador'), icono: 'elec', marca: x.marca, modelo: x.modelo, foto: x.front, fotoTrasera: x.back, acento: '#00ff04', stock: x.enStock ? true : null,
    specs: [[t('puertos'), trMotor(x.puertos)], [t('capacidad'), trMotor(x.capacidad)], [t('kEsc'), x.escalador ? t('si') : t('no')]],
    piezas: (x.equipos || []).map(q => ({ cant: q.cant, ref: q.ref, desc: trMotor(q.desc) })), enlace: x.url, enlaceTxt: t('fichaFab') });
}
function fichaMedia(m, need, led) {
  return fichaHTML({ cat: t('mediaserver'), icono: 'media', marca: m.marca, modelo: m.modelo, foto: m.front, fotoTrasera: m.back, acento: '#ffb000',
    specs: [[t('salidas4kK'), m.out4k], [t('necesita'), need], [t('dante'), m.dante ? t('si') : t('no')]], notas: [trMotor(m.resumen), led ? t('mediaNotaLed') : t('mediaNotaProy')], enlace: m.url, enlaceTxt: t('fichaFab') });
}

function modEspacio() {
  const e = E.esp, s = e.sueltas, sala = e.tipo === 'sala' && E.cantidad === 'varias';
  let h = `<section class="mod"><div class="mod-tit">${ICO.espacio}${t('espacio')}<button type="button" class="sec-btn reset" data-accion="reset-esp">${t('restablecer')}</button></div>`;
  if (E.cantidad === 'varias') h += `<div class="fila c2">${tog(e.tipo === 'sala', 'data-set="esp.tipo" data-v="sala"', t('sala'))}${tog(e.tipo === 'sueltas', 'data-set="esp.tipo" data-v="sueltas"', t('pantallas'))}</div>`;
  if (sala) {
    h += `<div class="fila c3">${campo(t('ancho'), numIn('esp.ancho', e.ancho, 'm', 0.1, 1, 60))}${campo(t('fondo'), numIn('esp.fondo', e.fondo, 'm', 0.1, 1, 60))}${campo(t('alto'), numIn('esp.alto', e.alto, 'm', 0.1, 1.5, 20))}</div>`;
    const tp = (k) => tog(e.paredes[k], `data-pared="${k}"`, t(k), E.tecnologia === 'led' && k === 'suelo' ? `disabled title="${t('sueloLed')}"` : '');
    h += `<div class="etq">${t('superficies')}</div><div class="fila c3">${['frontal', 'izquierda', 'derecha'].map(tp).join('')}</div><div class="fila c2">${['trasera', 'suelo'].map(tp).join('')}</div>`;
    if (E.tecnologia === 'led') h += `<p class="ayuda">${t('sueloLed')}</p>`;
    h += `<div class="fila c2">${campo(t('altoPant'), numIn('esp.altoCubierto', e.altoCubierto, 'm', 0.1, 0, 20))}${campo(t('elev'), numIn('esp.elev', e.elev, 'm', 0.1, 0, 10))}</div><p class="ayuda">${t('altoAyuda')}</p>`;
    if (ajuste.esp) h += `<p class="aviso">${ajuste.esp}</p>`;
  } else {
    if (E.cantidad === 'varias') h += `<div class="fila c2">${campo(t('num'), numIn('esp.sueltas.n', s.n, 'u', 1, 2, 8))}<div class="campo"><label>${t('disp')}</label><div class="fila c2">${tog(s.disp === 'linea', 'data-set="esp.sueltas.disp" data-v="linea"', t('linea'))}${tog(s.disp === 'arco', 'data-set="esp.sueltas.disp" data-v="arco"', t('arco'))}</div></div></div>`;
    // v7.9 · auditorio: pantalla central de otra medida que las laterales (desde 3 pantallas)
    const cen = E.cantidad === 'varias' && s.n >= 3;
    if (cen) h += `<div class="fila c2">${tog(!s.central, 'data-set="esp.sueltas.central" data-v="0" data-bool="1"', t('mismaMedida'))}${tog(!!s.central, 'data-set="esp.sueltas.central" data-v="1" data-bool="1"', t('centralDistinta'))}</div>`;
    // con la central distinta, cada medida va en su fila de 2 (en catalán «AMPLADA CENTRAL» no cabía en un tercio del panel)
    // y la elevación pasa junto a la separación o la distancia; la distancia del público nunca va en un tercio
    const elevF = campo(t('elev'), numIn('esp.sueltas.elev', s.elev, 'm', 0.1, 0, 10));
    const sepF = campo(t('sep'), numIn('esp.sueltas.sep', s.sep, 'm', 0.05, 0, 10)), angF = campo(t('angulo'), numIn('esp.sueltas.angulo', s.angulo, '°', 1, 0, 90)), distF = campo(t('dist'), numIn('esp.sueltas.dist', s.dist, 'm', 0.1, 0.5, 100));
    if (cen && s.central) {
      h += `<div class="fila c2">${campo(t('anchoCentral'), numIn('esp.sueltas.cAncho', s.cAncho, 'm', 0.1, 0.3, 40))}${campo(t('altoCentral'), numIn('esp.sueltas.cAlto', s.cAlto, 'm', 0.1, 0.3, 20))}</div>`;
      h += `<div class="fila c2">${campo(t('anchoLat'), numIn('esp.sueltas.ancho', s.ancho, 'm', 0.1, 0.3, 40))}${campo(t('altoLat'), numIn('esp.sueltas.alto', s.alto, 'm', 0.1, 0.3, 20))}</div><p class="ayuda">${t('centralAyuda')}</p>`;
      h += s.disp === 'arco' ? `<div class="fila c2">${sepF}${angF}</div><div class="fila c2">${elevF}${distF}</div>` : `<div class="fila c2">${sepF}${elevF}</div><div class="fila c1">${distF}</div>`;
    } else {
      h += `<div class="fila c3">${campo(t('ancho'), numIn('esp.sueltas.ancho', s.ancho, 'm', 0.1, 0.3, 40))}${campo(t('alto'), numIn('esp.sueltas.alto', s.alto, 'm', 0.1, 0.3, 20))}${elevF}</div>`;
      if (E.cantidad !== 'varias') h += `<div class="fila c1">${distF}</div>`;
      else if (s.disp === 'arco') h += `<div class="fila c2">${sepF}${angF}</div><div class="fila c1">${distF}</div>`;
      else h += `<div class="fila c2">${sepF}${distF}</div>`;
    }
    if (E.tecnologia === 'proy') h += `<div class="fila c1">${campo(t('techoAlto'), numIn('esp.sueltas.techo', s.techo, 'm', 0.1, 0, 30))}</div><p class="ayuda">${t('techoAyuda')}</p>`;
  }
  h += bloqueObst(sala);
  return h + '</section>';
}
// puertas y obstáculos: cada uno en una fila con sus medidas y un botón para quitarlo
function bloqueObst(sala) {
  const e = E.esp, L = e.obst || [];
  let h = `<div class="etq">${t('obstTit')}</div><div class="fila ${sala ? 'c2' : 'c1'}">${sala ? `<button type="button" class="sec-btn" data-accion="obst-add" data-tipo="puerta">＋ ${t('puerta')}</button>` : ''}<button type="button" class="sec-btn" data-accion="obst-add" data-tipo="obstaculo">＋ ${t('obst')}</button></div>`;
  if (ajuste.obst) h += `<p class="aviso">${ajuste.obst}</p>`;
  L.forEach((o, i) => {
    if (o.tipo === 'puerta' && !sala) return;
    const k = 'esp.obst.' + i;
    h += `<div class="obst"><div class="obst-cab"><b>${o.tipo === 'puerta' ? t('puerta') : t('obst')} ${L.slice(0, i + 1).filter(x => x.tipo === o.tipo).length}</b>${o.tipo === 'puerta' ? `<select class="sel" data-sel="${k}.pared">${['frontal', 'izquierda', 'derecha', 'trasera'].map(w => `<option value="${w}"${o.pared === w ? ' selected' : ''}>${t(w)}</option>`).join('')}</select>` : '<span></span>'}<button type="button" class="sec-btn quitar" data-accion="obst-del" data-i="${i}" aria-label="${t('quitar')}" title="${t('quitar')}">✕</button></div>`;
    h += o.tipo === 'puerta'
      ? `<div class="fila c3">${campo(t('desdeIzq'), numIn(k + '.x', o.x, 'm', 0.1, 0, 60))}${campo(t('ancho'), numIn(k + '.ancho', o.ancho, 'm', 0.1, 0.5, 20))}${campo(t('alto'), numIn(k + '.alto', o.alto, 'm', 0.1, 1, 10))}</div>`
      : `<div class="fila c2">${campo(sala ? t('aIzq') : t('desp'), numIn(k + '.x', o.x, 'm', 0.1, sala ? 0 : -60, 60))}${campo(sala ? t('aFrontal') : t('delante'), numIn(k + '.z', o.z, 'm', 0.1, 0, 60))}</div><div class="fila c3">${campo(t('ancho'), numIn(k + '.ancho', o.ancho, 'm', 0.1, 0.1, 20))}${campo(t('fondo'), numIn(k + '.fondo', o.fondo, 'm', 0.1, 0.1, 20))}${campo(t('alto'), numIn(k + '.alto', o.alto, 'm', 0.1, 0.1, 20))}</div>`;
    h += '</div>';
  });
  return h;
}
function modLed(c) {
  const l = E.led, lista = c.lista || [];
  const opts = lista.map(m => `<option value="${m.crm}"${m.crm === l.crm ? ' selected' : ''}>[${m.pitch}p] ${m.crm}${enStock(m) ? ' · STOCK' : ''}</option>`).join('');
  let h = `<section class="mod"><div class="mod-tit">${ICO.led}${t('ledMod')}<button type="button" class="sec-btn reset" data-accion="reset-led">${t('restablecer')}</button></div>`;
  h += `<div class="fila c2">${tog(l.clase === 'INSTALL', 'data-set="led.clase" data-v="INSTALL"', 'INSTALL')}${tog(l.clase === 'RENTAL', 'data-set="led.clase" data-v="RENTAL"', 'RENTAL')}</div>`;
  h += `<div class="fila c2">${tog(l.tipo === 'INDOOR', 'data-set="led.tipo" data-v="INDOOR"', 'INDOOR')}${tog(l.tipo === 'OUTDOOR', 'data-set="led.tipo" data-v="OUTDOOR"', 'OUTDOOR')}</div>`;
  if (estadoCat === 'cargando' && !catalogo.length) h += `<p class="ayuda">${t('cargando')}</p>`;
  else if (!catalogo.length) h += `<p class="aviso">${t('sinCat')}</p>`;
  h += campo(t('modelo'), `<select class="sel" data-sel="led.crm"><option value="">${t('auto')}${c.modelo && !l.crm ? ' · [' + c.modelo.pitch + 'p] ' + c.modelo.crm : ''}</option>${opts}</select>`);
  if (c.modelo) h += fichaCab(c.modelo);
  h += `<p class="ayuda">${t('autoAyudaLed', { d: fmt(c.dist, 1) })}</p>`;
  h += `<div class="etq">${t('ajuste')}</div><div class="fila c2">${tog(l.ajuste === 'dentro', 'data-set="led.ajuste" data-v="dentro"', t('dentro'))}${tog(l.ajuste === 'cercano', 'data-set="led.ajuste" data-v="cercano"', t('cercano'))}</div><p class="ayuda">${t('ajusteAyuda')}</p>`;
  return h + '</section>';
}
function modProy(c) {
  const p = E.proy, sel = c.proyector, haySuelo = c.filas.some(f => f.s.tipo === 'suelo'), paredes = c.filas.filter(f => f.s.tipo !== 'suelo');
  const opt = (idSel) => PROYECTORES.map(q => `<option value="${q.id}"${q.id === idSel ? ' selected' : ''}>${q.nombre} · ${fmtPx(q.lumens)} lm</option>`).join('');
  const tp = tipoProy(), pared = paredes[0], pos = pared && pared.pos, r2 = (v) => Math.round(v * 100) / 100;
  let h = `<section class="mod"><div class="mod-tit">${ICO.proy}${t('proyMod')}<button type="button" class="sec-btn reset" data-accion="reset-proy">${t('restablecer')}</button></div>`;
  // v8.2 · 1) tipo de proyección: AUTO decide según el tipo
  h += `<div class="campo"><label>${t('tipoProy')}</label><div class="fila c3">${['mapping', 'pared', 'sala'].map(v => tog(tp === v, `data-accion="tipo-proy" data-v="${v}"`, t('tp_' + v))).join('')}</div></div><p class="ayuda">${t('tpAyuda_' + tp)}</p>`;
  // 2) proyector (cuerpo) y después su óptica, solo entre las compatibles (guía de ópticas de Epson)
  h += campo(t('proyector'), `<select class="sel" data-sel="proy.cuerpo"><option value="">${t('auto')}${!p.cuerpo && sel ? ' · ' + sel.nombre : ''}</option>${CUERPOS.map(q => `<option value="${q.modelo}"${q.modelo === p.cuerpo ? ' selected' : ''}>${q.modelo} · ${fmtPx(q.lumens)} lm</option>`).join('')}</select>`);
  const lentes = p.cuerpo ? PROYECTORES.filter(q => q.modelo === p.cuerpo && q.optica) : [];
  if (lentes.length) h += campo(t('optica'), `<select class="sel" data-sel="proy.optica"><option value="">${t('auto')}${!p.optica && sel && sel.optica ? ' · ' + sel.optica : ''}</option>${lentes.map(q => `<option value="${q.optica}"${q.optica === p.optica ? ' selected' : ''}>${q.optica} · ${trTxt(q)}${q.ust ? ' · UST' : ''}</option>`).join('')}</select>`);
  if (haySuelo) h += campo(t('proySuelo'), `<select class="sel" data-sel="proy.idSuelo"><option value="">= ${t('proyector')}</option>${opt(p.idSuelo)}</select>`);
  // 3) posición del proyector: orientación, montaje y altura (🔒), distancia (🔒) con el rango del zoom
  h += `<div class="etq">${t('posProy')}</div><div class="campo"><label>${t('orientacion')}</label><div class="fila c3">${['auto', 'horizontal', 'vertical'].map(v => tog((p.orient || 'auto') === v, `data-set="proy.orient" data-v="${v}"`, t('or_' + v))).join('')}</div></div>`;
  if (paredes.some(f => f.p.vert)) h += `<p class="ayuda">${t('enVertical')}</p>`;
  h += `<div class="campo"><label>${t('montaje')}</label><div class="fila c3">${['auto', 'colgado', 'apoyado'].map(v => tog((p.montaje || 'auto') === v, `data-set="proy.montaje" data-v="${v}"`, t('mo_' + v))).join('')}</div></div>`;
  const altFija = Number(p.altura) > 0, apoyo = p.montaje === 'auto' ? !!(pos && pos.apoyo) : p.montaje === 'apoyado';
  const altVal = altFija ? p.altura : (pos ? r2(pos.altura) : 0);
  h += campoLock(t(apoyo ? 'alturaApoyo' : 'alturaColgado'), 'alt', altFija, numIn('proy.altura', altVal, 'm', 0.1, 0, 200), pos || altFija);
  h += `<p class="ayuda">${t(altFija ? 'alturaFijaAyuda' : apoyo ? 'alturaApoyoAyuda' : 'alturaColgadoAyuda')}</p>`;
  const distFija = Number(p.dist) > 0, distVal = distFija ? Number(p.dist) : (pos ? r2(pos.dist) : 0);
  h += campoLock(t(tp === 'mapping' ? 'distFachada' : 'distOptica'), 'dist', distFija, numIn('proy.dist', distVal, 'm', 0.1, 0, 200), pos || distFija);
  if (pared) {
    const a = pared.p.tMin, b = pared.p.tMaxZ;
    if (b - a > 0.02) h += `<div class="rango"><input type="range" data-rango="proy.dist" min="${r2(a)}" max="${r2(b)}" step="0.01" value="${r2(Math.min(b, Math.max(a, distVal)))}" aria-label="${t('rangoZoom')}"><div class="rango-et"><span>${fmt(a, 2)} m</span><span>${t('rangoZoom')}</span><span>${fmt(b, 2)} m</span></div></div>`;
    h += `<p class="ayuda">${distFija ? t('distFija', { d: fmt(p.dist, 1), w: fmt(pared.p.imgW, 2), h: fmt(pared.p.imgH, 2) }) : b - a > 0.02 ? t('distAyuda', { a: fmt(a, 2), b: fmt(b, 2) }) : t('distOpticaFija', { a: fmt(a, 2) })}${paredes.length > 1 ? ' ' + t('distVarias') : ''}</p>`;
  }
  if (c.filas.some(f => f.p.fueraZoom)) h += `<p class="aviso">${t(c.filas.some(f => f.p.noCubre) ? 'noCubre' : 'fueraZoom')}</p>`;
  // 4) blending
  h += `<div class="etq">${t('solape')}</div><div class="fila c3">${[15, 20, 25].map(v => tog(p.solape === v, `data-set="proy.solape" data-v="${v}" data-num-v="1"`, v + ' %')).join('')}</div>`;
  // 5) luz de la sala según el uso, y ganancia de la pantalla
  const uso = (USOS_LUZ.find(u => u[1] === Number(p.lux)) || [''])[0];
  h += campo(t('luzUso'), `<select class="sel" data-uso="1"><option value=""${uso ? '' : ' selected'}>${t('uso_personal')}</option>${USOS_LUZ.map(u => `<option value="${u[1]}"${u[0] === uso ? ' selected' : ''}>${t('uso_' + u[0])} · ${u[1]} lx</option>`).join('')}</select>`);
  h += `<div class="fila c2">${campo(t('luzSala'), numIn('proy.lux', p.lux, 'lx', 10, 0, 5000))}${campo(t('ganancia'), numIn('proy.ganancia', p.ganancia, '×', 0.1, 0.1, 5))}</div>`;
  // 6) avanzado: modo fuera de especificación (imágenes más grandes que las garantizadas), con aviso, cálculo y recomendación
  h += `<div class="etq">${t('avanzado')}</div><div class="fila c1">${tog(!!p.oos, 'data-accion="proy-oos"', '⚠ ' + t('oos'), 'title="' + t('oosTit') + '"')}</div>`;
  if (sel) {
    const med = (d) => { const w = d * 0.0254 * sel.ar / Math.sqrt(1 + sel.ar * sel.ar); return fmt(w, 1) + ' × ' + fmt(w / sel.ar, 1); };
    const usada = Math.max(0, ...paredes.map(f => Math.hypot(f.p.imgW, f.p.imgH) / 0.0254));
    if (p.oos) {
      h += `<p class="aviso">${t('oosAviso')}</p>`;
      h += `<p class="ayuda">${sel.maxDiagPulgOOS > sel.maxDiagPulg ? t('oosCalc', { p: sel.nombre, g: fmtPx(sel.maxDiagPulg), gm: med(sel.maxDiagPulg), o: fmtPx(sel.maxDiagPulgOOS), om: med(sel.maxDiagPulgOOS) }) : t('oosNoGana', { p: sel.nombre, g: fmtPx(sel.maxDiagPulg) })}</p>`;
      if (usada > sel.maxDiagPulg + 0.5) h += `<p class="aviso">${t('oosUsa', { d: fmtPx(Math.round(usada)), g: fmtPx(sel.maxDiagPulg) })}</p>`;
      h += `<p class="ayuda">${t('oosReco')}</p>`;
    } else if (paredes.some(f => f.p.limite) && sel.maxDiagPulgOOS > sel.maxDiagPulg) h += `<p class="ayuda">${t('oosSugerir', { g: fmtPx(sel.maxDiagPulg), o: fmtPx(sel.maxDiagPulgOOS) })}</p>`;
  }
  // 7) fichas de los equipos elegidos y ayudas
  if (sel) h += fichaProy(sel, t('fProy'));
  if (haySuelo && c.prSuelo && c.prSuelo !== sel) h += fichaProy(c.prSuelo, t('fProySuelo'));
  h += `<p class="ayuda">${t('autoAyudaProy')}</p><p class="ayuda">${t('datosProy')}</p>`;
  return h + '</section>';
}
// v8.3 · el proyector arrastrado en las vistas técnicas (o el desplazamiento de la óptica) fija la distancia y la altura, con su candado
function fijarDesdeVistas(o, d) {
  if (o.dist != null) E.proy.dist = Math.round(o.dist * 100) / 100;
  if (o.yL != null) {
    const m = E.proy.montaje === 'auto' ? (d.apoyo ? 'apoyado' : 'colgado') : E.proy.montaje;
    const alt = m === 'apoyado' ? o.yL - d.altoCh / 2 : o.yL + (d.q.rows - 1) * d.paso + d.altoCh / 2 + 0.05;
    E.proy.montaje = m; E.proy.altura = Math.max(0.01, Math.round(alt * 100) / 100);
  }
  actualizar();
}
// v8.2 · casilla con candado: sin candado, enseña lo que calcula AUTO; con candado, el valor queda fijo y AUTO lo respeta
const CANDADO = (on) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/>${on ? '<path d="M8 11V7.5a4 4 0 018 0V11"/>' : '<path d="M8 11V7.5a4 4 0 017.6-1.7"/>'}</svg>`;
const campoLock = (lab, k, on, html, activo = true) => `<div class="campo"><div class="campo-cab"><span class="lab">${lab}<i class="${on ? 'fijo' : 'auto'}">${on ? t('fijo') : 'AUTO'}</i></span>` +
  `<button type="button" class="candado${on ? ' on' : ''}" data-accion="lock-${k}" aria-pressed="${on}" title="${t(on ? 'desbloquear' : 'bloquear')}" aria-label="${t(on ? 'desbloquear' : 'bloquear')}"${activo ? '' : ' disabled'}>${CANDADO(on)}</button></div>${html}</div>`;
function modElec(c) {
  const e = E.elec, led = E.tecnologia === 'led', x = c.elec || {};
  let h = `<section class="mod"><div class="mod-tit">${ICO.elec}${led ? t('elecMod') : t('mediaserver')}<button type="button" class="sec-btn reset" data-accion="reset-elec">${t('restablecer')}</button></div>`;
  if (led) {
    h += `<div class="fila c2">${tog(!e.backup, 'data-set="elec.backup" data-v="0" data-bool="1"', t('sinBackup'))}${tog(e.backup, 'data-set="elec.backup" data-v="1" data-bool="1"', t('conBackup'))}</div>`;
    h += `<div class="fila c2">${tog(e.escalador === 'con', 'data-set="elec.escalador" data-v="con"', t('escCon'))}${tog(e.escalador === 'sin', 'data-set="elec.escalador" data-v="sin"', t('escSin'))}</div>`;
    h += `<div class="fila c2">${tog(e.conexion === 'directo', 'data-set="elec.conexion" data-v="directo"', t('rj45'))}${tog(e.conexion === 'fibra', 'data-set="elec.conexion" data-v="fibra"', t('fibra'))}</div>`;
    if (c.tot) h += (x.procesadores || []).length ? campo(t('procesador'), `<select class="sel" data-sel="elec.sel">${x.procesadores.map(q => `<option value="${q.key}"${x.proc && q.key === x.proc.key ? ' selected' : ''}>${q.marca} ${q.modelo}</option>`).join('')}</select>`) : `<p class="aviso">${t('sinProc')}</p>`;
  }
  h += `<div class="etq">${t('mediaserver')}</div><div class="fila c2">${['todos', 'novastar'].map(k => tog(e.marca === k, `data-set="elec.marca" data-v="${k}"`, k === 'todos' ? t('mTodos') : 'NOVASTAR')).join('')}</div><div class="fila c2">${['pixelhue', 'ninguno'].map(k => tog(e.marca === k, `data-set="elec.marca" data-v="${k}"`, k === 'ninguno' ? t('mNinguno') : 'PIXELHUE')).join('')}</div>`;
  if (e.marca !== 'ninguno') {
    h += `<div class="fila c1">${tog(e.dante, 'data-accion="elec-dante"', t('dante'))}</div>`;
    h += (x.medias || []).length ? campo(t('mediaserver'), `<select class="sel" data-sel="elec.selMedia">${x.medias.map(m => `<option value="${m.id}"${x.media && m.id === x.media.id ? ' selected' : ''}>${m.marca} ${m.modelo} · ${m.out4k}× 4K</option>`).join('')}</select>`) : `<p class="aviso">${t('sinMedia')}</p>`;
  }
  return h + '</section>';
}
function modSuperficies(c) {
  let h = `<section class="mod"><div class="mod-tit">${ICO.sup}${t('superficies')}</div><div class="sup-lista">`;
  if (!c.filas.length) h += `<p class="ayuda">${sinFilas(c)}</p>`;
  c.filas.forEach(f => {
    const r = f.r, p = f.p;
    const linea = r ? `${fmt(r.ancho)} × ${fmt(r.alto)} m · ${r.cols}×${r.rows} · ${r.resW}×${r.resH}` : `${p.n} ${t('p')} · ${p.resW}×${p.resH} · ${fmt(p.nits, 0)} nits`;
    const av = p ? [p.fuera ? t('fuera') : '', p.limite ? t('limite') : '', p.solapeRel > SOLAPE_MAX ? t('solapeAlto') : '', p.recorte > 0.005 ? t('recorte') + ' ' + fmt(p.recorte * 100, 0) + ' %' : ''].filter(Boolean).join(' · ') : '';
    h += `<div class="sup"><b class="mono" style="color:var(--verde)">●</b><div class="sup-dat"><b>${f.nombre}</b><span>${linea}</span>${av ? `<span style="color:#ffc94d">${av}</span>` : ''}</div><span></span></div>`;
  });
  return h + '</div></section>';
}
// sin filas: o falta el catálogo LED (cargando / sin conexión) o no hay ninguna superficie activa
function sinFilas(c) { if (E.tecnologia === 'led' && !c.modelo) return estadoCat === 'cargando' ? t('cargando') : t('sinCat'); return t('nada'); }
function tarjeta(t1, v, uni, sub, ac) { return `<div class="tar" style="--ac:${ac}"><div class="t">${t1}</div><div class="v">${v}<small>${uni || ''}</small></div>${sub ? `<div class="s">${sub}</div>` : ''}</div>`; }
function vistaResultados(c) {
  if (!c.filas.length) return `<p class="ayuda">${sinFilas(c)}</p>`;
  let h = '';
  if (E.tecnologia === 'led' && c.tot) {
    const T = c.tot, m = c.modelo;
    h += `<div class="res-tot">
      ${tarjeta(t('cabinets'), fmtPx(T.cab), '', `${m.crm} · ${m.pitch} mm`, '#b566ff')}
      ${tarjeta(t('lienzo'), `${fmtPx(T.lienzoW)}×${fmtPx(T.lienzoH)}`, 'px', t('lienzoAyuda'), '#00b4ff')}
      ${tarjeta(t('peso'), fmt(T.peso, 0), 'kg', '', '#e100ff')}
      ${tarjeta(t('consumo'), fmt(T.kw, 1), 'kW', `${fmt(T.amp, 1)} A · 230 V`, '#ff4d5e')}
      ${tarjeta(t('lineas'), fmtPx(T.lineas), '', `+ ${fmtPx(T.lineas)} backup`, '#00ff04')}
      ${tarjeta(t('salidas'), fmtPx(T.salidas4k), '', 'mediaserver', '#ffb000')}
    </div>`;
    h += `<div class="tabla-caja"><table class="tabla"><thead><tr><th>${t('supCol')}</th><th>${t('medida')}</th><th>${t('cabCol')}</th><th>${t('resol')}</th><th>${t('pesoCol')}</th><th>${t('potCol')}</th><th>${t('linCol')}</th></tr></thead><tbody>
      ${c.filas.map(f => `<tr><td>${f.nombre}</td><td>${fmt(f.r.ancho)} × ${fmt(f.r.alto)} m</td><td>${f.r.cols}×${f.r.rows} = ${f.r.cab}${f.r.quitados ? ` <span class="tenue">(−${f.r.quitados})</span>` : ''}</td><td>${f.r.resW}×${f.r.resH}</td><td>${fmt(f.r.peso, 0)} kg</td><td>${fmt(f.r.kw, 2)} kW</td><td>${f.r.lineas}${f.lin ? ` <span class="tenue">L${f.lin[0]}${f.lin[1] > f.lin[0] ? '–' + f.lin[1] : ''}</span>` : ''}</td></tr>`).join('')}
    </tbody></table></div>`;
    const qu = c.filas.filter(f => f.r && f.r.quitados);
    if (qu.length) h += `<ul class="avisos">${qu.map(f => `<li>${t('puertaLed', { n: f.nombre, c: f.r.quitados, w: fmt(f.r.huecos.reduce((a, x) => a + x.w, 0), 2), h: fmt(Math.max(...f.r.huecos.map(x => x.h)), 2) })}</li>`).join('')}</ul>`;
  } else if (c.tot) {
    const T = c.tot, p = c.proyector;
    const tiros = c.filas.filter(f => f.pos).map(f => f.pos.dist);
    h += `<div class="res-tot">
      ${tarjeta(t('proyectores'), fmtPx(T.n), '', p.nombre + (c.filas.some(f => f.p.vert) ? ' · ' + t('vert') : ''), '#b566ff')}
      ${tarjeta(t('lienzo'), `${fmtPx(T.lienzoW)}×${fmtPx(T.lienzoH)}`, 'px', t('lienzoAyuda'), '#00b4ff')}
      ${tarjeta(t('brillo'), fmt(T.nitsMin === Infinity ? 0 : T.nitsMin, 0), 'nits', t('brilloAyudaG', { g: fmt(c.gan, 1) }), '#ffb000')}
      ${tarjeta(t('contraste'), fmt(T.contrasteMin, 1), ':1', nivelContraste(T.contrasteMin) + ' · ' + fmt(c.lx, 0) + ' lx', '#e100ff')}
      ${tarjeta(t('distOpticaK'), tiros.length ? fmt(Math.max(...tiros), 2) : '—', 'm', `TR ${fmt(Math.max(...c.filas.filter(f => f.s.tipo !== 'suelo').map(f => f.p.ratio)), 2)}:1`, '#00ff04')}
      ${tarjeta(t('lumenes'), fmtPx(T.lumenes), 'lm', `${fmtPx(T.n)} × ${fmtPx(p.lumens)} lm`, '#ff4d5e')}
    </div>`;
    h += `<div class="tabla-caja"><table class="tabla"><thead><tr><th>${t('supCol')}</th><th>${t('medida')}</th><th>${t('proyCol')}</th><th>${t('resol')}</th><th>${t('solCol')}</th><th>${t('tiroCol')}</th><th>${t('brCol')}</th></tr></thead><tbody>
      ${c.filas.map(f => { const q = f.p; return `<tr><td>${f.nombre}</td><td>${fmt(f.s.ancho)} × ${fmt(f.s.alto)} m</td><td>${q.cols ? q.cols + '×' + q.rows + ' = ' : ''}${q.n}${q.vert ? ' · ' + t('vert') : ''}</td><td>${q.resW}×${q.resH}</td><td>${fmt(q.solapeRel * 100, 0)} %</td><td>${fmt(q.tiro, 2)} m${q.fuera ? ' ⚠' : ''}</td><td>${fmt(q.nits, 0)} nits</td></tr>`; }).join('')}
    </tbody></table></div>`;
    h += vistasTecnicas(c, E.vista.tec || 'todas', Number(E.vista.vtSup) || 0);   // v8.3 · vistas técnicas (lateral, frontal y cenital)
    h += vistaPosicion(c);
    h += vistaSombras(c);
  }
  h += vistaElec(c);
  return h;
}

// nivel de contraste alcanzado según ANSI/AVIXA (visión pasiva 7:1, decisiones básicas 15:1, analítica 50:1, vídeo 80:1)
function nivelContraste(v) { return v >= 80 ? t('cVideo') : v >= 50 ? t('cAnalitica') : v >= 15 ? t('cBasica') : v >= 7 ? t('cPasiva') : t('cInsuf'); }
// posición del proyector y brillo por superficie: lo que da el calculador oficial de Epson
function vistaPosicion(c) {
  const fs = c.filas.filter(f => f.pos); if (!fs.length) return '';
  const ok = (v) => (v >= 15 ? 'ok' : v >= 7 ? '' : 'mal');
  // v8.0 · desplazamiento de la lente frente al de la óptica (en vertical, el de la sala es el horizontal de la óptica)
  const lim = (f) => { const q = f.proyector; return !q || q.ust || !q.shiftV ? 0 : f.p.vert ? q.shiftH : q.shiftV; };
  const pasa = (f) => lim(f) && Math.abs(f.pos.shiftV) > lim(f) + 0.5;
  return `<section class="res-sec"><div class="res-tit">${ICO.proy}${t('posTit')}</div><div class="tabla-caja"><table class="tabla"><thead><tr><th>${t('supCol')}</th><th>${t('distOpticaK')}</th><th>${t('zoomCol')}</th><th>${t('alturaOptica')}</th><th>${t('baseImagen')}</th><th>${t('techoImagen')}</th><th>${t('shiftV')}</th><th>${t('diagCol')}</th><th>${t('ilumCol')}</th><th>${t('brCol')}</th><th>${t('contraste')}</th></tr></thead><tbody>
    ${fs.map(f => { const q = f.p, o = f.pos; return `<tr><td>${f.nombre}</td><td><b>${fmt(o.dist, 2)} m</b></td><td>${fmt(q.tMin, 2)}–${fmt(q.tMaxZ, 2)} m</td><td>${fmt(o.yLente, 2)} m</td><td>${o.y0 >= 0 ? fmt(o.y0, 2) + ' m' : t('desborda', { d: fmt(-o.y0, 2) })}</td><td>${!o.techo ? '—' : o.techo - o.y1 >= 0 ? fmt(o.techo - o.y1, 2) + ' m' : t('desborda', { d: fmt(o.y1 - o.techo, 2) })}</td><td class="${pasa(f) ? 'mal' : ''}">${fmt(o.shiftV, 0)} %${lim(f) ? ` <small>(±${lim(f)} %)</small>` : ''}</td><td>${fmt(o.diag, 0)}″ · ${fmt(q.imgW, 2)} × ${fmt(q.imgH, 2)} m</td><td>${fmtPx(Math.round(q.lux))} lx</td><td>${fmt(q.nits, 0)} nits</td><td class="${ok(q.contraste)}">${fmt(q.contraste, 1)}:1</td></tr>`; }).join('')}
  </tbody></table></div>${fs.some(pasa) ? `<p class="aviso">${t('shiftFuera', { s: fs.filter(pasa).map(f => f.nombre).join(' · ') })}</p>` : ''}<p class="ayuda">${t('posAyuda', { lx: fmt(c.lx, 0), g: fmt(c.gan, 1) })}</p></section>`;
}
// electrónica y mediaserver elegidos, con el mismo componente de ficha
function vistaElec(c) {
  const x = c.elec; if (!x) return '';
  const led = E.tecnologia === 'led', fichas = [];
  if (led && x.proc) fichas.push(fichaProc(x.proc));
  if (x.media) fichas.push(fichaMedia(x.media, x.need, led));
  if (!fichas.length) return '';
  return `<section class="res-sec"><div class="res-tit">${ICO.elec}${t('elecTit')}</div><div class="fichas">${fichas.join('')}</div></section>`;
}
// sombras del público, safety zone y cruces de haces (proyección)
function vistaSombras(c) {
  const S = c.sombras; if (!S) return '';
  const li = [], sala = c.esp.tipo === 'sala';
  if (sala && S.zona) li.push(S.zona.ok ? `<li class="ok">${t('segZona', { a: fmt(S.zona.ancho, 1), f: fmt(S.zona.fondo, 1) })}</li>` : `<li class="mal">${t('segNo')}</li>`);
  // superficies con la misma franja, en una sola línea
  const grupos = []; S.franjas.filter(f => f.prof > 0.05).forEach(f => { const k = fmt(f.prof, 2) + '|' + fmt(f.tiro, 2), g = grupos.find(x => x.k === k); if (g) g.n.push(f.nombre); else grupos.push({ k, n: [f.nombre], d: fmt(f.prof, 2), t: fmt(f.tiro, 2) }); });
  grupos.forEach(g => li.push(`<li>${t(sala ? 'segFranja' : 'segPant', { n: g.n.join(' · '), d: g.d, t: g.t })}</li>`));
  if (!sala) S.franjas.filter(f => f.prof > c.dist).forEach(f => li.push(`<li class="mal">${t('segPublico', { d: fmt(c.dist, 1), n: f.nombre })}</li>`));
  if (c.filas.some(f => f.s.tipo === 'suelo')) li.push(`<li>${t('segSuelo')}</li>`);
  const pares = {}; S.conflictos.forEach(k => { const id = k.tapa.nombre + '|' + k.haz.nombre; pares[id] = (pares[id] || 0) + 1; });
  Object.entries(pares).forEach(([id, n]) => { const [a, b] = id.split('|'); li.push(`<li class="mal">${t('conflicto', { a, b, n: n + '×' })}</li>`); });
  if (S.conflictos.length) li.push(`<li>${t('conflictoSol')}</li>`);
  // chasis recolocados para no chocar (holgura de ventilación) y choques sin solución
  S.movs.forEach(k => { const partes = [];
    if (k.dz) partes.push(t('mvFondo', { d: fmt(k.dz, 2) })); if (k.dy) partes.push(t(k.dy > 0 ? 'mvAlto' : 'mvBajo', { d: fmt(Math.abs(k.dy), 2) })); if (k.dx) partes.push(t('mvLado', { d: fmt(Math.abs(k.dx), 2) }));
    li.push(`<li>${k.h.nombre} P${k.h.i + 1} ${partes.join(t('yy'))} ${t(k.por === 'choque' ? 'porChoque' : 'porHaz', { b: k.con ? k.con.nombre + ' P' + (k.con.i + 1) : '' })}.</li>`); });
  if (c.autoPropone) li.push(`<li class="mal">${t('mejorModelo', { a: c.proyector.nombre, b: c.autoPropone.nombre })}</li>`);
  S.choques.forEach(k => li.push(`<li class="mal">${t('choque', { a: k.h.nombre + ' P' + (k.h.i + 1), b: k.con ? k.con.nombre + ' P' + (k.con.i + 1) : '' })}</li>`));
  if (S.movs.length || S.choques.length) li.push(`<li>${t('holgura')}</li>`);
  S.cruces.forEach(k => li.push(`<li>${t('cruce', { a: k.na, b: k.nb })}</li>`));
  (S.obst || []).forEach(k => li.push(`<li class="mal">${t('obstSombra', { k: k.k + 1, n: k.nombres.join(' · ') })}</li>`));
  puertasDe(c.esp).forEach((p, i) => { const f = c.filas.find(x => x.s.id === p.pared); if (f) li.push(`<li>${t('puertaProy', { n: f.nombre })}</li>`); });
  if (!S.conflictos.length && !S.cruces.length && !S.choques.length && !(S.obst || []).length) li.push(`<li class="ok">${t('sinProblemas')}</li>`);
  return `<section class="res-sec"><div class="res-tit"><span class="cinta-ico" aria-hidden="true"></span>${t('segTit')}</div><ul class="avisos">${li.join('')}</ul></section>`;
}

// ---------- consola fija: modo (una / varias · LED / proyección) y petición en lenguaje natural ----------
// Se monta una vez por idioma; después solo cambian los estados, así no se pierde el texto, el foco ni el aviso en curso.
const ICO_MINI = {
  una: '<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="3"><rect x="8" y="4" width="32" height="19" rx="1"/><path d="M18 28h12M24 23v5"/></svg>',
  varias: '<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M4 8l10 3v15L4 23z"/><path d="M14 11h20v15H14z"/><path d="M34 11l10-3v15l-10 3"/></svg>',
  led: '<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="4" width="36" height="22" rx="1"/><path d="M18 4v22M30 4v22M6 15h36"/></svg>',
  proy: '<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><rect x="3" y="12" width="16" height="10" rx="2"/><circle cx="14" cy="17" r="3"/><path d="M19 13l26-9v26l-26-9"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/></svg>',
  ir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>'
};
let nlTexto = '', escuchando = null, conIdioma = '';
const unaLed = () => E.cantidad === 'una' && E.tecnologia === 'led';
function pintarConsola() {
  const c = $('#consola'); if (!c) return;
  if (conIdioma !== idioma() || !c.firstElementChild) {
    conIdioma = idioma();
    const i0 = $('#nl-texto'), val = i0 ? i0.value : nlTexto, foco = document.activeElement === i0;
    const b = (set, v, ico, txt) => `<button type="button" class="tog" aria-pressed="false" data-set="${set}" data-v="${v}">${ico}<span>${txt}</span></button>`;
    c.innerHTML = `<div class="con-grupo" role="group" aria-label="${t('cuantas')}">${b('cantidad', 'una', ICO_MINI.una, t('unaCorto'))}${b('cantidad', 'varias', ICO_MINI.varias, t('variasCorto'))}</div>
      <div class="con-grupo" role="group" aria-label="${t('tecno')}">${b('tecnologia', 'led', ICO_MINI.led, 'LED')}${b('tecnologia', 'proy', ICO_MINI.proy, t('proy'))}</div>
      <div class="con-nl"><input id="nl-texto" type="text" enterkeyhint="go" autocomplete="off" aria-label="${t('nlPh2')}">
        <button type="button" class="sec-btn con-ico" data-accion="nl-mic" aria-pressed="false" title="${t('nlMic')}" aria-label="${t('nlMic')}">${ICO_MINI.mic}</button>
        <button type="button" class="sec-btn con-ico" data-accion="nl-audio" title="${t('nlAudio')}" aria-label="${t('nlAudio')}">${ICO_MINI.audio}</button><input type="file" id="nl-archivo" accept="audio/*,.opus,.ogg,.m4a,.mp3,.wav,.webm" hidden>
        <button type="button" class="pri con-calc" data-accion="nl-calcular" title="${t('nlCalc')}" aria-label="${t('nlCalc')}"><span>${t('nlCalc')}</span>${ICO_MINI.ir}</button>
        <div class="con-estado" id="con-estado" role="status" aria-live="polite"></div></div>`;
    const i = $('#nl-texto'); i.value = val; if (foco) { i.focus(); i.setSelectionRange(val.length, val.length); }
    ajustarPh();
  }
  c.querySelectorAll('[data-set]').forEach(b => { const on = E[b.dataset.set] === b.dataset.v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  const m = c.querySelector('[data-accion="nl-mic"]'); m.classList.toggle('activo', !!escuchando); m.setAttribute('aria-pressed', !!escuchando);
}
// el texto guía más largo que quepa entero en la caja (nunca cortado)
let ctxPh = null;
function ajustarPh() {
  const i = $('#nl-texto'); if (!i || !i.clientWidth) return;
  const cs = getComputedStyle(i), libre = i.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 2;
  ctxPh = ctxPh || document.createElement('canvas').getContext('2d'); ctxPh.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const ph = ['nlPh1', 'nlPh2', 'nlPh3', 'nlPh4'].map(k => t(k)).find(x => ctxPh.measureText(x).width <= libre) || '';
  if (i.placeholder !== ph) i.placeholder = ph;
}
let tEstado = 0;
function estadoNl(txt, fijo) { const e = $('#con-estado'); if (!e) return; e.textContent = txt || ''; e.classList.toggle('ver', !!txt); clearTimeout(tEstado); if (txt && !fijo) tEstado = setTimeout(() => e.classList.remove('ver'), 6000); }
// cálculo de una pantalla LED (la app de la raíz, dentro de la consola): los mensajes esperan a que avise de que está lista
let ledListo = false, colaLed = [];
function aIframe(msg) {
  const f = $('#sc-led'); if (!f) return;
  if (ledListo) { try { f.contentWindow.postMessage(msg, location.origin); } catch (e) {} } else colaLed.push(msg);
}
window.addEventListener('message', (ev) => {
  const f = $('#sc-led'); if (ev.origin !== location.origin || !f || ev.source !== f.contentWindow || !ev.data) return;
  if (ev.data.tipo === 'screens-listo') { ledListo = true; f.classList.add('listo'); colaLed.splice(0).forEach(aIframe); }
});
// v8.1 · editor de anuncios de AVHUB ADMIN (?anuncios=editor): la consola pasa el modo al cálculo de una pantalla LED y reenvía
// los mensajes entre el editor y ese cálculo; las zonas de anuncio llegan al editor en las coordenadas de la consola
const EDITOR_ADS = /[?&]anuncios=editor\b/.test(location.search);
const editorPermitido = (o) => o === location.origin || /^https:\/\/([a-z0-9-]+\.)*(googleusercontent\.com|google\.com|mediaservi\.com|githack\.com)$/.test(o) ||
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
if (EDITOR_ADS && window.parent !== window) window.addEventListener('message', (ev) => {
  const d = ev.data; if (!d || typeof d !== 'object' || d.tipo !== 'avhub-ads') return;
  const f = $('#sc-led'); if (!f) return;
  if (ev.source === window.parent) { if (editorPermitido(ev.origin)) aIframe(d); return; }
  if (ev.source !== f.contentWindow || ev.origin !== location.origin) return;
  if (d.accion === 'zonas' && Array.isArray(d.zonas)) { zonasLed = d; marcoLed = ''; reenviarZonas(); return; }
  try { window.parent.postMessage(d, '*'); } catch (e) {}
});
// las zonas, en las coordenadas de la consola; se reenvían también si el cálculo cambia de sitio en la consola
let zonasLed = null, marcoLed = '';
function reenviarZonas() {
  const f = $('#sc-led'); if (!EDITOR_ADS || !zonasLed || !f) return;
  const r = f.getBoundingClientRect(), k = [r.left, r.top, r.width, r.height, innerWidth, innerHeight].map(Math.round).join(',');
  if (k === marcoLed) return; marcoLed = k;
  const m = { ...zonasLed, zonas: zonasLed.zonas.map(z => ({ ...z, x: z.x + r.left, y: z.y + r.top })), marco: { x: r.left, y: r.top, w: r.width, h: r.height }, vw: innerWidth, vh: innerHeight };
  try { window.parent.postMessage(m, '*'); } catch (e) {}
}
if (EDITOR_ADS && window.parent !== window) { addEventListener('resize', reenviarZonas); setInterval(reenviarZonas, 700); }
// lo entendido, rotulado en el idioma de la consola
function rotulo(x) {
  switch (x.k) {
    case 'proy': return t('proy'); case 'led': return 'LED'; case 'sala': return t('sala'); case 'una': return t('una');
    case 'pant': return t('pantN', { n: x.n }); case 'medida': return x.v.map(v => fmt(v)).join(' × ') + ' m';
    case 'alto': return t('alto') + ' ' + fmt(x.v) + ' m'; case 'paredes': return t('paredesN', { n: x.n }); case 'suelo': return t('suelo');
    case 'arco': return t('arco'); case 'linea': return t('linea'); case 'publico': return t('dist') + ' ' + fmt(x.v, 1) + ' m';
    case 'lux': return fmt(x.v, 0) + ' lx'; case 'ganancia': return t('ganancia') + ' ' + fmt(x.v, 1); case 'techo': return t('techoAlto') + ' ' + fmt(x.v) + ' m';
    case 'vertical': return t('or_vertical'); case 'horizontal': return t('or_horizontal'); case 'tipo': return t('tp_' + x.v);
    case 'distProy': return t('distOpticaK') + ' ' + fmt(x.v, 1) + ' m'; case 'montaje': return t('mo_' + x.v) + (x.h ? ' ' + fmt(x.h, 1) + ' m' : '');
    case 'fibra': return t('fibra'); case 'central': return t('central') + ' ' + x.v.map(v => fmt(v)).join(' × ') + ' m';
    case 'laterales': return t('laterales') + ' ' + x.v.map(v => fmt(v)).join(' × ') + ' m'; case 'pitch': return 'P' + fmt(x.v, 2) + (x.ok ? ' · ' + x.ok : ''); default: return x.v;
  }
}
function calcularPeticion() {
  const i = $('#nl-texto'), txt = (i ? i.value : nlTexto).trim(); nlTexto = i ? i.value : nlTexto;
  if (!txt) { estadoNl(t('nlVacio')); if (i) i.focus(); return; }
  if (escuchando) { try { escuchando.stop(); } catch (e) {} escuchando = null; }
  if (i && matchMedia('(pointer: coarse)').matches) i.blur(); // en el móvil se cierra el teclado para ver el resultado
  const r = interpretar(txt), c = r.cambios;
  if (r.cantidad) E.cantidad = r.cantidad; if (r.tecnologia) E.tecnologia = r.tecnologia;
  // una pantalla LED: la petición la resuelve su propio cálculo, con el popup de datos del proyecto
  if (unaLed()) { actualizar(); aIframe({ tipo: 'screens-peticion', texto: txt }); estadoNl(t('nlLed')); return; }
  Object.assign(E.esp, c.esp); Object.assign(E.esp.sueltas, c.sueltas); if (c.paredes) Object.assign(E.esp.paredes, c.paredes);
  // v8.0 · una petición de proyección parte de la posición AUTO, salvo lo que diga (distancia, orientación, montaje)
  if (r.tecnologia === 'proy') Object.assign(E.proy, { dist: 0, orient: 'auto', montaje: 'auto', altura: 0, tipo: 'pared' });
  Object.assign(E.led, c.led); Object.assign(E.proy, c.proy); Object.assign(E.elec, c.elec);
  if (r.tecnologia === 'proy' && c.proy.lux == null) luzSegunTipo();
  if (c.led.tipo || c.led.clase) E.led.crm = '';
  if (c.elec.backup || c.elec.conexion) E.elec.sel = '';
  if (r.pitch) {   // v7.9 · «P1.5», «pitch 1,5»…: el modelo de ese pitch (si el catálogo lo tiene)
    const l = listaLed(), cob = r.cob ? l.filter(m => /cob/i.test(m.tech + ' ' + m.crm)) : [];
    const m = (cob.length ? cob : l).find(x => Math.abs(x.pitch - r.pitch) < 0.07);
    const v = r.vistos.find(x => x.k === 'pitch'); if (m) { E.led.crm = m.crm; if (v) v.ok = m.crm; }
  }
  actualizar();
  estadoNl(r.vistos.length ? t('nlEntendido') + ' ' + r.vistos.map(rotulo).join(' · ') : t('nlNada'));
}

function vistaTrabajo() {
  return `<div class="trabajo"><aside class="panel" id="panel"></aside><main class="vista">
    <div class="escena" id="escena"><canvas id="lienzo3d" aria-label="Simulación 3D"></canvas>
      <div class="esc-barra"><div id="esc-vistas"></div><div id="esc-cont"></div><div id="esc-medio" class="esc-medio"></div></div>
      <div class="esc-info">${t('vista3d')}</div></div>
    <div class="res" id="res"></div></main></div>`;
}
function barraEscena() {
  const v = E.vista;
  $('#esc-vistas').innerHTML = ['exterior', 'interior', 'planta'].map(k => tog(v.camara === k, `data-cam="${k}"`, t(k))).join('');
  $('#esc-cont').innerHTML = ['carta', 'panorama', 'ascensor', 'propio', 'apagado'].map(k => tog(v.contenido === k, `data-set="vista.contenido" data-v="${k}"`, t(k))).join('') + tog(v.etiquetas, 'data-accion="etiquetas"', t('etiquetas')) + (E.tecnologia === 'proy' ? tog(v.zona, 'data-accion="zona"', t('zonaBtn')) : '');
  $('#esc-medio').innerHTML = (v.contenido === 'propio' ? `<button type="button" class="sec-btn" data-accion="subir">⬆ ${medio ? medio.nombre : t('subir')}</button><select class="sel" data-sel="vista.modo" aria-label="${t('modoMedio')}">${['continuo', 'estirar', 'rellenar', 'encajar', 'repetir', 'espejo'].map(k => `<option value="${k}"${v.modo === k ? ' selected' : ''}>${t('m_' + k)}</option>`).join('')}</select><input type="file" id="medio-archivo" accept="image/*,video/*" hidden>` : '');
}

// ---------- ciclo ----------
let tEsc = 0;
function soltarEscena() { if (escena) { try { escena.destruir(); } catch (e) {} } escena = null; }
function actualizar(sinEscena) {
  guardar();
  const app = $('#app'), led1 = unaLed();
  pintarConsola();
  document.body.classList.toggle('con-led', led1);
  $('#btn-info').hidden = !led1;
  // una pantalla LED: el cálculo completo de una pantalla (la app de la raíz), dentro de la misma consola
  if (led1) {
    if (!$('#sc-led')) { soltarEscena(); calculo = null; ledListo = false; colaLed = [];
      app.innerHTML = `<div class="embebido"><p class="emb-carga">${t('cargandoLed')}</p><iframe id="sc-led" src="led.html?embed=1&lang=${idioma()}${EDITOR_ADS ? '&anuncios=editor' : ''}" title="SCREENS · ${t('una')} LED"></iframe></div>`;
      // se muestra cuando avisa de que está listo (o, por si acaso, 4 s después de cargar)
      const f = $('#sc-led'); f.addEventListener('load', () => setTimeout(() => f.classList.add('listo'), 4000), { once: true }); }
    return;
  }
  if ($('#sc-led')) app.innerHTML = '';
  if (!$('#panel')) { soltarEscena(); app.innerHTML = vistaTrabajo(); crearEscena(); }
  calculo = calcular();
  const pan = $('#panel'), sc = pan.scrollTop;
  pan.innerHTML = modEspacio() + (E.tecnologia === 'led' ? modLed(calculo) : modProy(calculo)) + modElec(calculo) + modSuperficies(calculo);
  pan.scrollTop = sc;
  $('#res').innerHTML = vistaResultados(calculo);
  activarVistas($('#res'), calculo, fijarDesdeVistas);
  barraEscena();
  if (!sinEscena) { clearTimeout(tEsc); tEsc = setTimeout(construirEscena, 60); }
}
function construirEscena() {
  if (!escena || !calculo) return;
  const c = calculo, sala = c.esp.tipo === 'sala' ? { ancho: c.esp.ancho, fondo: c.esp.fondo, alto: c.esp.alto } : null;
  const xs = c.filas.map(f => Math.abs(f.s.x) + f.s.ancho / 2), zs = c.filas.map(f => Math.abs(f.s.z));
  // v8.0 · la escena abarca también los proyectores (a 25 m al otro lado de la calle, en torre…)
  (c.sombras && c.sombras.haces || []).forEach(h => { xs.push(Math.abs(h.lente.x) + 1); zs.push(Math.abs(h.lente.z) + 1); });
  escena.construir({
    sala, tecnologia: E.tecnologia, contenido: E.vista.contenido, etiquetas: E.vista.etiquetas, medio: medio ? { ...medio, modo: E.vista.modo } : null,
    sombras: E.tecnologia === 'proy' && E.vista.zona ? c.sombras : null, haces: c.sombras ? c.sombras.haces : null,
    puertas: puertasDe(c.esp).map(p => puertaMundo(p, c.esp)), obstaculos: obstaculosDe(c.esp), obstTapa: new Set(c.sombras && c.sombras.obst ? c.sombras.obst.map(x => x.k) : []),
    conflictos: new Set(E.tecnologia === 'proy' && c.sombras ? c.sombras.conflictos.map(k => k.tapa.sup + ':' + k.tapa.i).concat(c.sombras.choques.map(k => k.h.sup + ':' + k.h.i)) : []),
    superficies: c.filas, distPublico: c.dist, extX: Math.max(4, ...xs) * 2, extZ: Math.max(2, ...zs, c.dist), montaje: E.proy.montaje || 'auto',
    altoMax: Math.max(2, ...c.filas.map(f => f.s.elev + f.s.alto))
  });
}
async function crearEscena() {
  const lienzo = $('#lienzo3d');
  try {
    const { Escena } = await import('./escena.js');
    if (!lienzo.isConnected || escena) return; // se cambió de modo mientras se cargaba
    escena = new Escena(lienzo);
    escena.vistaActual = E.vista.camara === 'interior' ? 'dentro' : E.vista.camara;
    construirEscena();
  } catch (err) {
    console.error(err);
    $('#escena').insertAdjacentHTML('beforeend', `<div class="esc-aviso">${t('sinWebgl')}</div>`);
  }
}

// ---------- eventos ----------
// v7.3 · cada casilla actúa sola: si un valor choca con otro (la imagen más alta que la sala, una puerta fuera de su pared…),
// se ajusta el que depende de él y se avisa en el propio módulo, en vez de ignorar el valor en silencio
const ajuste = { esp: '', obst: '' };
function coherencia(k) {
  const e = E.esp, r2 = (v) => Math.round(v * 100) / 100, sala = e.tipo === 'sala' && E.cantidad === 'varias';
  ajuste.esp = ''; ajuste.obst = '';
  if (!sala) return;
  if ((k === 'esp.altoCubierto' || k === 'esp.elev') && e.altoCubierto > 0 && e.elev + e.altoCubierto > e.alto) { e.alto = r2(e.elev + e.altoCubierto); ajuste.esp = t('ajSala', { v: fmt(e.alto) }); }
  if (k === 'esp.elev' && !(e.altoCubierto > 0) && e.elev > e.alto - 0.5) { e.elev = r2(Math.max(0, e.alto - 0.5)); ajuste.esp = t('ajElev', { v: fmt(e.elev) }); }
  if (k === 'esp.alto') {
    if (e.elev > e.alto - 0.5) { e.elev = r2(Math.max(0, e.alto - 0.5)); ajuste.esp = t('ajElev', { v: fmt(e.elev) }); }
    if (e.altoCubierto > 0 && e.elev + e.altoCubierto > e.alto) { e.altoCubierto = r2(Math.max(0.1, e.alto - e.elev)); ajuste.esp = t('ajImagen', { v: fmt(e.altoCubierto) }); }
  }
  // puertas dentro de su pared y obstáculos dentro de la sala (su x y su z son el centro)
  const m = /^esp\.obst\.(\d+)\./.exec(k), todas = /^esp\.(ancho|fondo|alto)$/.test(k);
  if (!m && !todas) return;
  (e.obst || []).forEach((o, i) => {
    if (m && +m[1] !== i) return;
    const antes = JSON.stringify(o);
    if (o.tipo === 'puerta') { const L = o.pared === 'izquierda' || o.pared === 'derecha' ? e.fondo : e.ancho;
      o.ancho = r2(Math.min(o.ancho, L)); o.x = r2(Math.min(Math.max(0, o.x), L - o.ancho)); o.alto = r2(Math.min(o.alto, e.alto)); }
    else { o.ancho = r2(Math.min(o.ancho, e.ancho)); o.fondo = r2(Math.min(o.fondo, e.fondo)); o.alto = r2(Math.min(o.alto, e.alto));
      o.x = r2(Math.min(Math.max(o.ancho / 2, o.x), e.ancho - o.ancho / 2)); o.z = r2(Math.min(Math.max(o.fondo / 2, o.z), e.fondo - o.fondo / 2)); }
    if (JSON.stringify(o) !== antes) ajuste.obst = t(o.tipo === 'puerta' ? 'ajPuerta' : 'ajObst', { n: (o.tipo === 'puerta' ? t('puerta') : t('obst')) + ' ' + ((e.obst || []).slice(0, i + 1).filter(x => x.tipo === o.tipo).length) });
  });
}
function fijar(ruta, valor) { const p = ruta.split('.'); let o = E; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = valor;
  if (ruta === 'proy.altura' && E.proy.montaje === 'auto') { const pw = calculo && calculo.filas ? calculo.filas.find(f => f.s.tipo !== 'suelo' && f.pos) : null; E.proy.montaje = pw && !pw.pos.apoyo ? 'colgado' : 'apoyado'; } }
document.addEventListener('click', (ev) => {
  const b = ev.target.closest('button, a[data-accion]'); if (!b || b.disabled) return;
  if (b.tagName === 'A') ev.preventDefault();
  if (b.dataset.set) { fijar(b.dataset.set, b.dataset.bool ? b.dataset.v === '1' : b.dataset.numV ? Number(b.dataset.v) : b.dataset.v);
    if (/^elec\.(backup|escalador|conexion)$/.test(b.dataset.set)) E.elec.sel = '';
    if (b.dataset.set === 'elec.marca') E.elec.selMedia = '';
    if (b.dataset.set === 'led.clase' || b.dataset.set === 'led.tipo') E.led.crm = '';
    actualizar(b.dataset.set === 'esp.sueltas.disp' ? false : false); return; }
  if (b.dataset.pared) { E.esp.paredes[b.dataset.pared] = !E.esp.paredes[b.dataset.pared]; actualizar(); return; }
  if (b.dataset.cam) { E.vista.camara = b.dataset.cam; if (escena) escena.vista(b.dataset.cam === 'interior' ? 'dentro' : b.dataset.cam); barraEscena(); guardar(); return; }
  const a = b.dataset.accion;
  // nuevo cálculo: valores por defecto en el mismo modo de la consola
  if (a === 'inicio') { const cant = E.cantidad, tec = E.tecnologia; E = DEF(); E.cantidad = cant; E.tecnologia = tec; nlTexto = ''; const i = $('#nl-texto'); if (i) i.value = ''; estadoNl('');
    if (unaLed()) { guardar(); aIframe({ tipo: 'screens-reset' }); return; } actualizar(); return; }
  if (a === 'idioma') { fijarIdioma(IDIOMAS[(IDIOMAS.indexOf(idioma()) + 1) % IDIOMAS.length]); pintarCabecera();
    if (unaLed()) { pintarConsola(); aIframe({ tipo: 'screens-idioma', lang: idioma() }); return; }
    soltarEscena(); $('#app').innerHTML = ''; actualizar(); return; }
  if (a === 'info') { aIframe({ tipo: 'screens-info' }); return; }
  if (a === 'etiquetas') { E.vista.etiquetas = !E.vista.etiquetas; actualizar(); return; }
  if (a === 'zona') { E.vista.zona = !E.vista.zona; actualizar(); return; }
  if (a === 'subir') { const f = $('#medio-archivo'); if (f) f.click(); return; }
  if (a === 'pdf') { if (unaLed()) aIframe({ tipo: 'screens-pdf' }); else imprimir(); return; }
  if (a === 'nl-calcular') { calcularPeticion(); return; }
  if (a === 'nl-audio') { const f = $('#nl-archivo'); if (f) f.click(); return; }
  if (a === 'nl-mic') {
    if (escuchando) { try { escuchando.stop(); } catch (e) {} escuchando = null; pintarConsola(); return; }
    const i0 = $('#nl-texto'), base = (i0 ? i0.value : nlTexto).trim();   // lo dictado se añade a lo que ya estaba escrito
    // los últimos avisos de un dictado ya parado no pisan a uno nuevo que se haya empezado justo después
    let yo = null; const vivo = () => escuchando === yo || escuchando === null;
    yo = escuchando = globalThis.SC_VOZ.dictar(idioma(), (txt) => { if (!vivo()) return; nlTexto = (base ? base + ' ' : '') + txt; const i = $('#nl-texto'); if (i) i.value = nlTexto; },
      (e) => { if (!vivo()) return; if (e === 'micFin') { escuchando = null; pintarConsola(); if (nlTexto.trim()) estadoNl(t('est_listo')); } else estadoNl(t('est_' + e), e === 'escuchando'); });
    pintarConsola(); return;
  }
  if (a === 'elec-dante') { E.elec.dante = !E.elec.dante; E.elec.selMedia = ''; actualizar(); return; }
  if (a === 'reset-elec') { E.elec = DEF().elec; actualizar(); return; }
  if (a === 'reset-esp') { E.esp = DEF().esp; actualizar(); return; }
  if (a === 'obst-add') { const e = E.esp; e.obst = e.obst || [];
    e.obst.push(b.dataset.tipo === 'puerta' ? { tipo: 'puerta', pared: e.paredes.trasera ? 'trasera' : 'frontal', x: 0.4, ancho: 0.9, alto: 2.1 }
      : { tipo: 'obstaculo', x: e.tipo === 'sala' ? e.ancho * 0.3 : 1.5, z: e.tipo === 'sala' ? e.fondo * 0.35 : 2, ancho: 0.4, fondo: 0.4, alto: e.tipo === 'sala' ? e.alto : 3 });
    actualizar(); return; }
  if (a === 'obst-del') { E.esp.obst.splice(Number(b.dataset.i), 1); actualizar(); return; }
  if (a === 'reset-led') { E.led = DEF().led; actualizar(); return; }
  if (a === 'reset-proy') { E.proy = Object.assign(DEF().proy, { tipo: E.proy.tipo }); actualizar(); return; }   // el tipo de proyecto se mantiene
  // v8.2 · tipo de proyección: la sala inmersiva es «varias + sala»; mapping y pared, una o varias superficies sueltas
  if (a === 'tipo-proy') { const v = b.dataset.v;
    if (v === 'sala') { E.cantidad = 'varias'; E.esp.tipo = 'sala'; }
    else { E.proy.tipo = v; if (E.cantidad === 'varias' && E.esp.tipo === 'sala') E.cantidad = 'una'; }
    luzSegunTipo(); actualizar(); return; }
  // candados: al cerrarlo se fija el valor que estaba calculando AUTO; al abrirlo vuelve a AUTO
  if (a === 'lock-dist' || a === 'lock-alt') {
    const pw = calculo && calculo.filas ? calculo.filas.find(f => f.s.tipo !== 'suelo' && f.pos) : null, r2 = (v) => Math.round(v * 100) / 100;
    if (a === 'lock-dist') E.proy.dist = Number(E.proy.dist) > 0 ? 0 : (pw ? r2(pw.pos.dist) : 0);
    else if (Number(E.proy.altura) > 0) E.proy.altura = 0;
    else if (pw) { if (E.proy.montaje === 'auto') E.proy.montaje = pw.pos.apoyo ? 'apoyado' : 'colgado'; E.proy.altura = Math.max(0.01, r2(pw.pos.altura)); }
    actualizar(); return; }
  if (a === 'proy-oos') { E.proy.oos = !E.proy.oos; actualizar(); return; }
  if (a === 'vt-modo') { E.vista.tec = b.dataset.v; actualizar(true); return; }   // v8.3 · distribución de las vistas técnicas
});
let tNum = 0, tRep = 0, nRep = 0, pasoPendiente = false;
// ▲▼: un toque = un paso; mantener pulsado repite (x5 y x10 al rato). Se recalcula al soltar (no a mitad de la pulsación).
function pasoNum(k, dir) {
  const i = document.querySelector(`input[data-num="${k}"]`); if (!i) return;
  const paso = parseFloat(i.step) || 1, min = parseFloat(i.min), max = parseFloat(i.max), dec = (String(i.step).split('.')[1] || '').length;
  let v = parseFloat(String(i.value).replace(',', '.')) || 0; const mult = nRep > 24 ? 10 : nRep > 10 ? 5 : 1;
  // distancia óptica en AUTO (0): ▲ fija la que AUTO estaba usando y sigue desde ahí
  if (k === 'proy.dist' && !v && dir > 0 && calculo) { const pw = calculo.filas.find(f => f.s.tipo !== 'suelo'); if (pw && pw.p.tMin) v = Math.round(pw.p.tMin / paso) * paso - paso; }
  let nv = Math.round((v + dir * paso * mult) / paso) * paso;
  if (!isNaN(min)) nv = Math.max(min, nv); if (!isNaN(max)) nv = Math.min(max, nv);
  nv = Number(nv.toFixed(dec)); i.value = nv; ajustarCasilla(i); fijar(k, nv); coherencia(k); pasoPendiente = true; clearTimeout(tNum);
}
function pararRep() { clearTimeout(tRep); tRep = 0; nRep = 0; if (pasoPendiente) { pasoPendiente = false; clearTimeout(tNum); tNum = setTimeout(() => actualizar(), 30); } }
document.addEventListener('pointerdown', (ev) => {
  const b = ev.target.closest('.flecha'); if (!b || ev.button > 0) return;
  ev.preventDefault(); pararRep();
  const k = b.dataset.k, dir = Number(b.dataset.flecha); pasoNum(k, dir);
  const repetir = (espera) => { tRep = setTimeout(() => { nRep++; pasoNum(k, dir); repetir(70); }, espera); };
  repetir(420);
});
['pointerup', 'pointercancel', 'blur'].forEach(e => window.addEventListener(e, pararRep));
document.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.id === 'nl-texto') { ev.preventDefault(); calcularPeticion(); } });
document.addEventListener('input', (ev) => {
  const i = ev.target; if (i.id === 'nl-texto') { nlTexto = i.value; return; }
  if (i.dataset.rango) { const n = document.querySelector(`input[data-num="${i.dataset.rango}"]`); if (n) n.value = Number(i.value).toFixed(2); return; }
  if (!i.dataset.num) return; ajustarCasilla(i);
  const v = parseFloat(String(i.value).replace(',', '.'));
  if (isNaN(v)) return;
  const min = parseFloat(i.min), max = parseFloat(i.max);
  fijar(i.dataset.num, Math.min(isNaN(max) ? v : max, Math.max(isNaN(min) ? v : min, i.step === '1' ? Math.round(v) : v))); coherencia(i.dataset.num);
  clearTimeout(tNum); tNum = setTimeout(() => { const foco = i.dataset.num, pos = i.selectionStart; actualizar(); const n = document.querySelector(`[data-num="${foco}"]`); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } }, 350);
});
document.addEventListener('change', (ev) => {
  const s = ev.target;
  if (s.id === 'medio-archivo' && s.files && s.files[0]) { cargarMedio(s.files[0]); return; }
  if (s.id === 'nl-archivo' && s.files && s.files[0]) {
    globalThis.SC_VOZ.transcribir(s.files[0], idioma(), (e, p) => estadoNl(t('est_' + e, { p }), true))
      .then(txt => { if (!txt) { estadoNl(t('est_vacio')); return; } const i = $('#nl-texto'), base = (i ? i.value : nlTexto).trim(); nlTexto = (base ? base + ' ' : '') + txt; if (i) i.value = nlTexto; estadoNl(t('est_ok')); })
      .catch(err => estadoNl(t(err && err.message === 'formato' ? 'est_formato' : 'est_modelo')));
    s.value = ''; return;
  }
  if (s.dataset.sel) { fijar(s.dataset.sel, s.value); if (s.dataset.sel === 'proy.cuerpo') E.proy.optica = ''; actualizar(); }   // otro proyector: su óptica vuelve a AUTO
  if (s.dataset.rango) { fijar(s.dataset.rango, Math.round(Number(s.value) * 100) / 100); actualizar(); }   // v8.2 · deslizador del zoom: fija la distancia
  if (s.dataset.uso && s.value) { E.proy.lux = Number(s.value); actualizar(); }
  if (s.dataset.vtSel) { E.vista.vtSup = Number(s.value) || 0; actualizar(true); }   // v8.3 · superficie de las vistas técnicas
});

// PDF: hoja A4 en claro con cabecera, captura 3D, resultados, equipos, electrónica y avisos (se imprime con el navegador)
// v7.4 · cabecera en una fila de alto común (logo SCREENS a la izquierda, web y fecha al centro, logo AVHUB a la derecha),
// línea de cabecera suave con el tipo de proyecto y sus datos, y pie (aviso + eslogan) con número de hoja en todas las hojas
function imprimir() {
  const c = calculo; if (!c || !c.filas.length) return;
  const hoy = new Date(), fecha = hoy.toLocaleDateString(idioma() === 'en' ? 'en-GB' : 'es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' · ' + hoy.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const pie = `SCREENS ${VERSION} ${hoy.getFullYear()} ${t('pie')}`, web = 'by mediaservi.com · screens.mediaservi.com';
  let h = `<header class="im-cab"><img class="im-logo" src="assets/screens-logo-negro.svg" alt="SCREENS"><div class="im-url"><b>avhub.mediaservi.com</b><span>${fecha}</span></div><img class="im-avhub" src="assets/avhub-logo.svg" alt="AVHUB"></header>`;
  h += `<div class="im-titulo">${tituloPdf(c)}</div>`;
  if (escena) h += `<figure class="im-captura"><img src="${escena.captura(true)}" alt=""></figure>`;
  h += `<div class="im-res">${vistaResultados(c)}</div>`;
  const fichas = E.tecnologia === 'led' ? (c.modelo ? [fichaCab(c.modelo)] : []) : [fichaProy(c.proyector, t('fProy'))].concat(c.prSuelo && c.prSuelo !== c.proyector && c.filas.some(f => f.s.tipo === 'suelo') ? [fichaProy(c.prSuelo, t('fProySuelo'))] : []);
  if (fichas.length) h += `<section class="res-sec"><div class="res-tit">${t('equipos')}</div><div class="fichas">${fichas.join('')}</div></section>`;
  // pie en el margen inferior de cada hoja; si el navegador no dibuja esos márgenes (Safari, Firefox), va al final del documento.
  // Las cajas vacías de arriba y de abajo a la izquierda evitan que el navegador añada su fecha, título y dirección a la hoja
  if (cajasMargen()) h += `<style>@page { margin-bottom: 18mm; @top-left { content: "" } @top-center { content: "" } @top-right { content: "" } @bottom-left { content: "" } @bottom-center { content: ${cssTxt(t('avisoPdf'))} "\\A" ${cssTxt(pie + ' ')} ${icoPie()} ${cssTxt(' ' + web)}; } @bottom-right { content: counter(page) "/" counter(pages); } }</style>`;
  else h += `<p class="im-aviso">${t('avisoPdf')}</p><footer class="im-pie">${pie} <i class="ic ic-footer" aria-hidden="true"></i> ${web}</footer>`;
  const d = $('#impresion'); d.innerHTML = h;
  // fotos sin carga diferida (el bloque está oculto en pantalla) y, como mucho, 3 s de espera
  const imgs = [...d.querySelectorAll('img')]; imgs.forEach(i => { i.loading = 'eager'; });
  const espera = Promise.all(imgs.map(i => (i.complete ? 1 : new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); }))));
  Promise.race([espera, new Promise(r => setTimeout(r, 3000))]).then(() => setTimeout(() => window.print(), 60));
}
window.addEventListener('afterprint', () => { const d = $('#impresion'); if (d) d.innerHTML = ''; });

// línea de cabecera del PDF: tipo de proyecto y medidas, tecnología, superficies o disposición, equipos y cifras clave
function tituloPdf(c) {
  const esp = c.esp, T = c.tot || {}, led = E.tecnologia === 'led', sala = esp.tipo === 'sala', n = c.filas.length;
  // el nombre del tipo va en mayúsculas; las medidas no (la «m» de metro no pasa a «M»)
  const su = esp.sueltas, nCen = c.filas.filter(f => f.s.central).length;   // v7.9 · central de otra medida: «1 central de A × B m + 2 laterales de C × D m»
  const tipo = sala ? `<span>${t('sala')}</span> · ${fmt(esp.ancho)} × ${fmt(esp.fondo)} × ${fmt(esp.alto)} m`
    : nCen ? `<span>${n} × ${t('pantalla')}</span> · ${nCen} ${t('central')} ${fmt(su.cAncho)} × ${fmt(su.cAlto)} m + ${n - nCen} ${t('laterales')} ${fmt(su.ancho)} × ${fmt(su.alto)} m`
    : `<span>${n > 1 ? n + ' × ' : ''}${t('pantalla')}</span> · ${fmt(su.ancho)} × ${fmt(su.alto)} m`;
  const p = [led ? t('led') : t('proy') + (c.tipoP === 'mapping' ? ' · ' + t('tp_mapping') : '')];   // v8.2 · mapping
  if (sala) p.push(...c.filas.map(f => f.nombre)); else if (n > 1) p.push(t(esp.sueltas.disp));
  if (led && c.modelo) p.push(`${fmtPx(T.cab)} × ${c.modelo.crm} (${c.modelo.pitch} mm)`);
  if (!led) { const g = new Map(); c.filas.forEach(f => g.set(f.proyector, (g.get(f.proyector) || 0) + f.p.n)); p.push([...g].map(([q, k]) => `${fmtPx(k)} × ${q.marca ? q.marca + ' ' : ''}${q.nombre}`).join(' + '));
    // v8.0 · en vertical, a una distancia fija y con el montaje elegido
    if (c.filas.some(f => f.p.vert)) p.push(t('vert'));
    if (Number(E.proy.dist) > 0) p.push(`${t('aDist', { d: fmt(E.proy.dist, 1) })}`);
    if (E.proy.oos) p.push(t('oos').toLowerCase());
    if (E.proy.montaje === 'colgado' || E.proy.montaje === 'apoyado') p.push(t('mo_' + E.proy.montaje).toLowerCase() + (Number(E.proy.altura) > 0 ? ' ' + fmt(E.proy.altura, 1) + ' m' : '')); }
  if (T.lienzoW) p.push(`${fmtPx(T.lienzoW)}×${fmtPx(T.lienzoH)} px`);
  if (led && T.kw) p.push(`${fmt(T.kw, 1)} kW`);
  if (!led && isFinite(T.nitsMin)) p.push(`${fmt(T.nitsMin, 0)} nits`);
  return `<b>${tipo}</b> · ${p.join(' · ')}`;
}
// ¿dibuja el navegador las cajas de margen de @page (pie y número en cada hoja)? Chrome, Edge y Samsung Internet sí
function cajasMargen() { try { const s = new CSSStyleSheet(); s.replaceSync('@page { @bottom-center { content: "x" } }'); const r = s.cssRules[0]; return !!(r && r.cssRules && r.cssRules.length); } catch (e) { return false; } }
function cssTxt(s) { return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ') + '"'; }
// icono del pie (engranaje con corazón) en violeta para el margen de la hoja, a partir de la misma máscara de la interfaz
function icoPie() {
  const i = document.createElement('i'); i.className = 'ic ic-footer'; document.body.appendChild(i);
  const m = (getComputedStyle(i).getPropertyValue('--m').match(/data:image\/png;base64,[A-Za-z0-9+/=]+/) || [''])[0]; i.remove();
  if (!m) return '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="3 3 58 58"><filter id="f"><feFlood flood-color="#9900ff"/><feComposite in2="SourceGraphic" operator="in"/></filter><image width="64" height="64" href="${m}" filter="url(#f)"/></svg>`;
  return `url("data:image/svg+xml;base64,${btoa(svg)}")`;
}

// vídeo o imagen propios: se cargan en el navegador (no se suben a ningún servidor) y se aplican a todas las superficies
function cargarMedio(f) {
  const url = URL.createObjectURL(f), esVideo = /^video\//.test(f.type), nombre = f.name.length > 22 ? f.name.slice(0, 20) + '…' : f.name;
  const listo = (el, w, h) => { if (medio && medio.url) URL.revokeObjectURL(medio.url); medio = { el, tipo: esVideo ? 'video' : 'img', w, h, url, nombre }; E.vista.contenido = 'propio'; actualizar(); };
  if (esVideo) { const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.src = url;
    v.addEventListener('loadedmetadata', () => { listo(v, v.videoWidth, v.videoHeight); v.play().catch(() => {}); }, { once: true }); }
  else { const im = new Image(); im.onload = () => listo(im, im.naturalWidth, im.naturalHeight); im.src = url; }
}

// ---------- textos con margen de seguridad (si no caben, se reducen) ----------
function ajustarTextos() {
  document.querySelectorAll('.tog, .sec-btn, .pri, .tar .v, .tar .t, .sup-dat span, .campo label').forEach(el => {
    if (!el.offsetWidth) return;
    const clave = el.clientWidth + '|' + el.textContent; if (el.dataset.fit === clave) return;
    el.style.removeProperty('font-size'); el.dataset.fit = clave;
    const margen = el.matches('.tog, .sec-btn, .pri') ? 8 : 0;
    let fs = parseFloat(getComputedStyle(el).fontSize), k = 0;
    const cabe = () => el.scrollWidth <= el.clientWidth + 0.5 && (!margen || anchoTexto(el) <= el.clientWidth - margen);
    while (!cabe() && fs > 8 && k++ < 24) { fs -= 0.5; el.style.setProperty('font-size', fs + 'px'); }
  });
  document.querySelectorAll('input[data-num]').forEach(i => { if (i.offsetWidth) ajustarCasilla(i); });
}
// casillas numéricas: si el valor no cabe entero, se reduce la letra (nunca se corta)
function ajustarCasilla(i) { i.style.removeProperty('font-size'); let fs = parseFloat(getComputedStyle(i).fontSize), k = 0; while (i.scrollWidth > i.clientWidth + 0.5 && fs > 10 && k++ < 14) { fs -= 0.5; i.style.setProperty('font-size', fs + 'px'); } }
function anchoTexto(el) { const r = document.createRange(); r.selectNodeContents(el); const rs = [...r.getClientRects()]; if (!rs.length) return 0; return Math.max(...rs.map(q => q.right)) - Math.min(...rs.map(q => q.left)); }
const obsTextos = new MutationObserver(() => requestAnimationFrame(ajustarTextos));
['app', 'consola'].forEach(id => obsTextos.observe(document.getElementById(id), { childList: true, subtree: true }));
window.addEventListener('resize', () => requestAnimationFrame(() => { ajustarTextos(); ajustarPh(); }));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { ajustarTextos(); ajustarPh(); });

// ---------- cabecera y arranque ----------
function pintarCabecera() {
  $('#btn-idioma').textContent = idioma().toUpperCase();
  $('#btn-idioma').title = t('idioma');
  [['#btn-inicio', 'nuevo'], ['#btn-pdf', 'pdf'], ['#btn-info', 'info']].forEach(([id, k]) => { const b = $(id); b.title = t(k); b.setAttribute('aria-label', t(k)); });
  $('.marca').title = t('nuevo');
  $('#pie').innerHTML = `SCREENS ${VERSION} ${new Date().getFullYear()} ${t('pie')} <i class="ic ic-footer" aria-hidden="true"></i> by <a href="https://mediaservi.com" target="_blank" rel="noopener">mediaservi.com</a><a class="admin-btn" href="${ADMIN_URL}" target="_blank" rel="noopener" title="${t('admin')}" aria-label="${t('admin')}"><i class="ic ic-admin" aria-hidden="true"></i></a>`;
}
fijarIdioma(idiomaInicial(), false);
pintarCabecera();
actualizar();
// uso sin conexión: el mismo service worker de la raíz (red primero, copia guardada si no hay red)
try { if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
cargarCatalogo((lista, estado) => { catalogo = lista; estadoCat = estado; if (!unaLed()) actualizar(); });
