// SCREENS · interfaz (selector inicial, panel de rack, simulación 3D y resultados)
import { cargarCatalogo, ordenar, enStock } from './catalogo.js';
import { superficies, distanciaPublico, elegirModelo, calcularLed, totales, aplicarPuertas, obstaculoMundo, puertaMundo } from './led.js';
import { PROYECTORES, calcularPared, calcularSuelo, sugerir, SOLAPE_MAX, analizarSombras, obstaculosEnHaces } from './proyeccion.js';
import '../comun/electronica.js';
import '../comun/ficha.js';
import { t, idiomaInicial, fijarIdioma, idioma, IDIOMAS } from './i18n.js';

const VERSION = 'v6.6';
const ELEC = globalThis.SC_ELEC, { fichaHTML } = globalThis.SC_FICHA;
const DEF = () => ({
  paso: 'inicio', cantidad: 'varias', tecnologia: 'led',
  esp: { tipo: 'sala', ancho: 8, fondo: 6, alto: 3.5, elev: 0, altoCubierto: 0,
    paredes: { frontal: true, izquierda: true, derecha: true, trasera: false, suelo: false },
    sueltas: { n: 3, disp: 'arco', ancho: 4, alto: 2.25, elev: 0.6, sep: 0.1, angulo: 25, dist: 5 },
    obst: [] },
  led: { clase: 'INSTALL', tipo: 'INDOOR', crm: '', ajuste: 'dentro' },
  proy: { id: '', idSuelo: '', solape: 15 },
  elec: { backup: false, escalador: 'con', conexion: 'directo', sel: '', marca: 'todos', dante: false, selMedia: '' },
  vista: { contenido: 'carta', etiquetas: true, camara: 'exterior', zona: true, modo: 'continuo' }
});
let E = DEF();
try { const g = JSON.parse(localStorage.getItem('screens_estado') || 'null'); if (g && g.esp) { const d = DEF(); E = Object.assign(d, g, { elec: Object.assign(d.elec, g.elec || {}), vista: Object.assign(d.vista, g.vista || {}) }); } } catch (e) {}
// el paso lo marca la dirección (#inicio / #trabajo): SCREENS es la página de inicio y el botón Atrás del navegador vuelve al selector
const pasoDeHash = () => (location.hash === '#trabajo' ? 'trabajo' : 'inicio');
E.paso = pasoDeHash();
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
  sup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  una: '<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="4" width="32" height="19" rx="1"/><path d="M18 28h12M24 23v5"/></svg>',
  varias: '<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8l10 3v15L4 23z"/><path d="M14 11h20v15H14z"/><path d="M34 11l10-3v15l-10 3"/></svg>',
  ledG: '<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="36" height="22" rx="1"/><path d="M15 4v22M24 4v22M33 4v22M6 11.3h36M6 18.6h36"/></svg>',
  proyG: '<svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="12" width="16" height="10" rx="2"/><circle cx="14" cy="17" r="3"/><path d="M19 13l26-9v26l-26-9" stroke-dasharray="3 2"/></svg>'
};

