// SCREENS · simulación 3D renderizada (three.js r160).
// Sala con suelo y paredes, pantallas LED con su rejilla de cabinets y contenido, proyectores con su haz y blending,
// figura humana a escala, cotas y vistas predefinidas. Se renderiza solo cuando algo cambia.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { HUMAN_PATH } from './figura.js';
import { colocarPared } from './proyeccion.js';

const MONO = "'Share Tech Mono', ui-monospace, Menlo, monospace";
const SANS = "'Inter', Arial, sans-serif";
const COL_PROY = ['#00b4ff', '#ffb000', '#e100ff', '#9dff00', '#ff4d5e', '#00ffd5', '#ff8a00', '#b566ff'];

export class Escena {
  constructor(lienzo, alCambiar) {
    this.lienzo = lienzo; this.alCambiar = alCambiar || (() => {});
    const r = this.renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    RectAreaLightUniformsLib.init();
    const esc = this.scene = new THREE.Scene();
    esc.background = new THREE.Color(0x0d0d0f);
    const pm = new THREE.PMREMGenerator(r);
    esc.environment = pm.fromScene(new RoomEnvironment(r), 0.04).texture;
    esc.environmentIntensity = 0.18;
    this.cam = new THREE.PerspectiveCamera(55, 1, 0.05, 400);
    this.ctrl = new OrbitControls(this.cam, lienzo);
    this.ctrl.maxPolarAngle = Math.PI * 0.495; this.ctrl.minDistance = 0.3; this.ctrl.maxDistance = 120;
    this.ctrl.addEventListener('change', () => this.render());
    esc.add(new THREE.HemisphereLight(0xc9cbe0, 0x141416, 0.35));
    const sol = this.sol = new THREE.DirectionalLight(0xffffff, 0.55);
    sol.position.set(6, 14, 8); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); sol.shadow.bias = -0.0004; sol.shadow.radius = 4;
    esc.add(sol, sol.target);
    this.grupo = new THREE.Group(); esc.add(this.grupo);
    this.figuraGeo = this._figura();
    this.vistaActual = 'exterior';
    this._ro = new ResizeObserver(() => this.ajustar()); this._ro.observe(lienzo.parentElement);
    this.ajustar();
  }
  // v7.0 · al cambiar de modo en la consola la escena se suelta entera (sin bucles ni contextos WebGL colgando)
  destruir() {
    this._animando = false; this._vivos = [];
    try { this._ro.disconnect(); } catch (e) {}
    try { this.ctrl.dispose(); } catch (e) {}
    try { this._limpiar(); } catch (e) {}
    try { this.renderer.dispose(); this.renderer.forceContextLoss(); } catch (e) {}
  }

  ajustar() {
    const p = this.lienzo.parentElement, w = Math.max(10, p.clientWidth), h = Math.max(10, p.clientHeight);
    this.renderer.setSize(w, h, false); this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); this.render();
  }

  // ---------- utilidades ----------
  _limpiar() {
    this.grupo.traverse(o => {
      if (o.geometry && o.geometry !== this.figuraGeo) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    });
    this.grupo.clear(); this.paredes = [];
  }
  _texto(txt, { tam = 64, col = '#e9e9ec', fondo = 'rgba(12,12,14,.82)', borde = '#00b4ff', fuente = MONO } = {}) {
    const c = document.createElement('canvas'), x = c.getContext('2d');
    x.font = `${tam}px ${fuente}`; const w = Math.ceil(x.measureText(txt).width) + tam * 0.9, h = Math.ceil(tam * 1.55);
    c.width = w; c.height = h;
    x.font = `${tam}px ${fuente}`; x.fillStyle = fondo; x.strokeStyle = borde; x.lineWidth = Math.max(2, tam * 0.06);
    const r = tam * 0.18; x.beginPath(); x.roundRect(x.lineWidth, x.lineWidth, w - 2 * x.lineWidth, h - 2 * x.lineWidth, r); x.fill(); if (borde) x.stroke();
    x.fillStyle = col; x.textBaseline = 'middle'; x.fillText(txt, tam * 0.45, h / 2 + tam * 0.04);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
    s.renderOrder = 10; s.userData.asp = w / h; return s;
  }
  _etiqueta(txt, pos, alto = 0.34, opc) { const s = this._texto(txt, opc); s.scale.set(alto * s.userData.asp, alto, 1); s.position.copy(pos); this.grupo.add(s); return s; }
  _figura() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${HUMAN_PATH}"/></svg>`;
    const datos = new SVGLoader().parse(svg);
    const formas = []; datos.paths.forEach(p => formas.push(...SVGLoader.createShapes(p)));
    const g = new THREE.ExtrudeGeometry(formas, { depth: 300, bevelEnabled: false, curveSegments: 6 });
    // trazado en décimas: 0,1 unidades por unidad; 1280 unidades = 1,75 m; centrado en el eje del cuerpo
    const k = 0.1 * 1.75 / 1280;
    g.translate(-3195, 0, -150); g.scale(k, k, k);
    g.computeVertexNormals();
    return g;
  }
  _cotaSuelo(a, b, txt, desp) {
    const mat = new THREE.LineBasicMaterial({ color: 0x00b4ff, transparent: true, opacity: 0.85 });
    const d = new THREE.Vector3().subVectors(b, a).normalize(), n = new THREE.Vector3(-d.z, 0, d.x).multiplyScalar(desp);
    const A = a.clone().add(n), B = b.clone().add(n);
    const pts = [a, A, A, B, B, b].map(p => p.clone().setY(0.012));
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    this.grupo.add(new THREE.LineSegments(g, mat));
    this._etiqueta(txt, A.clone().add(B).multiplyScalar(0.5).setY(0.18), 0.38);
  }

  // ---------- texturas de contenido ----------
  _cartaLed(sup, r, nombre, cont, pano) {
    const asp = r.ancho / r.alto, W = Math.round(Math.min(2048, Math.max(512, asp >= 1 ? 2048 : 2048 * asp))), H = Math.max(64, Math.round(W / asp));
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    if (cont === 'panorama' && pano) {
      x.drawImage(pano.img, pano.u0 * pano.img.width, 0, (pano.u1 - pano.u0) * pano.img.width, pano.img.height * Math.min(1, r.alto / pano.altoMax), 0, 0, W, H);
    } else if (cont === 'apagado') {
      const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0c0c0e'); g.addColorStop(1, '#151518'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    } else {
      const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#120a2a'); g.addColorStop(0.55, '#062031'); g.addColorStop(1, '#0a2a12'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      // rejilla de referencia, círculos y barras de color de carta de ajuste
      x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = Math.max(1, W / 1024);
      const paso = H / 8; for (let i = 0; i <= W / paso; i++) { x.beginPath(); x.moveTo(i * paso, 0); x.lineTo(i * paso, H); x.stroke(); }
      for (let j = 0; j <= 8; j++) { x.beginPath(); x.moveTo(0, j * paso); x.lineTo(W, j * paso); x.stroke(); }
      x.strokeStyle = 'rgba(0,255,4,.55)'; x.lineWidth = Math.max(2, W / 600);
      x.beginPath(); x.arc(W / 2, H / 2, H * 0.36, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.moveTo(W / 2 - H * 0.42, H / 2); x.lineTo(W / 2 + H * 0.42, H / 2); x.moveTo(W / 2, H * 0.08); x.lineTo(W / 2, H * 0.92); x.stroke();
      const barras = ['#ffffff', '#ffff00', '#00ffff', '#00ff00', '#ff00ff', '#ff0000', '#0000ff'];
      const bw = Math.min(W * 0.05, H * 0.08); barras.forEach((b, i) => { x.fillStyle = b; x.fillRect(W * 0.06, H * 0.18 + i * (H * 0.64 / 7), bw, H * 0.64 / 7); x.fillRect(W * 0.94 - bw, H * 0.18 + i * (H * 0.64 / 7), bw, H * 0.64 / 7); });
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `800 ${Math.round(H * 0.11)}px ${SANS}`; x.fillText(nombre.toUpperCase(), W / 2, H * 0.40);
      x.font = `${Math.round(H * 0.085)}px ${MONO}`; x.fillStyle = '#00ff04'; x.fillText(`${r.resW} × ${r.resH} px`, W / 2, H * 0.58);
      x.font = `${Math.round(H * 0.06)}px ${MONO}`; x.fillStyle = '#c9c9ce'; x.fillText(`${r.cols} × ${r.rows} cabinets`, W / 2, H * 0.70);
    }
    // juntas de los cabinets
    if (r.cols && r.rows) {
      x.strokeStyle = cont === 'apagado' ? 'rgba(90,90,100,.55)' : 'rgba(0,0,0,.42)'; x.lineWidth = Math.max(1, Math.min(3, W / r.cols / 60));
      for (let i = 1; i < r.cols; i++) { const u = i * W / r.cols; x.beginPath(); x.moveTo(u, 0); x.lineTo(u, H); x.stroke(); }
      for (let j = 1; j < r.rows; j++) { const v = j * H / r.rows; x.beginPath(); x.moveTo(0, v); x.lineTo(W, v); x.stroke(); }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    // color medio para la luz que emite la pantalla
    const m = document.createElement('canvas'); m.width = m.height = 1; const mx = m.getContext('2d'); mx.drawImage(c, 0, 0, 1, 1);
    const d = mx.getImageData(0, 0, 1, 1).data; t.userData = { medio: new THREE.Color(`rgb(${d[0]},${d[1]},${d[2]})`) };
    return t;
  }
  _panorama() {
    if (this._pano) return this._pano;
    const W = 4096, H = 1024, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05030f'); g.addColorStop(0.45, '#1b0b3a'); g.addColorStop(0.72, '#3a0f5c'); g.addColorStop(1, '#0a0614'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    let semilla = 7; const rnd = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.7})`; const s = rnd() * 2.2; x.fillRect(rnd() * W, rnd() * H * 0.6, s, s); }
    // auroras en verde y violeta AVHUB
    [['rgba(0,255,4,', 0.38, 0.0], ['rgba(153,0,255,', 0.30, 1.7], ['rgba(0,180,255,', 0.24, 3.1]].forEach(([col, alto, fase]) => {
      for (let k = 0; k < 60; k++) {
        x.beginPath(); const y0 = H * (alto + k * 0.0016);
        for (let px = 0; px <= W; px += 16) { const y = y0 + Math.sin(px / W * Math.PI * 6 + fase + k * 0.02) * H * 0.06 + Math.sin(px / W * Math.PI * 17 + fase) * H * 0.015; px ? x.lineTo(px, y) : x.moveTo(px, y); }
        x.strokeStyle = col + (0.05 * (1 - k / 60)) + ')'; x.lineWidth = 6; x.stroke();
      }
    });
    // perfil de montañas
    x.fillStyle = '#07040d'; x.beginPath(); x.moveTo(0, H);
    for (let px = 0; px <= W; px += 8) x.lineTo(px, H * 0.78 - Math.abs(Math.sin(px / W * Math.PI * 5)) * H * 0.12 - Math.sin(px / W * Math.PI * 23) * H * 0.02);
    x.lineTo(W, H); x.closePath(); x.fill();
    this._pano = { img: c }; return this._pano;
  }
  _paredProy(sup, res, cont, altoPared, nombre) {
    const asp = sup.ancho / altoPared, Wc = asp >= 1 ? 2048 : Math.round(2048 * asp), Hc = Math.round(Wc / asp);
    const c = document.createElement('canvas'); c.width = Wc; c.height = Hc; const x = c.getContext('2d');
    x.fillStyle = '#c4c4c9'; x.fillRect(0, 0, Wc, Hc);
    // v8.0 · rejilla de columnas × filas: la zona proyectada conjunta y el contorno y los solapes de cada imagen
    const k = Wc / sup.ancho, filas = res.filas || [-Math.max(0, res.imgH - sup.alto) / 2], anchoTot = res.anchoTot || res.imgW, altoTot = res.altoTot || res.imgH;
    const yTop = Hc - (sup.elev + filas[0] + altoTot) * k, ih = altoTot * k;
    const xi = Math.max(0, (sup.ancho / 2 - anchoTot / 2) * k), anchoC = Math.min(Wc, anchoTot * k);
    if (cont === 'panorama') {
      const pano = this._panorama(); x.drawImage(pano.img, 0, 0, pano.img.width, pano.img.height, xi, yTop, anchoC, ih);
    } else if (cont !== 'apagado') {
      const g = x.createLinearGradient(xi, 0, xi + anchoC, 0); g.addColorStop(0, '#2a1260'); g.addColorStop(0.5, '#0c3a5a'); g.addColorStop(1, '#14501f'); x.fillStyle = g; x.fillRect(xi, yTop, anchoC, ih);
      x.strokeStyle = 'rgba(255,255,255,.2)'; x.lineWidth = 2; const paso = Math.min(ih, anchoC) / 6;
      for (let u = xi; u <= xi + anchoC; u += paso) { x.beginPath(); x.moveTo(u, yTop); x.lineTo(u, yTop + ih); x.stroke(); }
      for (let v = yTop; v <= yTop + ih + 0.5; v += paso) { x.beginPath(); x.moveTo(xi, v); x.lineTo(xi + anchoC, v); x.stroke(); }
      const tl = Math.min(ih, anchoC);
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `800 ${Math.round(tl * 0.1)}px ${SANS}`; x.fillText(nombre.toUpperCase(), xi + anchoC / 2, yTop + ih * 0.42);
      x.font = `${Math.round(tl * 0.075)}px ${MONO}`; x.fillStyle = '#00ff04'; x.fillText(`${res.resW} × ${res.resH} px`, xi + anchoC / 2, yTop + ih * 0.42 + tl * 0.13);
    }
    const iw = res.imgW * k, ihI = res.imgH * k; let n = 0;
    filas.forEach((fy, r) => res.centros.forEach((cx, ci) => {
      const x0 = (sup.ancho / 2 + cx - res.imgW / 2) * k, y0 = Hc - (sup.elev + fy + res.imgH) * k, col = COL_PROY[n % COL_PROY.length];
      x.strokeStyle = col; x.lineWidth = Math.max(3, Wc / 500); x.setLineDash([]); x.strokeRect(x0 + 2, y0 + 2, iw - 4, ihI - 4);
      x.fillStyle = 'rgba(255,255,255,.10)'; x.strokeStyle = 'rgba(255,255,255,.65)';
      if (ci > 0 && res.solape > 0) { const sw = res.solape * k; x.fillRect(x0, y0, sw, ihI); x.setLineDash([14, 10]); x.strokeRect(x0, y0, sw, ihI); }
      if (r > 0 && res.solapeY > 0) { const sh = res.solapeY * k; x.fillRect(x0, y0 + ihI - sh, iw, sh); x.setLineDash([14, 10]); x.strokeRect(x0, y0 + ihI - sh, iw, sh); }
      x.setLineDash([]); x.fillStyle = col; x.font = `${Math.round(Math.min(ihI, iw) * 0.06)}px ${MONO}`; x.textAlign = 'left'; x.fillText('P' + (n + 1), x0 + Math.min(ihI, iw) * 0.04, y0 + Math.min(ihI, iw) * 0.08);
      n++;
    }));
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  // ---------- construcción ----------
  construir(m) {
    this._limpiar(); this.modelo = m;
    const G = this.grupo, sala = m.sala;
    const W = sala ? sala.ancho : Math.max(8, m.extX * 1.6), D = sala ? sala.fondo : Math.max(8, m.extZ * 2.2), H = sala ? sala.alto : Math.max(3, m.altoMax + 0.8);
    this.dim = { W, D, H, sala: !!sala };
    // suelo
    const tSuelo = this._texSuelo();
    tSuelo.repeat.set(W * 0.75, (sala ? D : D) * 0.75);
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(sala ? W : W * 3, sala ? D : D * 3), new THREE.MeshStandardMaterial({ color: 0x232327, roughness: 0.42, metalness: 0.0, map: tSuelo }));
    suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; G.add(suelo);
    // paredes de la sala (cuerpo); las superficies LED o de proyección van delante
    if (sala) {
      const grosor = 0.12, colPared = m.tecnologia === 'proy' ? 0xa9a9ae : 0x2a2a2e;
      const defs = [
        { id: 'frontal', w: W + grosor * 2, x: 0, z: -D / 2 - grosor / 2, rot: 0, n: new THREE.Vector3(0, 0, 1) },
        { id: 'trasera', w: W + grosor * 2, x: 0, z: D / 2 + grosor / 2, rot: Math.PI, n: new THREE.Vector3(0, 0, -1) },
        { id: 'izquierda', w: D, x: -W / 2 - grosor / 2, z: 0, rot: Math.PI / 2, n: new THREE.Vector3(1, 0, 0) },
        { id: 'derecha', w: D, x: W / 2 + grosor / 2, z: 0, rot: -Math.PI / 2, n: new THREE.Vector3(-1, 0, 0) }
      ];
      defs.forEach(d => {
        const g = new THREE.Group(); g.position.set(d.x, 0, d.z); g.rotation.y = d.rot;
        const caja = new THREE.Mesh(new THREE.BoxGeometry(d.w, H, grosor), new THREE.MeshStandardMaterial({ color: colPared, roughness: 0.93 }));
        caja.position.y = H / 2; caja.receiveShadow = true; g.add(caja);
        g.userData = { normal: d.n, id: d.id, plano: new THREE.Vector3(d.x, 0, d.z) };
        G.add(g); this.paredes.push(g);
      });
      this._cotaSuelo(new THREE.Vector3(-W / 2, 0, D / 2), new THREE.Vector3(W / 2, 0, D / 2), `${fmt(W)} m`, 0.55);
      this._cotaSuelo(new THREE.Vector3(W / 2, 0, D / 2), new THREE.Vector3(W / 2, 0, -D / 2), `${fmt(D)} m`, 0.55);
    }
    // contenido en movimiento (ascensor de demostración o vídeo / imagen propios): base apagada y capa de contenido encima
    const vivo = m.contenido === 'ascensor' || (m.contenido === 'propio' && !!m.medio), cont = vivo || m.contenido === 'propio' ? 'apagado' : m.contenido;
    this._vivos = [];
    const pano = m.contenido === 'panorama' ? this._panorama() : null;
    // tramos del panorama en el orden de recorrido
    // recorrido continuo alrededor de la sala: izquierda → frontal → derecha → trasera (las esquinas casan); pantallas, de izquierda a derecha
    const ORD = ['izquierda', 'frontal', 'derecha', 'trasera'];
    const ordenPano = m.superficies.filter(f => f.s.tipo !== 'suelo').slice().sort((a, b) => (ORD.indexOf(a.s.id) + 10 * (a.s.num || 0)) - (ORD.indexOf(b.s.id) + 10 * (b.s.num || 0)));
    const anchoPano = ordenPano.reduce((a, f) => a + (f.r ? f.r.ancho : f.s.ancho), 0) || 1;
    let acum = 0; const tramo = {};
    ordenPano.forEach(f => { const w = f.r ? f.r.ancho : f.s.ancho; tramo[f.s.id] = { u0: acum / anchoPano, u1: (acum + w) / anchoPano }; acum += w; });
    const altoMax = Math.max(...m.superficies.map(f => (f.r ? f.r.alto : f.s.alto)), 1);
    let luces = 0;
    m.superficies.forEach((f, idx) => {
      const s = f.s, g = new THREE.Group(); g.position.set(s.x, 0, s.z); g.rotation.y = s.rot; G.add(g);
      // las superficies de la sala también se seccionan al mirar desde fuera
      if (sala && s.tipo === 'pared') { g.userData = { normal: new THREE.Vector3(Math.sin(s.rot), 0, Math.cos(s.rot)), plano: new THREE.Vector3(s.x, 0, s.z) }; this.paredes.push(g); }
      if (m.tecnologia === 'led' && f.r) {
        const r = f.r, t = (f.grosor || 0.08);
        const tex = this._cartaLed(s, r, f.nombre, cont, pano ? { img: pano.img, ...tramo[s.id], altoMax } : null);
        if (s.tipo === 'suelo') {
          const lo = new THREE.Mesh(new THREE.BoxGeometry(r.ancho, 0.06, r.alto), [mMetal(), mMetal(), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), mMetal(), mMetal(), mMetal()]);
          lo.position.y = 0.03; G.add(lo); return;
        }
        const frente = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
        const caja = new THREE.Mesh(new THREE.BoxGeometry(r.ancho, r.alto, t), [mMetal(), mMetal(), mMetal(), mMetal(), frente, mMetal()]);
        caja.position.set(0, s.elev + r.alto / 2, t / 2 + 0.005); caja.castShadow = true; g.add(caja);
        // huecos de las puertas (cabinets quitados, ajustados a la rejilla)
        (r.huecos || []).forEach(hh => { const b = new THREE.Mesh(new THREE.BoxGeometry(hh.w, hh.h, 0.02), new THREE.MeshStandardMaterial({ color: 0x0d0d10, roughness: 0.9 })); b.position.set(hh.x + hh.w / 2, s.elev + hh.h / 2, t + 0.016); g.add(b); });
        if (s.tipo === 'pantalla') { // estructura de suelo para pantallas sueltas elevadas
          if (s.elev > 0.05) [-1, 1].forEach(lado => { const pata = new THREE.Mesh(new THREE.BoxGeometry(0.08, s.elev, 0.08), mMetal()); pata.position.set(lado * (r.ancho / 2 - 0.2), s.elev / 2, t / 2); pata.castShadow = true; g.add(pata); });
        }
        // la pantalla ilumina la sala con su color medio
        if (vivo) this._capaMedio(g, { x: 0, y: s.elev + r.alto / 2, z: t + 0.009, w: r.ancho, h: r.alto }, tramo[s.id], m);
        if (luces < 6 && (vivo || m.contenido !== 'apagado')) {
          // la luz rectangular emite hacia su −Z: girada 180° para que ilumine hacia la sala (+Z local)
          const l = new THREE.RectAreaLight(vivo ? new THREE.Color(0x7f8bb0) : tex.userData.medio, vivo ? 6 : 9, r.ancho, r.alto); l.position.set(0, s.elev + r.alto / 2, t + 0.02); l.rotation.set(0, Math.PI, 0);
          g.add(l); luces++;
        }
        if (m.etiquetas) this._etiquetaLocal(g, `${f.nombre.toUpperCase()} · ${r.cols}×${r.rows} · ${r.resW}×${r.resH}`, new THREE.Vector3(0, s.elev + r.alto + 0.28, t + 0.05));
      }
      if (m.tecnologia === 'proy' && f.p) {
        const p = f.p, prod = f.proyector;
        if (s.tipo === 'suelo') {
          const tex = this._sueloProy(s, p, cont);
          if (vivo && m.contenido === 'propio') { const gS = new THREE.Group(); gS.rotation.x = -Math.PI / 2; G.add(gS); this._capaMedio(gS, { x: 0, y: 0, z: 0.012, w: s.ancho, h: s.alto }, null, m, true); }
          const pl = new THREE.Mesh(new THREE.PlaneGeometry(s.ancho, s.alto), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
          pl.rotation.x = -Math.PI / 2; pl.position.y = 0.006; G.add(pl);
          p.pos.forEach((q, i) => this._proyector(G, new THREE.Vector3(q.x, H - 0.15, q.z), [
            new THREE.Vector3(q.x - p.imgW / 2, 0.01, q.z - p.imgH / 2), new THREE.Vector3(q.x + p.imgW / 2, 0.01, q.z - p.imgH / 2),
            new THREE.Vector3(q.x + p.imgW / 2, 0.01, q.z + p.imgH / 2), new THREE.Vector3(q.x - p.imgW / 2, 0.01, q.z + p.imgH / 2)], i + 10, prod, true, m.conflictos && m.conflictos.has(s.id + ':' + i)));
          return;
        }
        const altoPared = sala ? H : s.elev + s.alto + 0.2;
        const tex = this._paredProy(s, p, cont, altoPared, f.nombre);
        if (vivo) { const wU = Math.min(s.ancho, p.anchoTot), yB = Math.max(0, s.elev + p.filas[0]), yT = Math.min(altoPared, yB + p.altoTot);
          this._capaMedio(g, { x: 0, y: (yB + yT) / 2, z: 0.008, w: wU, h: yT - yB }, tramo[s.id], m); }
        const lienzo = new THREE.Mesh(new THREE.PlaneGeometry(s.ancho, altoPared), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
        lienzo.position.set(0, altoPared / 2, 0.004); g.add(lienzo);
        if (!sala) { const marco = new THREE.Mesh(new THREE.BoxGeometry(s.ancho + 0.08, altoPared + 0.04, 0.04), mMetal()); marco.position.set(0, altoPared / 2, -0.02); g.add(marco); }
        // proyectores de la pared: delante de ella a la distancia de tiro; los UST, justo sobre la imagen (misma colocación que el análisis de sombras)
        const v3 = (q) => new THREE.Vector3(q.x, q.y, q.z);
        // posiciones finales del análisis (con los choques entre chasis ya resueltos); si no hay, la colocación base
        const hs = (m.haces && m.haces.filter(h => h.sup === s.id && !h.suelo)) || [];
        const lista = hs.length ? hs : colocarPared(s, p, prod, { alto: H, sala: !!sala });
        lista.forEach((h, i) => this._proyector(G, v3(h.lente), h.esquinas.map(v3), i, prod, false, m.conflictos && m.conflictos.has(s.id + ':' + i), h.vert));
        // v8.0 · apoyados en una torre o una base alta: el pie bajo el proyector más bajo de cada columna
        if (lista.some(h => h.apoyo)) { const pies = new Map(); lista.filter(h => h.apoyo).forEach(h => { const k = h.lente.x.toFixed(2) + ':' + h.lente.z.toFixed(2); if (!pies.has(k) || pies.get(k).lente.y > h.lente.y) pies.set(k, h); });
          pies.forEach(h => { const altoP = h.lente.y - (h.vert ? prod.chasis[0] : prod.chasis[2]) / 2; if (altoP > 0.3) this._torre(G, h.lente, altoP); }); }
        if (m.etiquetas) this._etiquetaLocal(g, `${f.nombre.toUpperCase()} · ${p.n}× · ${p.resW}×${p.resH}`, new THREE.Vector3(0, s.elev + p.filas[0] + p.altoTot + 0.3, 0.08));
      }
      void idx;
    });
    // puertas: hoja con marco y manilla delante de su pared (en paredes LED, delante del hueco)
    (m.puertas || []).forEach(p => {
      const fila = m.superficies.find(f => f.s.id === p.pared), z0 = (m.tecnologia === 'led' && fila && fila.r ? (fila.grosor || 0.08) + 0.03 : 0.02);
      const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = p.rot; G.add(g);
      // se secciona con su pared al mirar desde fuera
      g.userData = { normal: new THREE.Vector3(Math.sin(p.rot), 0, Math.cos(p.rot)), plano: new THREE.Vector3(p.x, 0, p.z) }; this.paredes.push(g);
      const marco = new THREE.Mesh(new THREE.BoxGeometry(p.ancho + 0.1, p.alto + 0.05, 0.03), new THREE.MeshStandardMaterial({ color: 0x9a9aa2, roughness: 0.5, metalness: 0.3 }));
      marco.position.set(0, (p.alto + 0.05) / 2, z0); g.add(marco);
      const hoja = new THREE.Mesh(new THREE.BoxGeometry(p.ancho, p.alto, 0.045), new THREE.MeshStandardMaterial({ color: 0x3c3c44, roughness: 0.7 }));
      hoja.position.set(0, p.alto / 2, z0 + 0.012); hoja.castShadow = true; g.add(hoja);
      const man = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.04), new THREE.MeshStandardMaterial({ color: 0xd8d8de, metalness: 0.8, roughness: 0.25 }));
      man.position.set(p.ancho / 2 - 0.12, 1.05, z0 + 0.05); g.add(man);
    });
    // obstáculos: columnas o cajas; en rojo si cortan algún haz
    (m.obstaculos || []).forEach((o, k) => {
      const malo = m.obstTapa && m.obstTapa.has(k);
      const b = new THREE.Mesh(new THREE.BoxGeometry(o.ancho, o.alto, o.fondo), new THREE.MeshStandardMaterial({ color: malo ? 0x8a3038 : 0x77777e, roughness: 0.85 }));
      b.position.set(o.x, o.alto / 2, o.z); b.castShadow = true; b.receiveShadow = true; G.add(b);
      const aristas = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: malo ? 0xff4d5e : 0x2a2a30 }));
      aristas.position.copy(b.position); G.add(aristas);
      if (malo) this._etiqueta('⚠', new THREE.Vector3(o.x, o.alto + 0.25, o.z), 0.24, { borde: '#ff4d5e', col: '#ffd500' });
    });
    if (m.sombras) this._zonaSegura(m.sombras, !!sala);
    // figura humana: en el centro de la sala, o delante de las pantallas a la distancia del público
    const fig = new THREE.Mesh(this.figuraGeo, new THREE.MeshStandardMaterial({ color: 0x8a8a93, roughness: 0.6, metalness: 0.05 }));
    fig.castShadow = true;
    if (sala) fig.position.set(W * 0.16, 0, -D * 0.04); else fig.position.set(0.7, 0, m.distPublico);
    G.add(fig);
    if (!sala) { const fig2 = fig.clone(); fig2.position.x = -0.6; fig2.position.z += 0.5; fig2.rotation.y = 0.25; G.add(fig2); }
    // caja que encuadra la escena (para las vistas)
    if (sala) this.caja = new THREE.Box3(new THREE.Vector3(-W / 2, 0, -D / 2), new THREE.Vector3(W / 2, H, D / 2));
    else {
      const c = new THREE.Box3();
      m.superficies.forEach(f => { const s = f.s, w = (f.r ? f.r.ancho : s.ancho) / 2, h = s.elev + (f.r ? f.r.alto : s.alto) + 0.3;
        [[-w, 0], [w, 0]].forEach(([a]) => { c.expandByPoint(new THREE.Vector3(s.x + Math.cos(s.rot) * a, 0, s.z - Math.sin(s.rot) * a)); c.expandByPoint(new THREE.Vector3(s.x + Math.cos(s.rot) * a, h, s.z - Math.sin(s.rot) * a)); }); });
      c.expandByPoint(new THREE.Vector3(0, 0, m.distPublico + 0.6));
      // v8.0 · también los proyectores (a 25 m al otro lado de la calle, en torre…), para que se vean en las vistas
      (m.haces || []).forEach(h => { if (h.lente) c.expandByPoint(new THREE.Vector3(h.lente.x, h.lente.y, h.lente.z)); });
      this.caja = c;
    }
    // sombra y encuadre de la luz direccional
    const R = Math.max(W, D) * 0.8; Object.assign(this.sol.shadow.camera, { left: -R, right: R, top: R, bottom: -R, near: 1, far: 60 }); this.sol.shadow.camera.updateProjectionMatrix();
    this.ctrl.target.set(0, Math.min(H, altoMax) * 0.45, sala ? 0 : -1);
    this.vista(this.vistaActual, true);
    if (this._vivos.length && !this._animando) { this._animando = true; requestAnimationFrame(() => this._bucle()); }
    if (!this._vivos.length) this._animando = false;
  }
  // Safety zone: cinta discontinua amarilla y negra en el suelo y, en rayado rojo tenue, las franjas donde el público hace sombra
  _zonaSegura(S, sala) {
    const G = this.grupo;
    if (!this._texCinta) {
      const c = document.createElement('canvas'); c.width = 64; c.height = 32; const x = c.getContext('2d');
      x.fillStyle = '#ffd500'; x.fillRect(0, 0, 64, 32); x.fillStyle = '#111';
      for (let k = -2; k < 4; k++) { x.beginPath(); x.moveTo(k * 32, 32); x.lineTo(k * 32 + 16, 32); x.lineTo(k * 32 + 48, 0); x.lineTo(k * 32 + 32, 0); x.closePath(); x.fill(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; this._texCinta = t;
      const r = document.createElement('canvas'); r.width = r.height = 64; const y = r.getContext('2d');
      y.fillStyle = 'rgba(255,40,60,.16)'; y.fillRect(0, 0, 64, 64); y.strokeStyle = 'rgba(255,60,70,.55)'; y.lineWidth = 6;
      for (let k = -1; k < 3; k++) { y.beginPath(); y.moveTo(k * 32, 64); y.lineTo(k * 32 + 64, 0); y.stroke(); }
      const tr = new THREE.CanvasTexture(r); tr.wrapS = tr.wrapT = THREE.RepeatWrapping; tr.colorSpace = THREE.SRGBColorSpace; this._texRayas = tr;
    }
    const mCinta = new THREE.MeshBasicMaterial({ map: this._texCinta, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 });
    // tramo discontinuo de cinta entre dos puntos del suelo
    const cinta = (a, b) => {
      const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz); if (L < 0.05) return;
      const ang = Math.atan2(-dz, dx), tramo = 0.6, hueco = 0.22;
      for (let d = 0; d < L - 0.02; d += tramo + hueco) {
        const l = Math.min(tramo, L - d), geo = new THREE.PlaneGeometry(l, 0.1), uv = geo.attributes.uv;
        for (let k = 0; k < uv.count; k++) uv.setX(k, uv.getX(k) * l / 0.2);
        const me = new THREE.Mesh(geo, mCinta); me.rotation.set(-Math.PI / 2, 0, ang);
        me.position.set(a.x + dx / L * (d + l / 2), 0.014, a.z + dz / L * (d + l / 2)); G.add(me);
      }
    };
    // franjas de sombra delante de cada superficie (en el sistema de la superficie)
    S.franjas.forEach(f => {
      if (f.prof < 0.05) return;
      const s = f.s, geo = new THREE.PlaneGeometry(f.ancho, f.prof), uv = geo.attributes.uv;
      for (let k = 0; k < uv.count; k++) { uv.setX(k, uv.getX(k) * f.ancho / 0.5); uv.setY(k, uv.getY(k) * f.prof / 0.5); }
      const me = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this._texRayas, transparent: true, depthWrite: false, toneMapped: false }));
      const g = new THREE.Group(); g.position.set(s.x, 0, s.z); g.rotation.y = s.rot; me.rotation.x = -Math.PI / 2; me.position.set(0, 0.01, f.prof / 2); g.add(me); G.add(g);
      if (!sala) { // pantallas sueltas: la línea va a la distancia segura delante de cada pantalla
        g.updateMatrixWorld(true);
        const a = new THREE.Vector3(-f.ancho / 2, 0, f.prof).applyMatrix4(g.matrixWorld), b = new THREE.Vector3(f.ancho / 2, 0, f.prof).applyMatrix4(g.matrixWorld);
        cinta(a, b);
      }
    });
    if (sala && S.zona && S.zona.ok && S.franjas.some(f => f.prof > 0.05)) {
      const z = S.zona, P = [[z.x0, z.z0], [z.x1, z.z0], [z.x1, z.z1], [z.x0, z.z1]].map(([x, y]) => ({ x, z: y }));
      for (let k = 0; k < 4; k++) cinta(P[k], P[(k + 1) % 4]);
      this._etiqueta('SAFETY ZONE', new THREE.Vector3((z.x0 + z.x1) / 2, 0.06, z.z1 - 0.35), 0.24, { borde: '#ffd500', col: '#ffd500' });
    }
  }
  // ---------- contenido propio y demostración en movimiento ----------
  // Capa de contenido sobre una superficie con el modo de ajuste elegido:
  // continuo (un ultrapanorámico recorre todas las superficies sin cortes), estirar, rellenar (recorta), encajar (bandas negras), repetir y espejo
  _capaMedio(g, R, tramo, m, suelo) {
    const demo = m.contenido === 'ascensor', base = demo ? this._ascensor() : this._medioTex(m.medio);
    if (!base) return;
    const t = base.clone(); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
    const aC = demo ? this._asc.c.width / this._asc.c.height : (m.medio.w / m.medio.h) || 1.78, aS = R.w / R.h;
    let modo = demo ? 'continuo' : (m.medio.modo || 'continuo'); if (modo === 'continuo' && !tramo) modo = 'rellenar';
    let w = R.w, h = R.h;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.repeat.set(1, 1); t.offset.set(0, 0);
    if (modo === 'continuo') { t.repeat.x = tramo.u1 - tramo.u0; t.offset.x = tramo.u0; }
    else if (modo === 'rellenar') { if (aC > aS) { t.repeat.x = aS / aC; t.offset.x = (1 - t.repeat.x) / 2; } else { t.repeat.y = aC / aS; t.offset.y = (1 - t.repeat.y) / 2; } }
    else if (modo === 'encajar') { if (aC > aS) h = w / aC; else w = h * aC; }
    else if (modo === 'repetir' || modo === 'espejo') { t.wrapS = modo === 'espejo' ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping; t.repeat.x = aS / aC; }
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
    pl.position.set(R.x, R.y, R.z); g.add(pl);
    if (demo || m.medio.tipo === 'video') this._vivos.push(t); void suelo;
  }
  _medioTex(md) {
    if (!md || !md.el) return null;
    if (this._medio && this._medio.el === md.el) return this._medio.t;
    const t = md.tipo === 'video' ? new THREE.VideoTexture(md.el) : new THREE.Texture(md.el);
    t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; this._medio = { el: md.el, t }; return t;
  }
  // Demostración «ascensor»: un hueco que baja, continuo en todas las paredes (vigas, luces y plantas que suben)
  _ascensor() {
    if (!this._asc) { const c = document.createElement('canvas'); c.width = 2048; c.height = 512; this._asc = { c, x: c.getContext('2d'), t: new THREE.CanvasTexture(c), t0: performance.now() }; this._asc.t.colorSpace = THREE.SRGBColorSpace; }
    this._pintaAscensor(); return this._asc.t;
  }
  _pintaAscensor() {
    const A = this._asc, x = A.x, W = A.c.width, H = A.c.height, s = (performance.now() - A.t0) / 1000;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#07080c'); g.addColorStop(0.5, '#1b1f29'); g.addColorStop(1, '#07080c'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // hormigón con juntas que suben (la cabina baja a 1,2 m/s)
    const paso = H * 0.55, v = H * 0.42, off = (s * v) % paso;
    x.strokeStyle = 'rgba(255,255,255,.06)'; x.lineWidth = 2;
    for (let y = H + paso - off; y > -paso; y -= paso / 4) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
    for (let y = H + paso - off; y > -paso; y -= paso) {
      const pl = Math.floor((s * v + (H + paso - y)) / paso);
      x.fillStyle = '#2a2f3b'; x.fillRect(0, y - 18, W, 36);
      x.fillStyle = 'rgba(255,190,90,.9)'; for (let u = 64; u < W; u += 256) { x.fillRect(u, y - 4, 60, 8); }
      x.fillStyle = '#ffd500'; x.font = `800 ${Math.round(H * 0.07)}px ${SANS}`; x.textAlign = 'center'; x.textBaseline = 'middle';
      for (let u = 256; u < W; u += 512) x.fillText('−' + (pl % 40), u, y - 46);
    }
    // guías de la cabina (fijas)
    x.fillStyle = '#3a3f4b'; for (let u = 0; u < 4; u++) { x.fillRect(W * (u + 0.5) / 4 - 10, 0, 20, H); }
    x.fillStyle = 'rgba(0,255,4,.75)'; x.font = `700 ${Math.round(H * 0.045)}px ${MONO}`; x.textAlign = 'left'; x.fillText('▼ SCREENS · DEMO', 24, 30);
  }
  _bucle() {
    if (!this._animando || !this._vivos.length) { this._animando = false; return; }
    if (!document.hidden) {
      if (this._asc && this.modelo && this.modelo.contenido === 'ascensor') { this._pintaAscensor(); this._vivos.forEach(t => { t.needsUpdate = true; }); }
      else if (this._medio && this.modelo && this.modelo.medio && this.modelo.medio.tipo === 'img') { /* imagen fija: sin redibujar */ }
      this.render();
    }
    requestAnimationFrame(() => this._bucle());
  }
  _etiquetaLocal(g, txt, pos) { g.updateMatrixWorld(true); this._etiqueta(txt, pos.applyMatrix4(g.matrixWorld), 0.32, { borde: '#9900ff' }); }
  _texSuelo() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#5a5a60'; x.fillRect(0, 0, 256, 256);
    let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 1800; i++) { const v = 70 + rnd() * 40; x.fillStyle = `rgba(${v},${v},${v + 4},.35)`; x.fillRect(rnd() * 256, rnd() * 256, 2, 2); }
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2; x.strokeRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  _sueloProy(s, p, cont) {
    const asp = s.ancho / s.alto, Wc = asp >= 1 ? 2048 : Math.round(2048 * asp), Hc = Math.round(Wc / asp);
    const c = document.createElement('canvas'); c.width = Wc; c.height = Hc; const x = c.getContext('2d'); const k = Wc / s.ancho;
    if (cont === 'panorama') { const pano = this._panorama(); x.drawImage(pano.img, 0, 0, pano.img.width, pano.img.height, 0, 0, Wc, Hc); }
    else if (cont === 'apagado') { x.fillStyle = '#3a3a40'; x.fillRect(0, 0, Wc, Hc); }
    else { const g = x.createRadialGradient(Wc / 2, Hc / 2, 10, Wc / 2, Hc / 2, Math.max(Wc, Hc) / 1.4); g.addColorStop(0, '#0c3a5a'); g.addColorStop(1, '#2a1260'); x.fillStyle = g; x.fillRect(0, 0, Wc, Hc); }
    p.pos.forEach((q, i) => { x.strokeStyle = COL_PROY[(i + 2) % COL_PROY.length]; x.lineWidth = 4; x.strokeRect((q.x + s.ancho / 2 - p.imgW / 2) * k, (q.z + s.alto / 2 - p.imgH / 2) * k, p.imgW * k, p.imgH * k); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  // torre o base de los proyectores apoyados: estructura de truss desde el suelo hasta el proyector
  _torre(G, lente, alto) {
    const m = new THREE.MeshStandardMaterial({ color: 0x9a9aa2, roughness: 0.45, metalness: 0.7 }), lado = 0.29;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, alto, 8), m); tubo.position.set(lente.x + a * lado / 2, alto / 2, lente.z + b * lado / 2); tubo.castShadow = true; G.add(tubo); });
    for (let y = 0.25; y < alto; y += 0.5) { const anillo = new THREE.Mesh(new THREE.BoxGeometry(lado, 0.02, lado), m); anillo.position.set(lente.x, y, lente.z); G.add(anillo); }
    const placa = new THREE.Mesh(new THREE.BoxGeometry(lado + 0.12, 0.03, lado + 0.12), m); placa.position.set(lente.x, alto - 0.015, lente.z); G.add(placa);
  }
  _proyector(G, lente, esquinas, i, prod, suelo, tapa, vert) {
    const col = new THREE.Color(COL_PROY[i % COL_PROY.length]);
    const cuerpo = new THREE.Group();
    // en rojo, el proyector que queda dentro del haz de otra superficie (hará sombra en esa imagen)
    const caja = new THREE.Mesh(new THREE.BoxGeometry(prod.ust ? 0.46 : 0.5, 0.17, prod.ust ? 0.36 : 0.48), new THREE.MeshStandardMaterial(tapa ? { color: 0xff3344, roughness: 0.4, metalness: 0.1, emissive: 0x550008 } : { color: 0xe9e9ec, roughness: 0.45, metalness: 0.1 }));
    caja.castShadow = true; cuerpo.add(caja);
    const lenteM = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.3, metalness: 0.6 }));
    lenteM.rotation.x = Math.PI / 2; lenteM.position.set(0, 0, 0.27); cuerpo.add(lenteM);
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: col })); led.position.set(0.15, 0.03, 0.245); cuerpo.add(led);
    const centro = esquinas.reduce((a, v) => a.add(v), new THREE.Vector3()).multiplyScalar(0.25);
    cuerpo.position.copy(lente);
    if (suelo) cuerpo.lookAt(lente.x, -10, lente.z + 0.02); else cuerpo.lookAt(centro.x, lente.y, centro.z);
    if (vert) cuerpo.rotateZ(Math.PI / 2);   // v8.0 · en vertical (retrato), girado 90° sobre el eje de la óptica
    G.add(cuerpo);
    if (tapa) this._etiqueta('⚠', lente.clone().add(new THREE.Vector3(0, 0.32, 0)), 0.22, { borde: '#ff4d5e', col: '#ffd500' });
    {
      // haz de luz en volumen (pirámide) con aristas
      const pos = []; for (let k = 0; k < 4; k++) { const a = esquinas[k], b = esquinas[(k + 1) % 4]; pos.push(lente.x, lente.y, lente.z, a.x, a.y, a.z, b.x, b.y, b.z); }
      const gH = new THREE.BufferGeometry(); gH.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      const haz = new THREE.Mesh(gH, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: suelo ? 0.035 : 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      haz.userData.haz = true; G.add(haz);
      const ar = []; esquinas.forEach(e => ar.push(lente, e));
      const lin = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ar), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.32 }));
      lin.userData.haz = true; G.add(lin);
    }
  }

  // ---------- vistas ----------
  vista(nombre, sinAnim) {
    this.vistaActual = nombre; const { D, H, sala } = this.dim || { D: 8, H: 3 };
    const t = this.ctrl.target, caja = this.caja || new THREE.Box3(new THREE.Vector3(-4, 0, -4), new THREE.Vector3(4, 3, 4));
    const centro = caja.getCenter(new THREE.Vector3()), tam = caja.getSize(new THREE.Vector3());
    const fov = this.cam.fov * Math.PI / 180, asp = Math.max(0.5, this.cam.aspect);
    if (nombre === 'dentro') {
      if (sala) { this.cam.position.set(0, 1.62, D * 0.36); t.set(0, Math.min(1.7, H * 0.48), -D / 2); }
      else { const dp = this.modelo ? this.modelo.distPublico : 5; this.cam.position.set(0, 1.62, dp + 0.9); t.set(0, Math.min(centro.y, 1.8), caja.min.z); }
    } else if (nombre === 'planta') {
      const alto = Math.max(tam.z, tam.x / asp) / 2 / Math.tan(fov / 2) * 1.12;
      this.cam.position.set(centro.x, alto + tam.y, centro.z + 0.0005); t.set(centro.x, 0, centro.z);
    } else {
      const r = tam.length() / 2, dist = r / Math.sin(fov / 2) * (asp < 1 ? 1.25 / asp : 1.02);
      const dir = new THREE.Vector3(0.62, 0.5, 0.95).normalize();
      this.cam.position.copy(centro).addScaledVector(dir, dist); t.set(centro.x, centro.y * 0.7, centro.z);
    }
    this.ctrl.update(); this.render(); void sinAnim;
  }
  render() {
    if (!this.paredes) { this.renderer.render(this.scene, this.cam); return; }
    // vista seccionada: desde fuera se ocultan las paredes que quedan entre la cámara y la sala
    const c = this.cam.position, { W, D } = this.dim || { W: 0, D: 0 };
    const dentro = Math.abs(c.x) < W / 2 && Math.abs(c.z) < D / 2;
    this.paredes.forEach(g => { const n = g.userData.normal, v = new THREE.Vector3().subVectors(c, g.userData.plano); g.visible = dentro || v.dot(n) >= 0; });
    this.renderer.render(this.scene, this.cam);
    this.alCambiar();
  }
  // captura para el PDF: con fondo claro, para imprimir en papel blanco
  // (lienzo de 1600 × 820 encuadrado con la vista actual; después se devuelve la cámara donde estaba)
  captura(claro) {
    const r = this.renderer, bg = this.scene.background, pr = r.getPixelRatio(), pos = this.cam.position.clone(), obj = this.ctrl.target.clone();
    if (claro) this.scene.background = new THREE.Color(0xf4f4f6);
    r.setPixelRatio(1); r.setSize(1600, 820, false); this.cam.aspect = 1600 / 820; this.cam.updateProjectionMatrix(); this.vista(this.vistaActual, true);
    this.render(); const url = r.domElement.toDataURL('image/jpeg', 0.9);
    this.scene.background = bg; r.setPixelRatio(pr); this.cam.position.copy(pos); this.ctrl.target.copy(obj); this.ctrl.update(); this.ajustar();
    return url;
  }
}

function mMetal() { return new THREE.MeshStandardMaterial({ color: 0x1b1b1e, roughness: 0.55, metalness: 0.65 }); }
export const fmt = (v, d = 2) => Number(v).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d });
