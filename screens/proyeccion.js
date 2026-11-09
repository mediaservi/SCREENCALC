// SCREENS · cálculo de proyección (motor heredado de SCREENBOX v6.65, revisado).
// Catálogo de proyectores heredado de SCREENBOX (pendiente de pasarlo a la hoja / panel para que salga en vivo).
const CSV = `marca,modelo,optica,throwratio,lumens,aspectratio,resolucion,4K,screen,soos,image
EPSON,EB-815E,fija,0.16:1,5000,16:9,Full HD (1920 x 1080),4K Enhancement,160,248,https://charmex.net/images/epson-ust_2476_19_20250325104608.png
EPSON,EB-805F,fija,0.27 - 0.37:1,5000,16:9,Full HD (1920 x 1080),NO,130,250,https://charmex.net/images/epson-ust_2476_5_20210408172254.png
EPSON,EB-L695SE,fija,0.50 - 0.70:1,6000,16:10,WUXGA (1920 x 1200),4K Enhancement,500,600,https://charmex.net/images/epson-media-st_3156_16_20250513123910.png
EPSON,EB-L795SE,fija,0.79 - 1.36:1,6000,16:10,WUXGA (1920 x 1200),4K Enhancement,400,500,https://charmex.net/images/epson-media-st_3156_15_20250513123855.png
EPSON,EB-L695SU,fija,0.79 - 1.36:1,6200,16:10,WUXGA (1920 x 1200),NO,400,500,https://charmex.net/images/epson-media-st_3156_14_20250513123843.png
EPSON,EB-PU1008B,ELPLU03S (Short),0.65 - 0.78:1,7300,16:10,WUXGA (1920 x 1200),4K Enhancement,300,400,https://charmex.net/images/epson-lente-int_2475_26_20210705103031.png
EPSON,EB-PU1008B,ELPLU04 (Short),0.87 - 1.05:1,7700,16:10,WUXGA (1920 x 1200),4K Enhancement,300,400,https://charmex.net/images/epson-lente-int_2475_26_20210705103031.png
EPSON,EB-PU1008B,ELPLX01S (UST),0.35:1,7300,16:10,WUXGA (1920 x 1200),4K Enhancement,300,400,https://i8.amplience.net/i/epsonemear/pu2200_b_std_09_rni?$product-xlarge$&fmt=auto&img404=missing_product&v=1
EPSON,EB-PU2216B,ELPLU04 (Short),0.64 - 0.77:1,15200,16:10,WUXGA (1920 x 1200),4K Enhancement,1000,1100,https://charmex.net/images/epson-lente-int_2475_35_20220930121548.png
EPSON,EB-PU2216B,ELPLW08 (Short),0.86 - 1.21:1,15300,16:10,WUXGA (1920 x 1200),4K Enhancement,1000,1100,https://charmex.net/images/epson-lente-int_2475_35_20220930121548.png
EPSON,EB-PU2216B,ELPLX02S (UST),0.35:1,13500,16:10,WUXGA (1920 x 1200),4K Enhancement,1000,1100,https://i8.amplience.net/i/epsonemear/pu2200_b_std_09_rnb?$product-xlarge$&fmt=auto&img404=missing_product&v=1
EPSON,EB-PU2220B,ELPLW08 (Short),0.86 - 1.21:1,19100,16:10,WUXGA (1920 x 1200),4K Enhancement,1000,1100,https://charmex.net/images/epson-lente-int_2475_31_20220930124147.png`;

export const SOLAPE_MIN = 0.15, SOLAPE_MAX = 0.65;   // límites de blending de SCREENBOX
// Chasis (ancho × fondo × alto, m) según las fichas de Epson; la serie L695SE/L795SE/L695SU comparte chasis, igual que PU2216B/PU2220B
const CHASIS = { 'EB-815E': [0.695, 0.341, 0.156], 'EB-805F': [0.458, 0.375, 0.210], 'EB-L695SE': [0.440, 0.368, 0.151], 'EB-L795SE': [0.440, 0.368, 0.151], 'EB-L695SU': [0.440, 0.368, 0.151],
  'EB-PU1008B': [0.545, 0.436, 0.189], 'EB-PU2216B': [0.586, 0.492, 0.218], 'EB-PU2220B': [0.586, 0.492, 0.218] };
// Separación mínima entre chasis por la ventilación (guía de instalación de Epson: 10–40 cm libres alrededor de las rejillas;
// lado a lado, 150 cm sin mampara o 20–40 cm con mampara). Se aplica 40 cm en horizontal y 20 cm en vertical.
export const HOLGURA = { h: 0.40, v: 0.20, sinMampara: 1.5 };