// ---------- cálculo ----------
function listaLed() {
  return ordenar(catalogo.filter(m => m.class === E.led.clase && m.tipo === E.led.tipo));
}
function nombreSup(s) { return s.tipo === 'pantalla' ? `${t('pantalla')} ${s.num}` : t(s.id); }
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
  const paredesS = sups.filter(s => s.tipo !== 'suelo');
  const alc = paredesS.map(s => alcance(esp, s, dist));
  const opc = { solapeMin: E.proy.solape / 100 };
  const proyector = (E.proy.id && PROYECTORES.find(p => p.id === E.proy.id)) || sugerir(paredesS, alc, opc);
  const prSuelo = (E.proy.idSuelo && PROYECTORES.find(p => p.id === E.proy.idSuelo)) || proyector;
  const filas = sups.map(s => {
    if (s.tipo === 'suelo') return { s, p: calcularSuelo(s, prSuelo, { altoSala: esp.alto, ...opc }), proyector: prSuelo, nombre: nombreSup(s) };
    return { s, p: calcularPared(s, proyector, { alcance: alcance(esp, s, dist), ...opc }), proyector, nombre: nombreSup(s) };
  });
  const tot = { n: 0, lumenes: 0, nitsMin: Infinity, lienzoW: 0, lienzoH: 0 };
  filas.forEach(f => { tot.n += f.p.n; tot.lumenes += f.p.n * f.proyector.lumens; tot.nitsMin = Math.min(tot.nitsMin, f.p.nits); if (f.s.tipo !== 'suelo') { tot.lienzoW += f.p.resW; tot.lienzoH = Math.max(tot.lienzoH, f.p.resH); } });
  const c = { esp, dist, proyector, prSuelo, filas, tot };
  const altoEsc = esp.tipo === 'sala' ? esp.alto : Math.max(3, ...filas.map(f => f.s.elev + f.s.alto)) + 0.8;
  c.sombras = analizarSombras(filas, esp, altoEsc);
  c.sombras.obst = obstaculosEnHaces(obstaculosDe(esp), c.sombras.haces);
  c.elec = electronica(c); return c;
}
// puertas (solo en sala, en paredes) y obstáculos del espacio
const puertasDe = (esp) => (esp.tipo === 'sala' ? (esp.obst || []).filter(o => o.tipo === 'puerta') : []);
const obstaculosDe = (esp) => (esp.obst || []).filter(o => o.tipo === 'obstaculo').map(o => obstaculoMundo(o, esp));
// Electrónica de control (LED) y mediaserver (LED y proyección) con el motor común de SCREENCALC
function electronica(c) {
  const e = E.elec, out = { procesadores: [], proc: null, medias: [], media: null, need: 0 };
  if (E.tecnologia === 'led' && c.tot) {
    let L = 1; c.filas.forEach(f => { if (f.r) { f.lin = [L, L + f.r.lineas - 1]; L += f.r.lineas; } });
    out.procesadores = ELEC.calcularElectronicas({ lines: c.tot.lineas, totalPix: c.tot.pix }, { backup: e.backup, escalador: e.escalador, conexion: e.conexion, entradas: 0 }, []);
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
const numIn = (k, val, uni, paso = 0.1, min = 0, max = 60) => `<div class="num"><input type="number" inputmode="decimal" data-num="${k}" value="${val}" step="${paso}" min="${min}" max="${max}"><span>${uni}</span></div>`;
const campo = (lab, html) => `<div class="campo"><label>${lab}</label>${html}</div>`;

function vistaInicio() {
  return `<section class="inicio"><div class="inicio-caja">
    <h1>${t('titulo')}</h1><p class="lema">${t('lema')}</p>
    <div class="paso"><span>${t('cuantas')}</span><div class="opc">
      ${tog(E.cantidad === 'una', 'data-set="cantidad" data-v="una"', `${ICO.una}<b>${t('una')}</b><small>${t('unaD')}</small>`)}
      ${tog(E.cantidad === 'varias', 'data-set="cantidad" data-v="varias"', `${ICO.varias}<b>${t('varias')}</b><small>${t('variasD')}</small>`)}
    </div></div>
    <div class="paso"><span>${t('tecno')}</span><div class="opc">
      ${tog(E.tecnologia === 'led', 'data-set="tecnologia" data-v="led"', `${ICO.ledG}<b>${t('led')}</b><small>${t('ledD')}</small>`)}
      ${tog(E.tecnologia === 'proy', 'data-set="tecnologia" data-v="proy"', `${ICO.proyG}<b>${t('proy')}</b><small>${t('proyD')}</small>`)}
    </div></div>
    <div class="inicio-pie"><button type="button" class="pri" data-accion="empezar">${E.cantidad === 'una' && E.tecnologia === 'led' ? t('irSc') : t('empezar')}</button></div>
  </div></section>`;
}

// ---------- fichas de equipo (componente común comun/ficha.js) ----------
// los textos del motor común de electrónica están en castellano: aquí se pasan a inglés o catalán
const MOTOR = {
  en: [[/Chasis \(mainframe\)/g, 'Chassis (mainframe)'], [/Tarjeta de salida/g, 'Output card'], [/Tarjeta salida/g, 'Output card'], [/Tarjeta de entrada/g, 'Input card'], [/Tarjeta entrada/g, 'Input card'], [/Tarjeta base/g, 'Base card'],
    [/de previo \/ monitorización \(recomendada\)/g, 'preview / monitoring (recommended)'], [/\(mínima del equipo\)/g, '(minimum for the unit)'], [/Conv\. fibra→10 RJ45 multimodo \(incluye sus módulos SFP\+\)/g, 'Fibre→10 RJ45 multimode converter (SFP+ modules included)'],
    [/Conv\. fibra→10 RJ45 \(pantalla\)/g, 'Fibre→10 RJ45 converter (screen)'], [/Módulo SFP\+ 10G multimodo \(puertos de la tarjeta de salida\)/g, '10G SFP+ multimode module (output card ports)'], [/serie MX/g, 'MX series'], [/multimodo/g, 'multimode'],
    [/no disponible en este chasis: verificar con el fabricante/g, 'not available for this chassis: check with the manufacturer'], [/líneas?/g, m => m === 'línea' ? 'line' : 'lines'], [/fibras?/g, m => m === 'fibra' ? 'fibre' : 'fibres'], [/\(de /g, '(of '], [/proyecto/g, 'project'],
    [/salidas?/g, m => m === 'salida' ? 'output' : 'outputs'], [/entradas?/g, m => m === 'entrada' ? 'input' : 'inputs'], [/capas?/g, m => m === 'capa' ? 'layer' : 'layers'], [/hasta/g, 'up to'], [/ o /g, ' or '], [/ y /g, ' and '], [/Como /g, 'Like '],
    [/sincronismo, cascada y backup entre equipos/g, 'sync, cascade and backup between units'], [/backup de equipo/g, 'unit backup'], [/ranura/g, 'slot'], [/con escalador/g, 'with scaler']],
  ca: [[/Chasis \(mainframe\)/g, 'Xassís (mainframe)'], [/Tarjeta de salida/g, 'Targeta de sortida'], [/Tarjeta salida/g, 'Targeta sortida'], [/Tarjeta de entrada/g, "Targeta d'entrada"], [/Tarjeta entrada/g, 'Targeta entrada'], [/Tarjeta base/g, 'Targeta base'],
    [/de previo \/ monitorización \(recomendada\)/g, 'de previ / monitoratge (recomanada)'], [/\(mínima del equipo\)/g, "(mínima de l'equip)"], [/Conv\. fibra→10 RJ45 multimodo \(incluye sus módulos SFP\+\)/g, 'Conv. fibra→10 RJ45 multimode (inclou els mòduls SFP+)'],
    [/Conv\. fibra→10 RJ45 \(pantalla\)/g, 'Conv. fibra→10 RJ45 (pantalla)'], [/Módulo SFP\+ 10G multimodo \(puertos de la tarjeta de salida\)/g, 'Mòdul SFP+ 10G multimode (ports de la targeta de sortida)'], [/multimodo/g, 'multimode'],
    [/no disponible en este chasis: verificar con el fabricante/g, 'no disponible en aquest xassís: verificar amb el fabricant'], [/líneas?/g, m => m === 'línea' ? 'línia' : 'línies'], [/proyecto/g, 'projecte'],
    [/salidas?/g, m => m === 'salida' ? 'sortida' : 'sortides'], [/entradas?/g, m => m === 'entrada' ? 'entrada' : 'entrades'], [/capas?/g, m => m === 'capa' ? 'capa' : 'capes'], [/hasta/g, 'fins a'], [/ y /g, ' i '], [/Como /g, 'Com '],
    [/sincronismo, cascada y backup entre equipos/g, 'sincronisme, cascada i backup entre equips'], [/backup de equipo/g, "backup d'equip"], [/ranura/g, 'ranura'], [/con escalador/g, 'amb escalador']]
};
const trMotor = (txt) => { let r = String(txt || ''); (MOTOR[idioma()] || []).forEach(([a, b]) => { r = r.replace(a, b); }); return r; };
function fichaCab(m) {
  return fichaHTML({ cat: t('fCab'), icono: 'led', marca: m.family || '', modelo: m.crm, foto: m.urlFoto, acento: '#b566ff', stock: enStock(m),
    specs: [[t('kPitch'), m.pitch + ' mm'], [t('kCab'), `${m.cabAncho}×${m.cabAlto}${m.thick ? '×' + m.thick : ''} mm`], [t('kPx'), `${m.cabPixAncho}×${m.cabPixAlto}`], [t('kNits'), m.nits ? m.nits + ' nits' : ''], [t('kHz'), m.hz ? m.hz + ' Hz' : ''],
      [t('kKg'), m.cabKg ? fmt(m.cabKg, 1) + ' kg' : ''], [t('kW'), m.wMax ? fmt(m.wMax, 0) + ' W' : ''], [t('kCard'), m.card || ''], [t('kTech'), m.tech || '']],
    enlace: m.crm ? 'https://traulux.net/buscar/?q=' + encodeURIComponent(m.crm) : '', enlaceTxt: t('fichaFab') });
}
function fichaProy(q, cat) {
  return fichaHTML({ cat, icono: 'proy', marca: q.marca, modelo: q.nombre, foto: q.imagen, acento: '#00b4ff',
    specs: [[t('kTR'), (q.trMin === q.trMax ? q.trMin : q.trMin + '–' + q.trMax) + ':1'], [t('kLm'), fmtPx(q.lumens) + ' lm'], [t('kFmt'), q.arTxt], [t('kRes'), q.resX + '×' + q.resY], [t('kDiag'), q.maxDiagPulg + '"'], [t('k4k'), q.k4 ? 'Enhancement' : '—']] });
}
function fichaProc(x) {
  return fichaHTML({ cat: t('procesador'), icono: 'elec', marca: x.marca, modelo: x.modelo, foto: x.front, acento: '#00ff04', stock: x.enStock ? true : null,
    specs: [[t('puertos'), trMotor(x.puertos)], [t('capacidad'), trMotor(x.capacidad)], [t('kEsc'), x.escalador ? t('si') : t('no')]],
    piezas: (x.equipos || []).map(q => ({ cant: q.cant, ref: q.ref, desc: trMotor(q.desc) })), enlace: x.url, enlaceTxt: t('fichaFab') });
}
function fichaMedia(m, need, led) {
  return fichaHTML({ cat: t('mediaserver'), icono: 'media', marca: m.marca, modelo: m.modelo, foto: m.front, acento: '#ffb000',
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
  } else {
    if (E.cantidad === 'varias') h += `<div class="fila c2">${campo(t('num'), numIn('esp.sueltas.n', s.n, 'u', 1, 2, 8))}<div class="campo"><label>${t('disp')}</label><div class="fila c2">${tog(s.disp === 'linea', 'data-set="esp.sueltas.disp" data-v="linea"', t('linea'))}${tog(s.disp === 'arco', 'data-set="esp.sueltas.disp" data-v="arco"', t('arco'))}</div></div></div>`;
    h += `<div class="fila c3">${campo(t('ancho'), numIn('esp.sueltas.ancho', s.ancho, 'm', 0.1, 0.3, 40))}${campo(t('alto'), numIn('esp.sueltas.alto', s.alto, 'm', 0.1, 0.3, 20))}${campo(t('elev'), numIn('esp.sueltas.elev', s.elev, 'm', 0.1, 0, 10))}</div>`;
    h += `<div class="fila ${E.cantidad === 'varias' ? (s.disp === 'arco' ? 'c3' : 'c2') : 'c1'}">${E.cantidad === 'varias' ? campo(t('sep'), numIn('esp.sueltas.sep', s.sep, 'm', 0.05, 0, 10)) : ''}${E.cantidad === 'varias' && s.disp === 'arco' ? campo(t('angulo'), numIn('esp.sueltas.angulo', s.angulo, '°', 1, 0, 90)) : ''}${campo(t('dist'), numIn('esp.sueltas.dist', s.dist, 'm', 0.1, 0.5, 100))}</div>`;
  }
  h += bloqueObst(sala);
  return h + '</section>';
}
// puertas y obstáculos: cada uno en una fila con sus medidas y un botón para quitarlo
function bloqueObst(sala) {
  const e = E.esp, L = e.obst || [];
  let h = `<div class="etq">${t('obstTit')}</div><div class="fila ${sala ? 'c2' : 'c1'}">${sala ? `<button type="button" class="sec-btn" data-accion="obst-add" data-tipo="puerta">＋ ${t('puerta')}</button>` : ''}<button type="button" class="sec-btn" data-accion="obst-add" data-tipo="obstaculo">＋ ${t('obst')}</button></div>`;
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
  const p = E.proy, sel = c.proyector, haySuelo = c.filas.some(f => f.s.tipo === 'suelo');
  const opt = (idSel) => PROYECTORES.map(q => `<option value="${q.id}"${q.id === idSel ? ' selected' : ''}>${q.nombre} · ${fmtPx(q.lumens)} lm</option>`).join('');
  let h = `<section class="mod"><div class="mod-tit">${ICO.proy}${t('proyMod')}<button type="button" class="sec-btn reset" data-accion="reset-proy">${t('restablecer')}</button></div>`;
  h += campo(t('proyector'), `<select class="sel" data-sel="proy.id"><option value="">${t('auto')}${!p.id && sel ? ' · ' + sel.nombre : ''}</option>${opt(p.id)}</select>`);
  if (sel) h += fichaProy(sel, t('fProy'));
  if (haySuelo) { h += campo(t('proySuelo'), `<select class="sel" data-sel="proy.idSuelo"><option value="">= ${t('proyector')}</option>${opt(p.idSuelo)}</select>`); if (c.prSuelo && c.prSuelo !== sel) h += fichaProy(c.prSuelo, t('fProySuelo')); }
  h += `<div class="etq">${t('solape')}</div><div class="fila c3">${[15, 20, 25].map(v => tog(p.solape === v, `data-set="proy.solape" data-v="${v}" data-num-v="1"`, v + ' %')).join('')}</div>`;
  h += `<p class="ayuda">${t('autoAyudaProy')}</p><p class="aviso">${t('datosProy')}</p>`;
  return h + '</section>';
}
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
    const tiros = c.filas.filter(f => f.s.tipo !== 'suelo').map(f => f.p.tiro);
    h += `<div class="res-tot">
      ${tarjeta(t('proyectores'), fmtPx(T.n), '', p.nombre, '#b566ff')}
      ${tarjeta(t('lienzo'), `${fmtPx(T.lienzoW)}×${fmtPx(T.lienzoH)}`, 'px', t('lienzoAyuda'), '#00b4ff')}
      ${tarjeta(t('brillo'), fmt(T.nitsMin === Infinity ? 0 : T.nitsMin, 0), 'nits', t('brilloAyuda'), '#ffb000')}
      ${tarjeta(t('lumenes'), fmtPx(T.lumenes), 'lm', '', '#e100ff')}
      ${tarjeta(t('tiro'), tiros.length ? fmt(Math.max(...tiros), 2) : '—', 'm', `TR ${p.trMin}:1`, '#00ff04')}
      ${tarjeta(t('salidas'), fmtPx(T.n), '', 'mediaserver', '#ff4d5e')}
    </div>`;
    h += `<div class="tabla-caja"><table class="tabla"><thead><tr><th>${t('supCol')}</th><th>${t('medida')}</th><th>${t('proyCol')}</th><th>${t('resol')}</th><th>${t('solCol')}</th><th>${t('tiroCol')}</th><th>${t('brCol')}</th></tr></thead><tbody>
      ${c.filas.map(f => { const q = f.p; return `<tr><td>${f.nombre}</td><td>${fmt(f.s.ancho)} × ${fmt(f.s.alto)} m</td><td>${q.cols ? q.cols + '×' + q.rows + ' = ' : ''}${q.n}</td><td>${q.resW}×${q.resH}</td><td>${fmt(q.solapeRel * 100, 0)} %</td><td>${fmt(q.tiro, 2)} m${q.fuera ? ' ⚠' : ''}</td><td>${fmt(q.nits, 0)} nits</td></tr>`; }).join('')}
    </tbody></table></div>`;
    h += vistaSombras(c);
  }
  h += vistaElec(c);
  return h;
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
  S.movs.forEach(k => li.push(`<li>${t(k.dy ? (k.dy > 0 ? 'movArriba' : 'movAbajo') : 'movLado', { a: k.h.nombre + ' P' + (k.h.i + 1), d: fmt(Math.abs(k.dy || k.dx), 2), b: k.con ? k.con.nombre + ' P' + (k.con.i + 1) : '' })}</li>`));
  S.choques.forEach(k => li.push(`<li class="mal">${t('choque', { a: k.h.nombre + ' P' + (k.h.i + 1), b: k.con ? k.con.nombre + ' P' + (k.con.i + 1) : '' })}</li>`));
  if (S.movs.length || S.choques.length) li.push(`<li>${t('holgura')}</li>`);
  S.cruces.forEach(k => li.push(`<li>${t('cruce', { a: k.na, b: k.nb })}</li>`));
  (S.obst || []).forEach(k => li.push(`<li class="mal">${t('obstSombra', { k: k.k + 1, n: k.nombres.join(' · ') })}</li>`));
  puertasDe(c.esp).forEach((p, i) => { const f = c.filas.find(x => x.s.id === p.pared); if (f) li.push(`<li>${t('puertaProy', { n: f.nombre })}</li>`); });
  if (!S.conflictos.length && !S.cruces.length && !S.choques.length && !(S.obst || []).length) li.push(`<li class="ok">${t('sinProblemas')}</li>`);
  return `<section class="res-sec"><div class="res-tit"><span class="cinta-ico" aria-hidden="true"></span>${t('segTit')}</div><ul class="avisos">${li.join('')}</ul></section>`;
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
function actualizar(sinEscena) {
  guardar();
  const app = $('#app');
  $('#btn-pdf').hidden = E.paso === 'inicio';
  if (E.paso === 'inicio') { app.innerHTML = vistaInicio(); escena = null; return; }
  if (!$('#panel')) { app.innerHTML = vistaTrabajo(); crearEscena(); }
  calculo = calcular();
  const pan = $('#panel'), sc = pan.scrollTop;
  pan.innerHTML = modEspacio() + (E.tecnologia === 'led' ? modLed(calculo) : modProy(calculo)) + modElec(calculo) + modSuperficies(calculo);
  pan.scrollTop = sc;
  $('#res').innerHTML = vistaResultados(calculo);
  barraEscena();
  if (!sinEscena) { clearTimeout(tEsc); tEsc = setTimeout(construirEscena, 60); }
}
function construirEscena() {
  if (!escena || !calculo) return;
  const c = calculo, sala = c.esp.tipo === 'sala' ? { ancho: c.esp.ancho, fondo: c.esp.fondo, alto: c.esp.alto } : null;
  const xs = c.filas.map(f => Math.abs(f.s.x) + f.s.ancho / 2), zs = c.filas.map(f => Math.abs(f.s.z));
  escena.construir({
    sala, tecnologia: E.tecnologia, contenido: E.vista.contenido, etiquetas: E.vista.etiquetas, medio: medio ? { ...medio, modo: E.vista.modo } : null,
    sombras: E.tecnologia === 'proy' && E.vista.zona ? c.sombras : null, haces: c.sombras ? c.sombras.haces : null,
    puertas: puertasDe(c.esp).map(p => puertaMundo(p, c.esp)), obstaculos: obstaculosDe(c.esp), obstTapa: new Set(c.sombras && c.sombras.obst ? c.sombras.obst.map(x => x.k) : []),
    conflictos: new Set(E.tecnologia === 'proy' && c.sombras ? c.sombras.conflictos.map(k => k.tapa.sup + ':' + k.tapa.i).concat(c.sombras.choques.map(k => k.h.sup + ':' + k.h.i)) : []),
    superficies: c.filas, distPublico: c.dist, extX: Math.max(4, ...xs) * 2, extZ: Math.max(2, ...zs, c.dist),
    altoMax: Math.max(2, ...c.filas.map(f => f.s.elev + f.s.alto))
  });
}
async function crearEscena() {
  const lienzo = $('#lienzo3d');
  try {
    const { Escena } = await import('./escena.js');
    escena = new Escena(lienzo);
    escena.vistaActual = E.vista.camara === 'interior' ? 'dentro' : E.vista.camara;
    construirEscena();
  } catch (err) {
    console.error(err);
    $('#escena').insertAdjacentHTML('beforeend', `<div class="esc-aviso">${t('sinWebgl')}</div>`);
  }
}

// ---------- eventos ----------
function fijar(ruta, valor) { const p = ruta.split('.'); let o = E; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = valor; }
document.addEventListener('click', (ev) => {
  const b = ev.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.set) { fijar(b.dataset.set, b.dataset.bool ? b.dataset.v === '1' : b.dataset.numV ? Number(b.dataset.v) : b.dataset.v);
    if (/^elec\.(backup|escalador|conexion)$/.test(b.dataset.set)) E.elec.sel = '';
    if (b.dataset.set === 'elec.marca') E.elec.selMedia = '';
    if (b.dataset.set === 'led.clase' || b.dataset.set === 'led.tipo') E.led.crm = '';
    if (b.dataset.set === 'tecnologia' || b.dataset.set === 'cantidad') { const pe = $('.inicio-pie .pri'); if (E.paso === 'inicio') { actualizar(); return; } void pe; }
    actualizar(b.dataset.set === 'esp.sueltas.disp' ? false : false); return; }
  if (b.dataset.pared) { E.esp.paredes[b.dataset.pared] = !E.esp.paredes[b.dataset.pared]; actualizar(); return; }
  if (b.dataset.cam) { E.vista.camara = b.dataset.cam; if (escena) escena.vista(b.dataset.cam === 'interior' ? 'dentro' : b.dataset.cam); barraEscena(); guardar(); return; }
  const a = b.dataset.accion;
  if (a === 'empezar') {
    if (E.cantidad === 'una' && E.tecnologia === 'led') { try { sessionStorage.setItem('screens_una', '1'); } catch (e) {} guardar(); location.href = '../'; return; }
    location.hash = 'trabajo'; return;
  }
  if (a === 'inicio') { if (location.hash !== '#inicio') location.hash = 'inicio'; else { E.paso = 'inicio'; actualizar(); } return; }
  if (a === 'idioma') { fijarIdioma(IDIOMAS[(IDIOMAS.indexOf(idioma()) + 1) % IDIOMAS.length]); pintarCabecera(); const p = E.paso; if (p === 'trabajo') { $('#app').innerHTML = ''; } actualizar(); return; }
  if (a === 'etiquetas') { E.vista.etiquetas = !E.vista.etiquetas; actualizar(); return; }
  if (a === 'zona') { E.vista.zona = !E.vista.zona; actualizar(); return; }
  if (a === 'subir') { const f = $('#medio-archivo'); if (f) f.click(); return; }
  if (a === 'pdf') { imprimir(); return; }
  if (a === 'elec-dante') { E.elec.dante = !E.elec.dante; E.elec.selMedia = ''; actualizar(); return; }
  if (a === 'reset-elec') { E.elec = DEF().elec; actualizar(); return; }
  if (a === 'reset-esp') { E.esp = DEF().esp; actualizar(); return; }
  if (a === 'obst-add') { const e = E.esp; e.obst = e.obst || [];
    e.obst.push(b.dataset.tipo === 'puerta' ? { tipo: 'puerta', pared: e.paredes.trasera ? 'trasera' : 'frontal', x: 0.4, ancho: 0.9, alto: 2.1 }
      : { tipo: 'obstaculo', x: e.tipo === 'sala' ? e.ancho * 0.3 : 1.5, z: e.tipo === 'sala' ? e.fondo * 0.35 : 2, ancho: 0.4, fondo: 0.4, alto: e.tipo === 'sala' ? e.alto : 3 });
    actualizar(); return; }
  if (a === 'obst-del') { E.esp.obst.splice(Number(b.dataset.i), 1); actualizar(); return; }
  if (a === 'reset-led') { E.led = DEF().led; actualizar(); return; }
  if (a === 'reset-proy') { E.proy = DEF().proy; actualizar(); return; }
});
let tNum = 0;
document.addEventListener('input', (ev) => {
  const i = ev.target; if (!i.dataset.num) return;
  const v = parseFloat(String(i.value).replace(',', '.'));
  if (isNaN(v)) return;
  const min = parseFloat(i.min), max = parseFloat(i.max);
  fijar(i.dataset.num, Math.min(isNaN(max) ? v : max, Math.max(isNaN(min) ? v : min, i.step === '1' ? Math.round(v) : v)));
  clearTimeout(tNum); tNum = setTimeout(() => { const foco = i.dataset.num, pos = i.selectionStart; actualizar(); const n = document.querySelector(`[data-num="${foco}"]`); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } }, 350);
});
document.addEventListener('change', (ev) => {
  const s = ev.target;
  if (s.id === 'medio-archivo' && s.files && s.files[0]) { cargarMedio(s.files[0]); return; }
  if (s.dataset.sel) { fijar(s.dataset.sel, s.value); actualizar(); }
});

// PDF: hoja A4 en claro con cabecera, captura 3D, resultados, equipos, electrónica y avisos (se imprime con el navegador)
function imprimir() {
  const c = calculo; if (!c || !c.filas.length) return;
  const esp = c.esp, hoy = new Date(), fecha = hoy.toLocaleDateString(idioma() === 'en' ? 'en-GB' : 'es-ES') + ' · ' + hoy.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const titulo = esp.tipo === 'sala' ? `${t('sala')} · ${fmt(esp.ancho)} × ${fmt(esp.fondo)} × ${fmt(esp.alto)} m` : `${c.filas.length} × ${t('pantalla')} · ${fmt(esp.sueltas.ancho)} × ${fmt(esp.sueltas.alto)} m`;
  let h = `<header class="im-cab"><img class="im-logo" src="../assets/screens-logo.svg" alt="SCREENS"><div class="im-tit"><b>${titulo}</b><span>${E.tecnologia === 'led' ? t('led') : t('proy')} · ${c.filas.map(f => f.nombre).join(' · ')}</span></div><div class="im-der"><img src="../assets/avhub-logo.svg" alt="AVHUB"><span>${fecha}</span></div></header>`;
  if (escena) h += `<figure class="im-captura"><img src="${escena.captura(true)}" alt=""></figure>`;
  h += `<div class="im-res">${vistaResultados(c)}</div>`;
  const fichas = E.tecnologia === 'led' ? (c.modelo ? [fichaCab(c.modelo)] : []) : [fichaProy(c.proyector, t('fProy'))].concat(c.prSuelo && c.prSuelo !== c.proyector && c.filas.some(f => f.s.tipo === 'suelo') ? [fichaProy(c.prSuelo, t('fProySuelo'))] : []);
  if (fichas.length) h += `<section class="res-sec"><div class="res-tit">${t('equipos')}</div><div class="fichas">${fichas.join('')}</div></section>`;
  h += `<p class="im-aviso">${t('avisoPdf')}</p><footer class="im-pie">SCREENS ${VERSION} ${hoy.getFullYear()} ${t('pie')} <i class="ic ic-footer" aria-hidden="true"></i> by mediaservi.com · screens.mediaservi.com</footer>`;
  const d = $('#impresion'); d.innerHTML = h;
  // fotos sin carga diferida (el bloque está oculto en pantalla) y, como mucho, 3 s de espera
  const imgs = [...d.querySelectorAll('img')]; imgs.forEach(i => { i.loading = 'eager'; });
  const espera = Promise.all(imgs.map(i => (i.complete ? 1 : new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); }))));
  Promise.race([espera, new Promise(r => setTimeout(r, 3000))]).then(() => setTimeout(() => window.print(), 60));
}
window.addEventListener('afterprint', () => { const d = $('#impresion'); if (d) d.innerHTML = ''; });

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
}
function anchoTexto(el) { const r = document.createRange(); r.selectNodeContents(el); const rs = [...r.getClientRects()]; if (!rs.length) return 0; return Math.max(...rs.map(q => q.right)) - Math.min(...rs.map(q => q.left)); }
new MutationObserver(() => requestAnimationFrame(ajustarTextos)).observe(document.getElementById('app'), { childList: true, subtree: true });
window.addEventListener('resize', () => requestAnimationFrame(ajustarTextos));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarTextos);

// ---------- cabecera y arranque ----------
function pintarCabecera() {
  $('#btn-idioma').textContent = idioma().toUpperCase();
  $('#btn-idioma').title = t('idioma');
  $('#btn-inicio').title = t('inicio'); $('#btn-pdf').title = t('pdf');
  $('#pie').innerHTML = `SCREENS ${VERSION} ${new Date().getFullYear()} ${t('pie')} <i class="ic ic-footer" aria-hidden="true"></i> by <a href="https://mediaservi.com" target="_blank" rel="noopener">mediaservi.com</a>`;
}
window.addEventListener('hashchange', () => { const p = pasoDeHash(); if (p !== E.paso) { E.paso = p; actualizar(); } });
fijarIdioma(idiomaInicial(), false);
pintarCabecera();
actualizar();
// uso sin conexión: el mismo service worker de la raíz (red primero, copia guardada si no hay red)
try { if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('../sw.js').catch(() => {}); } catch (e) {}
cargarCatalogo((lista, estado) => { catalogo = lista; estadoCat = estado; if (E.paso === 'trabajo') actualizar(); });
