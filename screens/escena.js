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
    new ResizeObserver(() => this.ajustar()).observe(lienzo.parentElement);
    this.ajustar();
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
    const k = Wc / sup.ancho, yBase = sup.elev - Math.max(0, res.imgH - sup.alto) / 2, yTop = Hc - (yBase + res.imgH) * k, ih = res.imgH * k, iw = res.imgW * k;
    // imagen conjunta con blending (zona proyectada)
    const xi = Math.max(0, (sup.ancho / 2 - (res.n * res.imgW - (res.n - 1) * res.solape) / 2) * k);
    const anchoTot = Math.min(Wc, (res.n * res.imgW - (res.n - 1) * res.solape) * k);
    if (cont === 'panorama') {
      const pano = this._panorama(); x.drawImage(pano.img, 0, 0, pano.img.width, pano.img.height, xi, yTop, anchoTot, ih);
    } else if (cont !== 'apagado') {
      const g = x.createLinearGradient(xi, 0, xi + anchoTot, 0); g.addColorStop(0, '#2a1260'); g.addColorStop(0.5, '#0c3a5a'); g.addColorStop(1, '#14501f'); x.fillStyle = g; x.fillRect(xi, yTop, anchoTot, ih);
      x.strokeStyle = 'rgba(255,255,255,.2)'; x.lineWidth = 2; const paso = ih / 6;
      for (let u = xi; u <= xi + anchoTot; u += paso) { x.beginPath(); x.moveTo(u, yTop); x.lineTo(u, yTop + ih); x.stroke(); }
      for (let v = 0; v <= 6; v++) { x.beginPath(); x.moveTo(xi, yTop + v * paso); x.lineTo(xi + anchoTot, yTop + v * paso); x.stroke(); }
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `800 ${Math.round(ih * 0.1)}px ${SANS}`; x.fillText(nombre.toUpperCase(), xi + anchoTot / 2, yTop + ih * 0.42);
      x.font = `${Math.round(ih * 0.075)}px ${MONO}`; x.fillStyle = '#00ff04'; x.fillText(`${res.resW} × ${res.resH} px`, xi + anchoTot / 2, yTop + ih * 0.58);
    }
    // contorno de cada imagen y zonas de blending
    res.centros.forEach((cx, i) => {
      const x0 = (sup.ancho / 2 + cx - res.imgW / 2) * k;
      x.strokeStyle = COL_PROY[i % COL_PROY.length]; x.lineWidth = Math.max(3, Wc / 500); x.setLineDash([]); x.strokeRect(x0 + 2, yTop + 2, iw - 4, ih - 4);
      if (i > 0 && res.solape > 0) { const sx = x0, sw = res.solape * k; x.fillStyle = 'rgba(255,255,255,.10)'; x.fillRect(sx, yTop, sw, ih); x.setLineDash([14, 10]); x.strokeStyle = 'rgba(255,255,255,.65)'; x.strokeRect(sx, yTop, sw, ih); x.setLineDash([]); }
      x.fillStyle = COL_PROY[i % COL_PROY.length]; x.font = `${Math.round(ih * 0.06)}px ${MONO}`; x.textAlign = 'left'; x.fillText('P' + (i + 1), x0 + ih * 0.04, yTop + ih * 0.08);
    });
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
    const pano = m.contenido === 'panorama' ? this._panorama() : null;
    // tramos del panorama en el orden de recorrido
    const ordenPano = m.superficies.filter(f => f.s.tipo !== 'suelo');
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
        const tex = this._cartaLed(s, r, f.nombre, m.contenido, pano ? { img: pano.img, ...tramo[s.id], altoMax } : null);
        if (s.tipo === 'suelo') {
          const lo = new THREE.Mesh(new THREE.BoxGeometry(r.ancho, 0.06, r.alto), [mMetal(), mMetal(), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), mMetal(), mMetal(), mMetal()]);
          lo.position.y = 0.03; G.add(lo); return;
        }
        const frente = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
        const caja = new THREE.Mesh(new THREE.BoxGeometry(r.ancho, r.alto, t), [mMetal(), mMetal(), mMetal(), mMetal(), frente, mMetal()]);
        caja.position.set(0, s.elev + r.alto / 2, t / 2 + 0.005); caja.castShadow = true; g.add(caja);
        if (s.tipo === 'pantalla') { // estructura de suelo para pantallas sueltas elevadas
          if (s.elev > 0.05) [-1, 1].forEach(lado => { const pata = new THREE.Mesh(new THREE.BoxGeometry(0.08, s.elev, 0.08), mMetal()); pata.position.set(lado * (r.ancho / 2 - 0.2), s.elev / 2, t / 2); pata.castShadow = true; g.add(pata); });
        }
        // la pantalla ilumina la sala con su color medio
        if (luces < 6 && m.contenido !== 'apagado') {
          // la luz rectangular emite hacia su −Z: girada 180° para que ilumine hacia la sala (+Z local)
          const l = new THREE.RectAreaLight(tex.userData.medio, 9, r.ancho, r.alto); l.position.set(0, s.elev + r.alto / 2, t + 0.02); l.rotation.set(0, Math.PI, 0);
          g.add(l); luces++;
        }
        if (m.etiquetas) this._etiquetaLocal(g, `${f.nombre.toUpperCase()} · ${r.cols}×${r.rows} · ${r.resW}×${r.resH}`, new THREE.Vector3(0, s.elev + r.alto + 0.28, t + 0.05));
      }
      if (m.tecnologia === 'proy' && f.p) {
        const p = f.p, prod = f.proyector;
        if (s.tipo === 'suelo') {
          const tex = this._sueloProy(s, p, m.contenido);
          const pl = new THREE.Mesh(new THREE.PlaneGeometry(s.ancho, s.alto), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
          pl.rotation.x = -Math.PI / 2; pl.position.y = 0.006; G.add(pl);
          p.pos.forEach((q, i) => this._proyector(G, new THREE.Vector3(q.x, H - 0.15, q.z), [
            new THREE.Vector3(q.x - p.imgW / 2, 0.01, q.z - p.imgH / 2), new THREE.Vector3(q.x + p.imgW / 2, 0.01, q.z - p.imgH / 2),
            new THREE.Vector3(q.x + p.imgW / 2, 0.01, q.z + p.imgH / 2), new THREE.Vector3(q.x - p.imgW / 2, 0.01, q.z + p.imgH / 2)], i + 10, prod, true, m.conflictos && m.conflictos.has(s.id + ':' + i)));
          return;
        }
        const altoPared = sala ? H : s.elev + s.alto + 0.2;
        const tex = this._paredProy(s, p, m.contenido, altoPared, f.nombre);
        const lienzo = new THREE.Mesh(new THREE.PlaneGeometry(s.ancho, altoPared), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
        lienzo.position.set(0, altoPared / 2, 0.004); g.add(lienzo);
        if (!sala) { const marco = new THREE.Mesh(new THREE.BoxGeometry(s.ancho + 0.08, altoPared + 0.04, 0.04), mMetal()); marco.position.set(0, altoPared / 2, -0.02); g.add(marco); }
        // proyectores de la pared: delante de ella a la distancia de tiro; los UST, justo sobre la imagen (misma colocación que el análisis de sombras)
        const v3 = (q) => new THREE.Vector3(q.x, q.y, q.z);
        // posiciones finales del análisis (con los choques entre chasis ya resueltos); si no hay, la colocación base
        const hs = (m.haces && m.haces.filter(h => h.sup === s.id && !h.suelo)) || [];
        (hs.length ? hs : colocarPared(s, p, prod, { alto: H, sala: !!sala })).forEach((h, i) => this._proyector(G, v3(h.lente), h.esquinas.map(v3), i, prod, false, m.conflictos && m.conflictos.has(s.id + ':' + i)));
        if (m.etiquetas) this._etiquetaLocal(g, `${f.nombre.toUpperCase()} · ${p.n}× · ${p.resW}×${p.resH}`, new THREE.Vector3(0, s.elev + p.imgH + 0.3, 0.08));
      }
      void idx;
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
      c.expandByPoint(new THREE.Vector3(0, 0, m.distPublico + 0.6)); this.caja = c;
    }
    // sombra y encuadre de la luz direccional
    const R = Math.max(W, D) * 0.8; Object.assign(this.sol.shadow.camera, { left: -R, right: R, top: R, bottom: -R, near: 1, far: 60 }); this.sol.shadow.camera.updateProjectionMatrix();
    this.ctrl.target.set(0, Math.min(H, altoMax) * 0.45, sala ? 0 : -1);
    this.vista(this.vistaActual, true);
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
  _proyector(G, lente, esquinas, i, prod, suelo, tapa) {
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
  captura() { this.render(); return this.renderer.domElement.toDataURL('image/png'); }
}

function mMetal() { return new THREE.MeshStandardMaterial({ color: 0x1b1b1e, roughness: 0.55, metalness: 0.65 }); }
export const fmt = (v, d = 2) => Number(v).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d });