function leer() {
  const filas = CSV.trim().split('\n').slice(1);
  return filas.map((l, i) => {
    const c = l.split(',');
    const tr = c[3].replace(':1', '').split('-').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const [aw, ah] = c[5].split(':').map(Number);
    const px = (c[6].match(/(\d{3,5})\s*x\s*(\d{3,5})/) || []).slice(1).map(Number);
    return {
      id: 'p' + i, marca: c[0], modelo: c[1], optica: c[2] === 'fija' ? '' : c[2],
      nombre: c[1] + (c[2] === 'fija' ? '' : ' + ' + c[2].replace(/\s*\(.*\)/, '')),
      trMin: Math.min(...tr), trMax: Math.max(...tr), lumens: Number(c[4]), ar: aw / ah, arTxt: c[5],
      resX: px[0] || 1920, resY: px[1] || 1080, resTxt: c[6], k4: /4K/i.test(c[7]),
      maxDiagPulg: Number(c[8]), maxDiagPulgOOS: Number(c[9]), imagen: c[10],
      ust: Math.min(...tr) < 0.4,
      chasis: CHASIS[c[1]] || [0.55, 0.45, 0.2]
    };
  });
}
export const PROYECTORES = leer();

// ancho máximo de imagen a partir de la diagonal máxima (pulgadas) y el formato
const anchoMax = (p, oos) => { const d = (oos ? p.maxDiagPulgOOS : p.maxDiagPulg) * 0.0254; return d * p.ar / Math.sqrt(1 + p.ar * p.ar); };

// Pared: una fila de proyectores con blending horizontal; la imagen cubre la altura útil de la pared.
// alcance = distancia disponible delante de la pared para colocar el proyector (m)
// En pantallas sueltas, si cubrir el alto obliga a un solape excesivo, se usa un proyector menos llenando el ancho
// y la imagen sobresale en vertical (recorte, hasta el 20 %), que es lo habitual al enmascarar una pantalla.
// dist: distancia óptica–pared fijada por el usuario (0 = la mínima del zoom); se ajusta al rango del zoom de la óptica
export function calcularPared(sup, p, { alcance, solapeMin = SOLAPE_MIN, oos = false, dist = 0 } = {}) {
  const W = sup.ancho, wMax = anchoMax(p, oos);
  const armar = (n, imgW, imgH, limite, recorte) => {
    const solape = n > 1 ? (n * imgW - W) / (n - 1) : 0, solapeRel = n > 1 ? solape / imgW : 0;
    const tMin = p.trMin * imgW, tMaxZ = p.trMax * imgW, fueraZoom = dist > 0 && (dist < tMin - 1e-6 || dist > tMaxZ + 1e-6);
    const tiro = dist > 0 ? Math.min(tMaxZ, Math.max(tMin, dist)) : tMin;
    const centros = n === 1 ? [0] : Array.from({ length: n }, (_, i) => -W / 2 + imgW / 2 + i * (imgW - solape));
    const solapePx = Math.round(p.resX * solapeRel);
    const resW = n * p.resX - (n - 1) * solapePx, resH = Math.round(p.resY * (1 - recorte));
    const lux = p.lumens / (imgW * imgH);
    const tiroMax = dist > 0 ? tiro : Math.max(tiro, Math.min(tMaxZ, alcance != null ? alcance : Infinity));
    return { n, imgW, imgH, solape, solapeRel, solapePx, tiro, tiroMax, tMin, tMaxZ, fueraZoom, ratio: tiro / imgW, fuera: alcance != null && tiro > alcance, limite, recorte, centros, resW, resH, lux, nits: lux / Math.PI };
  };
  let imgH = sup.alto, imgW = imgH * p.ar, limite = false;
  if (imgW > wMax) { imgW = wMax; imgH = imgW / p.ar; limite = true; }
  const n = imgW >= W ? 1 : 1 + Math.ceil((W - imgW) / (imgW * (1 - solapeMin)) - 1e-9);
  let r = armar(n, imgW, imgH, limite, 0);
  if ((sup.tipo === 'pantalla' || sup.tipo === 'pared') && n > 1 && r.solapeRel > SOLAPE_MAX) {
    const n2 = n - 1, w2 = W / (1 + (n2 - 1) * (1 - solapeMin)), h2 = w2 / p.ar, rec = (h2 - sup.alto) / h2;
    if (w2 <= wMax && rec <= 0.2) r = armar(n2, w2, h2, false, Math.max(0, rec));
  }
  return r;
}

