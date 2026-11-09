// SCREENS · interfaz (selector inicial, panel de rack, simulación 3D y resultados)
import { cargarCatalogo, ordenar, enStock } from './catalogo.js';
import { superficies, distanciaPublico, elegirModelo, calcularLed, totales } from './led.js';
import { PROYECTORES, calcularPared, calcularSuelo, sugerir, SOLAPE_MAX } from './proyeccion.js';
import { t, idiomaInicial, fijarIdioma, idioma, IDIOMAS } from './i18n.js';

const VERSION = 'v6.4';
const DEF = () => ({
  paso: 'inicio', cantidad: 'varias', tecnologia: 'led',
  esp: { tipo: 'sala', ancho: 8, fondo: 6, alto: 3.5, elev: 0, altoCubierto: 0,
    paredes: { frontal: true, izquierda: true, derecha: true, trasera: false, suelo: false },
    sueltas: { n: 3, disp: 'arco', ancho: 4, alto: 2.25, elev: 0.6, sep: 0.1, angulo: 25, dist: 5 } },
  led: { clase: 'INSTALL', tipo: 'INDOOR', crm: '', ajuste: 'dentro' },
  proy: { id: '', idSuelo: '', solape: 15 },
  vista: { contenido: 'carta', etiquetas: true, camara: 'exterior' }
});
let E = DEF();
try { const g = JSON.parse(localStorage.getItem('screens_estado') || 'null'); if (g && g.esp) E = Object.assign(DEF(), g); } catch (e) {}
// el paso lo marca la dirección (#inicio / #trabajo): SCREENS es la página de inicio y el botón Atrás del navegador vuelve al selector
const pasoDeHash = () => (location.hash === '#trabajo' ? 'trabajo' : 'inicio');
E.paso = pasoDeHash();
const guardar = () => { try { localStorage.setItem('screens_estado', JSON.stringify(E)); } catch (e) {} };
let catalogo = [], estadoCat = 'cargando', escena = null, calculo = null;