// Suelo: rejilla de proyectores cenitales (desde el techo) con blending en los dos ejes
export function calcularSuelo(sup, p, { altoSala, solapeMin = SOLAPE_MIN, oos = false } = {}) {
  const tiro = Math.max(0.5, altoSala - 0.15);
  let imgW = Math.min(tiro / p.trMin, anchoMax(p, oos)), imgH = imgW / p.ar;
  const W = sup.ancho, D = sup.alto;
  const cols = imgW >= W ? 1 : 1 + Math.ceil((W - imgW) / (imgW * (1 - solapeMin)) - 1e-9);
  const rows = imgH >= D ? 1 : 1 + Math.ceil((D - imgH) / (imgH * (1 - solapeMin)) - 1e-9);
  const sx = cols > 1 ? (cols * imgW - W) / (cols - 1) : 0, sz = rows > 1 ? (rows * imgH - D) / (rows - 1) : 0;
  const pos = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pos.push({ x: cols === 1 ? 0 : -W / 2 + imgW / 2 + c * (imgW - sx), z: rows === 1 ? 0 : -D / 2 + imgH / 2 + r * (imgH - sz) });
  const resW = cols * p.resX - (cols - 1) * Math.round(p.resX * (cols > 1 ? sx / imgW : 0));
  const resH = rows * p.resY - (rows - 1) * Math.round(p.resY * (rows > 1 ? sz / imgH : 0));
  const lux = p.lumens / (imgW * imgH);
  return { n: cols * rows, cols, rows, imgW, imgH, tiro, ratio: p.trMin, solapeX: sx, solapeZ: sz, solapeRel: Math.max(cols > 1 ? sx / imgW : 0, rows > 1 ? sz / imgH : 0), pos, resW, resH, lux, nits: lux / Math.PI, fuera: false, limite: false };
}

// Proyector sugerido: el que cubre cada pared con menos equipos, cabiendo en la sala y con más brillo
export function sugerir(sups, alcances, opc = {}) {
  let mejor = null;
  for (const p of PROYECTORES) {
    let total = 0, fuera = false, limite = false, nitsMin = Infinity;
    sups.filter(s => s.tipo !== 'suelo').forEach((s, i) => {
      const r = calcularPared(s, p, { alcance: alcances[i], ...opc });
      total += r.n; fuera = fuera || r.fuera; limite = limite || r.limite; nitsMin = Math.min(nitsMin, r.nits);
    });
    const punt = (fuera ? -1000 : 0) + (limite ? -200 : 0) - total * 10 + Math.min(nitsMin, 200) / 4;
    if (!mejor || punt > mejor.punt) mejor = { p, punt };
  }
  return mejor ? mejor.p : PROYECTORES[0];
}

// ---------- Colocación de los proyectores y sombras del público ----------
export const ALTO_PERSONA = 1.85;   // persona de 1,75 m con margen (cabeza y pelo)
// pasa un punto local de la superficie (x a lo ancho, y alto, z hacia la sala) a coordenadas de la escena
const aMundo = (s, x, y, z) => ({ x: s.x + x * Math.cos(s.rot) + z * Math.sin(s.rot), y, z: s.z - x * Math.sin(s.rot) + z * Math.cos(s.rot) });
// Proyectores de una pared: lente a la distancia de tiro, colgados del techo (los UST, justo sobre la imagen)
export function colocarPared(s, p, prod, { alto, sala, techo: techoS }) {
  const altoPared = sala ? alto : s.elev + s.alto + 0.2;
  // colgado sobre la imagen (los UST, justo encima); en una sala, siempre por debajo del techo
  const techo = sala ? alto - 0.05 - prod.chasis[2] / 2 : (techoS > 0 ? techoS - 0.05 - prod.chasis[2] / 2 : Infinity);
  const yProy = Math.min(techo, prod.ust ? s.elev + p.imgH + 0.22 : Math.max(s.elev + p.imgH + 0.15, (sala ? alto : altoPared + 0.6) - 0.45));
  const y0 = s.elev - Math.max(0, p.imgH - s.alto) / 2, y1 = y0 + p.imgH, zL = Math.max(0.15, p.tiro), zMax = Math.max(zL, p.tiroMax || zL);
  return p.centros.map(cx => ({
    lente: aMundo(s, cx, yProy, zL), rot: s.rot, prod, ancho: p.imgW, zMax, nrm: { x: Math.sin(s.rot), z: Math.cos(s.rot) },
    esquinas: [[cx - p.imgW / 2, y1], [cx + p.imgW / 2, y1], [cx + p.imgW / 2, y0], [cx - p.imgW / 2, y0]].map(([a, b]) => aMundo(s, a, b, 0.01)),
    yProy, y0, y1, zL
  }));
}
export function colocarSuelo(p, alto) {
  return p.pos.map(q => ({ lente: { x: q.x, y: alto - 0.15, z: q.z }, rot: 0, prod: null, esquinas: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => ({ x: q.x + a * p.imgW / 2, y: 0.01, z: q.z + b * p.imgH / 2 })), suelo: true }));
}
const resta = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const cruz = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const punto = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
// ¿está el punto dentro de la pirámide del haz (vértice en la lente, base en la imagen)?
function dentroHaz(P, h, margen = 0) {
  const L = h.lente, Q = h.esquinas, C = Q.reduce((a, v) => ({ x: a.x + v.x / 4, y: a.y + v.y / 4, z: a.z + v.z / 4 }), { x: 0, y: 0, z: 0 });
  for (let k = 0; k < 4; k++) {
    const n = cruz(resta(Q[k], L), resta(Q[(k + 1) % 4], L)); const lado = punto(n, resta(C, L));
    if (punto(n, resta(P, L)) * Math.sign(lado) < -margen * Math.hypot(n.x, n.y, n.z)) return false;
  }
  const nb = cruz(resta(Q[1], Q[0]), resta(Q[3], Q[0])); // del lado de la lente respecto a la imagen
  return punto(nb, resta(P, Q[0])) * punto(nb, resta(L, Q[0])) > 0;
}
// Sombras, zona segura y cruces de haces de toda la instalación
// filas: [{ s, p, proyector, nombre }] · esp: espacio (sala o pantallas) · alto: alto de la sala o de la escena
// medio tamaño del chasis en la escena (los de pared miran a su pared; los cenitales, hacia el suelo)
function medio(h) {
  const [w, d, a] = (h.suelo ? (h.prod2 || h.prodS) : h.prod) ? (h.suelo ? (h.prod2 || h.prodS).chasis : h.prod.chasis) : [0.55, 0.45, 0.2];
  if (h.suelo) return { x: w / 2, y: d / 2, z: a / 2 };
  const lat = Math.abs(Math.sin(h.rot)) > 0.5;
  return { x: (lat ? d : w) / 2, y: a / 2, z: (lat ? w : d) / 2 };
}
const chocan = (a, b) => { const A = medio(a), B = medio(b);
  return Math.abs(a.lente.x - b.lente.x) < A.x + B.x + HOLGURA.h && Math.abs(a.lente.z - b.lente.z) < A.z + B.z + HOLGURA.h && Math.abs(a.lente.y - b.lente.y) < A.y + B.y + HOLGURA.v; };
// puntos del chasis (caja con su tamaño real alrededor de la lente)
const puntosCuerpo = (h) => { const M = medio(h), L = h.lente, out = [];
  for (const a of [-1, 0, 1]) for (const b of [-1, 0, 1]) for (const c of [-1, 1]) out.push({ x: L.x + a * M.x, y: L.y + c * M.y, z: L.z + b * M.z });
  return out; };