const $ = (s, r = document) => r.querySelector(s);
const fmt = (v, d = 2) => Number(v || 0).toLocaleString(idioma() === 'en' ? 'en-GB' : 'es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d });
const fmtPx = (v) => Number(v || 0).toLocaleString(idioma() === 'en' ? 'en-GB' : 'es-ES');
const ICO = {
  espacio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>',
  led: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="12" rx="1"/><path d="M9 5v12M15 5v12M3 11h18M8 21h8"/></svg>',
  proy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2" y="8" width="13" height="8" rx="1.5"/><circle cx="11" cy="12" r="2.2"/><path d="M15 10l7-4v12l-7-4"/></svg>',
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
    const filas = sups.map(s => ({ s, r: calcularLed(s, modelo, E.led.ajuste), nombre: nombreSup(s), grosor }));
    return { esp, dist, modelo, lista, filas, tot: totales(filas) };
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
  return { esp, dist, proyector, prSuelo, filas, tot };
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
  return h + '</section>';
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
  h += `<p class="ayuda">${t('autoAyudaLed', { d: fmt(c.dist, 1) })}</p>`;
  h += `<div class="etq">${t('ajuste')}</div><div class="fila c2">${tog(l.ajuste === 'dentro', 'data-set="led.ajuste" data-v="dentro"', t('dentro'))}${tog(l.ajuste === 'cercano', 'data-set="led.ajuste" data-v="cercano"', t('cercano'))}</div><p class="ayuda">${t('ajusteAyuda')}</p>`;
  return h + '</section>';
}
function modProy(c) {
  const p = E.proy, sel = c.proyector, haySuelo = c.filas.some(f => f.s.tipo === 'suelo');
  const opt = (idSel) => PROYECTORES.map(q => `<option value="${q.id}"${q.id === idSel ? ' selected' : ''}>${q.nombre} · ${fmtPx(q.lumens)} lm</option>`).join('');
  let h = `<section class="mod"><div class="mod-tit">${ICO.proy}${t('proyMod')}<button type="button" class="sec-btn reset" data-accion="reset-proy">${t('restablecer')}</button></div>`;
  h += campo(t('proyector'), `<select class="sel" data-sel="proy.id"><option value="">${t('auto')}${!p.id && sel ? ' · ' + sel.nombre : ''}</option>${opt(p.id)}</select>`);
  if (sel) h += `<p class="ayuda mono">${sel.marca} ${sel.nombre} · ${fmtPx(sel.lumens)} lm · ${sel.resX}×${sel.resY} · ${sel.arTxt} · TR ${sel.trMin === sel.trMax ? sel.trMin : sel.trMin + '–' + sel.trMax}:1</p>`;
  if (haySuelo) h += campo(t('proySuelo'), `<select class="sel" data-sel="proy.idSuelo"><option value="">= ${t('proyector')}</option>${opt(p.idSuelo)}</select>`);
  h += `<div class="etq">${t('solape')}</div><div class="fila c3">${[15, 20, 25].map(v => tog(p.solape === v, `data-set="proy.solape" data-v="${v}" data-num-v="1"`, v + ' %')).join('')}</div>`;
  h += `<p class="ayuda">${t('autoAyudaProy')}</p><p class="aviso">${t('datosProy')}</p>`;
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
      ${c.filas.map(f => `<tr><td>${f.nombre}</td><td>${fmt(f.r.ancho)} × ${fmt(f.r.alto)} m</td><td>${f.r.cols}×${f.r.rows} = ${f.r.cab}</td><td>${f.r.resW}×${f.r.resH}</td><td>${fmt(f.r.peso, 0)} kg</td><td>${fmt(f.r.kw, 2)} kW</td><td>${f.r.lineas}</td></tr>`).join('')}
    </tbody></table></div>`;
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
  }
  return h;
}

function vistaTrabajo() {
  return `<div class="trabajo"><aside class="panel" id="panel"></aside><main class="vista">
    <div class="escena" id="escena"><canvas id="lienzo3d" aria-label="Simulación 3D"></canvas>
      <div class="esc-barra"><div id="esc-vistas"></div><div id="esc-cont"></div></div>
      <div class="esc-info">${t('vista3d')}</div></div>
    <div class="res" id="res"></div></main></div>`;
}
function barraEscena() {
  const v = E.vista;
  $('#esc-vistas').innerHTML = ['exterior', 'interior', 'planta'].map(k => tog(v.camara === k, `data-cam="${k}"`, t(k))).join('');
  $('#esc-cont').innerHTML = ['carta', 'panorama', 'apagado'].map(k => tog(v.contenido === k, `data-set="vista.contenido" data-v="${k}"`, t(k))).join('') + tog(v.etiquetas, 'data-accion="etiquetas"', t('etiquetas'));
}

// ---------- ciclo ----------
let tEsc = 0;
function actualizar(sinEscena) {
  guardar();
  const app = $('#app');
  if (E.paso === 'inicio') { app.innerHTML = vistaInicio(); escena = null; return; }
  if (!$('#panel')) { app.innerHTML = vistaTrabajo(); crearEscena(); }
  calculo = calcular();
  const pan = $('#panel'), sc = pan.scrollTop;
  pan.innerHTML = modEspacio() + (E.tecnologia === 'led' ? modLed(calculo) : modProy(calculo)) + modSuperficies(calculo);
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
    sala, tecnologia: E.tecnologia, contenido: E.vista.contenido, etiquetas: E.vista.etiquetas,
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
  if (b.dataset.set) { fijar(b.dataset.set, b.dataset.numV ? Number(b.dataset.v) : b.dataset.v);
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
  if (a === 'reset-esp') { E.esp = DEF().esp; actualizar(); return; }
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
  const s = ev.target; if (s.dataset.sel) { fijar(s.dataset.sel, s.value); actualizar(); }
});

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
  $('#btn-inicio').title = t('inicio');
  $('#pie').innerHTML = `SCREENS ${VERSION} ${new Date().getFullYear()} ${t('pie')} <i class="ic ic-footer" aria-hidden="true"></i> by <a href="https://mediaservi.com" target="_blank" rel="noopener">mediaservi.com</a>`;
}
window.addEventListener('hashchange', () => { const p = pasoDeHash(); if (p !== E.paso) { E.paso = p; actualizar(); } });
fijarIdioma(idiomaInicial(), false);
pintarCabecera();
actualizar();
// uso sin conexión: el mismo service worker de la raíz (red primero, copia guardada si no hay red)
try { if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('../sw.js').catch(() => {}); } catch (e) {}
cargarCatalogo((lista, estado) => { catalogo = lista; estadoCat = estado; if (E.paso === 'trabajo') actualizar(); });