// problemas de un proyector frente a los ya colocados: chasis que se tocan, su chasis dentro del haz de otra superficie
// o, al revés, el chasis de otra superficie dentro de su haz (sombra en una imagen)
// caja que envuelve un haz (lente + imagen) para descartar rápido los puntos que no pueden estar dentro
const cajaHaz = (h) => { const P = [h.lente, ...h.esquinas]; return { x0: Math.min(...P.map(p => p.x)), x1: Math.max(...P.map(p => p.x)), y0: Math.min(...P.map(p => p.y)), y1: Math.max(...P.map(p => p.y)), z0: Math.min(...P.map(p => p.z)), z1: Math.max(...P.map(p => p.z)) }; };
const enCaja = (P, B) => P.x >= B.x0 && P.x <= B.x1 && P.y >= B.y0 && P.y <= B.y1 && P.z >= B.z0 && P.z <= B.z1;
const enHaz = (pts, h) => { const B = cajaHaz(h); return pts.some(P => enCaja(P, B) && dentroHaz(P, h)); };
function problemas(h, puestos, rapido) {
  let choque = null, haz = null; const ph = puntosCuerpo(h);
  for (const o of puestos) {
    if (!choque && chocan(h, o)) { choque = o; if (rapido) break; }
    if (!haz && o.sup !== h.sup && (enHaz(ph, o) || enHaz(puntosCuerpo(o), h))) { haz = o; if (rapido) break; }
    if (choque && haz) break;
  }
  return { choque, haz, n: (choque ? 1 : 0) + (haz ? 1 : 0) };
}
// Colocación sin choques ni sombras: cada proyector se prueba en su sitio y, si toca a otro chasis o queda dentro de otro haz
// (o mete otro chasis en el suyo), se busca la variante más cercana: alejarlo de su pared con el zoom de la óptica,
// colgarlo más bajo o más alto (sin pasar del techo ni bajar de 2,3 m) o desplazarlo por su pared con el lens shift.
// Los cenitales del suelo van fijos junto al techo y se colocan primero.
export function resolverChoques(haces, alto) {
  const puestos = [], movs = [], choques = [];
  const orden = haces.slice().sort((a, b) => (b.suelo ? 1 : 0) - (a.suelo ? 1 : 0));
  orden.forEach(h => {
    const base = { ...h.lente }, zL0 = h.zL, M = medio(h);
    const inicial = problemas(h, puestos);
    if (!inicial.n) { puestos.push(h); return; }
    const paso = M.y * 2 + HOLGURA.v, techo = alto - 0.05 - M.y, suelo = 2.3 + M.y;
    const dzs = [0], dys = [0], dxs = [0];
    if (!h.suelo) {
      for (let z = 0.25; zL0 + z <= (h.zMax || zL0) + 1e-6 && dzs.length < 9; z += 0.25) dzs.push(z);
      for (let k = 1; k <= 4; k++) dys.push(-k * paso, k * paso);
      const lado = M.x * 2 + HOLGURA.h, lim = (h.ancho || 0) * 0.25;
      for (let k = 1; k * lado <= lim + 1e-6; k++) dxs.push(k * lado, -k * lado);
    }
    const cand = [];
    dzs.forEach(dz => dys.forEach(dy => dxs.forEach(dx => { if (dz || dy || dx) cand.push({ dz, dy, dx, c: dz + Math.abs(dy) * 1.5 + Math.abs(dx) * 1.2 }); })));
    cand.sort((a, b) => a.c - b.c);
    const poner = (c) => { const n = h.nrm || { x: 0, z: 0 };
      h.lente = { x: base.x + n.x * c.dz + c.dx * Math.cos(h.rot), y: base.y + c.dy, z: base.z + n.z * c.dz - c.dx * Math.sin(h.rot) }; h.zL = zL0 + c.dz; };
    let ok = null, sinChoque = null;
    for (const c of cand) {
      const y = base.y + c.dy; if (y > techo + 1e-6 || y < suelo - 1e-6) continue;
      poner(c); const pr = problemas(h, puestos, true);
      if (!pr.n) { ok = c; break; }
      if (!sinChoque && inicial.choque && !chocan(h, puestos.find(o => chocan(h, o)) || h)) sinChoque = c;
    }
    if (ok) movs.push({ h, ...ok, con: inicial.choque || inicial.haz, por: inicial.choque ? 'choque' : 'haz' });
    else {
      // sin ubicación limpia: al menos que los chasis no se toquen (la sombra queda avisada)
      if (sinChoque && !puestos.some(o => { poner(sinChoque); return chocan(h, o); })) { poner(sinChoque); movs.push({ h, ...sinChoque, con: inicial.choque, por: 'choque' }); }
      else { h.lente = base; h.zL = zL0; }
      const pr = problemas(h, puestos); if (pr.choque) choques.push({ h, con: pr.choque });
    }
    puestos.push(h);
  });
  return { movs, choques };
}
export function analizarSombras(filas, esp, alto) {
  const sala = esp.tipo === 'sala', haces = [], franjas = [], avisos = [];
  filas.forEach(f => {
    if (f.s.tipo === 'suelo') { colocarSuelo(f.p, alto).forEach((h, i) => haces.push({ ...h, prodS: f.proyector, sup: f.s.id, nombre: f.nombre, i })); return; }
    colocarPared(f.s, f.p, f.proyector, { alto, sala, techo: esp.tipo === 'sala' ? 0 : (esp.sueltas && esp.sueltas.techo) || 0 }).forEach((h, i) => haces.push({ ...h, sup: f.s.id, nombre: f.nombre, i, fila: f }));
  });
  const colocacion = resolverChoques(haces, alto);
  // franja de sombra de cada pared con la altura final de sus lentes:
  // el borde inferior del haz sube desde la base de la imagen (en la pared) hasta la lente
  filas.forEach(f => {
    if (f.s.tipo === 'suelo') return;
    let zS = 0;
    haces.filter(h => h.fila === f).forEach(h => { const yL = h.lente.y; if (h.y0 < ALTO_PERSONA) zS = Math.max(zS, yL > h.y0 ? Math.min(h.zL, h.zL * (ALTO_PERSONA - h.y0) / (yL - h.y0)) : h.zL); });
    const tiroReal = Math.max(f.p.tiro, ...haces.filter(h => h.fila === f).map(h => h.zL));
    franjas.push({ id: f.s.id, nombre: f.nombre, s: f.s, prof: zS, tiro: tiroReal, ust: f.proyector.ust, ancho: f.s.ancho });
  });
  // zona segura: en una sala, el rectángulo que queda libre de las franjas de sombra de cada pared
  let zona = null;
  if (sala) {
    const fr = (id) => (franjas.find(x => x.id === id) || { prof: 0 }).prof;
    const W = esp.ancho, D = esp.fondo;
    zona = { x0: -W / 2 + fr('izquierda'), x1: W / 2 - fr('derecha'), z0: -D / 2 + fr('frontal'), z1: D / 2 - fr('trasera') };
    zona.ancho = zona.x1 - zona.x0; zona.fondo = zona.z1 - zona.z0; zona.ok = zona.ancho >= 0.6 && zona.fondo >= 0.6;
  }
  // conflictos: un proyector (su cuerpo) dentro del haz de otro → sombra en la imagen de ese otro
  const conflictos = [], cruces = [];
  haces.forEach((a, ia) => haces.forEach((b, ib) => {
    if (ia === ib || a.sup === b.sup) return;
    if (puntosCuerpo(a).some(P => dentroHaz(P, b))) conflictos.push({ tapa: a, haz: b });
  }));
  // cruces de haces entre superficies distintas (muestreo de rayos de cada haz)
  for (let ia = 0; ia < haces.length; ia++) for (let ib = ia + 1; ib < haces.length; ib++) {
    const a = haces[ia], b = haces[ib]; if (a.sup === b.sup) continue;
    let cruza = false;
    for (let u = 0.1; u <= 0.9 && !cruza; u += 0.2) for (let v = 0.1; v <= 0.9 && !cruza; v += 0.2) {
      const Q = a.esquinas, base = { x: (1 - u) * (1 - v) * Q[0].x + u * (1 - v) * Q[1].x + u * v * Q[2].x + (1 - u) * v * Q[3].x, y: (1 - u) * (1 - v) * Q[0].y + u * (1 - v) * Q[1].y + u * v * Q[2].y + (1 - u) * v * Q[3].y, z: (1 - u) * (1 - v) * Q[0].z + u * (1 - v) * Q[1].z + u * v * Q[2].z + (1 - u) * v * Q[3].z };
      for (let t = 0.15; t <= 0.9 && !cruza; t += 0.15) { const P = { x: a.lente.x + (base.x - a.lente.x) * t, y: a.lente.y + (base.y - a.lente.y) * t, z: a.lente.z + (base.z - a.lente.z) * t }; if (dentroHaz(P, b)) cruza = true; }
    }
    if (cruza && !cruces.some(c => (c.a === a.sup && c.b === b.sup) || (c.a === b.sup && c.b === a.sup))) cruces.push({ a: a.sup, b: b.sup, na: a.nombre, nb: b.nombre });
  }
  return { haces, franjas, zona, conflictos, cruces, avisos, persona: ALTO_PERSONA, movs: colocacion.movs, choques: colocacion.choques };
}

// Obstáculos (columnas, cajas…) que cortan algún haz: harán sombra en esa imagen
export function obstaculosEnHaces(obs, haces) {
  const out = [];
  obs.forEach((o, k) => {
    const pts = [];
    for (const a of [-0.5, 0, 0.5]) for (const b of [-0.5, 0, 0.5]) for (const c of [0.02, 0.5, 1]) pts.push({ x: o.x + a * o.ancho, y: c * o.alto, z: o.z + b * o.fondo });
    const tocados = haces.filter(h => pts.some(P => dentroHaz(P, h)));
    const sups = [...new Set(tocados.map(h => h.nombre))];
    if (sups.length) out.push({ k, nombres: sups });
  });
  return out;
}
