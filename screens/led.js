// SCREENS · geometría del espacio y cálculo LED por superficie (misma lógica que SCREENCALC).
export const PX_PUERTO = 650000;            // píxeles por puerto Ethernet (8 bit, 60 Hz), igual que SCREENCALC
export const PX_SALIDA_4K = 3840 * 2160;   // una salida 4K UHD de mediaserver

// Superficies del espacio. Sala centrada en el origen, suelo en y = 0; el público mira hacia la pared frontal (−z).
// Cada superficie: id, ancho y alto disponibles (m), elevación, posición del centro de su base y giro (rad) en el eje Y.
export function superficies(esp, grosor = 0) {
  const out = [];
  if (esp.tipo === 'sala') {
    const { ancho: W, fondo: D, alto: H } = esp;
    const elev = Math.max(0, Math.min(esp.elev || 0, H - 0.1));
    const altoUtil = Math.max(0.1, Math.min(esp.altoCubierto > 0 ? esp.altoCubierto : H - elev, H - elev));
    const p = esp.paredes;
    const gF = p.frontal ? grosor : 0, gT = p.trasera ? grosor : 0;
    if (p.frontal) out.push({ id: 'frontal', ancho: W, alto: altoUtil, elev, x: 0, z: -D / 2, rot: 0, tipo: 'pared' });
    if (p.izquierda) out.push({ id: 'izquierda', ancho: Math.max(0.1, D - gF - gT), alto: altoUtil, elev, x: -W / 2, z: (gF - gT) / 2, rot: Math.PI / 2, tipo: 'pared' });
    if (p.derecha) out.push({ id: 'derecha', ancho: Math.max(0.1, D - gF - gT), alto: altoUtil, elev, x: W / 2, z: (gF - gT) / 2, rot: -Math.PI / 2, tipo: 'pared' });
    if (p.trasera) out.push({ id: 'trasera', ancho: W, alto: altoUtil, elev, x: 0, z: D / 2, rot: Math.PI, tipo: 'pared' });
    if (p.suelo) out.push({ id: 'suelo', ancho: W, alto: D, elev: 0, x: 0, z: 0, rot: 0, tipo: 'suelo' });
  } else {
    // Pantallas sueltas: en línea o en arco, de izquierda a derecha, frente al público
    const s = esp.sueltas, n = Math.max(1, Math.min(8, s.n | 0));
    const w = s.ancho, sep = Math.max(0, s.sep), ang = (s.disp === 'arco' ? s.angulo : 0) * Math.PI / 180;
    // se construye de la pantalla central hacia fuera para que el conjunto quede simétrico
    const pos = [];
    if (ang === 0) {
      const total = n * w + (n - 1) * sep;
      for (let i = 0; i < n; i++) pos.push({ x: -total / 2 + w / 2 + i * (w + sep), z: 0, rot: 0 });
    } else {
      // cada pantalla gira «ang» respecto a la anterior; se encadenan por los bordes con la separación indicada
      const mitad = (n - 1) / 2;
      const giro = (k) => (k - mitad) * ang;
      // centro de la pantalla k recorriendo la cadena desde la central
      const centro = (k) => {
        let x = 0, z = 0;
        if (n % 2 === 1) { x = 0; z = 0; } else { x = -(w + sep) / 2 * Math.cos(giro(mitad - 0.5)); z = 0; }
        return { x, z };
      };
      // cadena desde una pantalla de referencia
      const ref = Math.floor(mitad);
      const P = new Array(n);
      P[ref] = { x: n % 2 === 1 ? 0 : -(w + sep) / 2, z: 0, rot: -giro(ref) };
      for (let k = ref + 1; k < n; k++) {
        const a = P[k - 1], r1 = giro(k - 1), r2 = giro(k);
        const bx = a.x + Math.cos(r1) * (w / 2) + Math.cos((r1 + r2) / 2) * sep, bz = a.z + Math.sin(r1) * (w / 2) + Math.sin((r1 + r2) / 2) * sep;
        P[k] = { x: bx + Math.cos(r2) * (w / 2), z: bz + Math.sin(r2) * (w / 2), rot: -r2 };
      }
      for (let k = ref - 1; k >= 0; k--) {
        const a = P[k + 1], r1 = giro(k + 1), r2 = giro(k);
        const bx = a.x - Math.cos(r1) * (w / 2) - Math.cos((r1 + r2) / 2) * sep, bz = a.z - Math.sin(r1) * (w / 2) - Math.sin((r1 + r2) / 2) * sep;
        P[k] = { x: bx - Math.cos(r2) * (w / 2), z: bz - Math.sin(r2) * (w / 2), rot: -r2 };
      }
      void centro;
      P.forEach(p => pos.push(p));
    }
    // el conjunto se coloca delante del público (que está en z = +distancia)
    const zMax = Math.max(...pos.map(p => p.z));
    pos.forEach((p, i) => out.push({ id: 'p' + (i + 1), num: i + 1, ancho: w, alto: s.alto, elev: s.elev, x: p.x, z: p.z - zMax, rot: p.rot, tipo: 'pantalla' }));
  }
  return out;
}

// Distancia de referencia del público a las superficies (para el pitch automático)
export function distanciaPublico(esp) {
  if (esp.tipo === 'sala') return Math.max(0.5, Math.min(esp.ancho, esp.fondo) / 2);
  return Math.max(0.5, esp.sueltas.dist);
}

// Pitch automático: el mayor pitch cuya distancia mínima de visión (1 m por mm de pitch) cabe en la distancia del público
export function elegirModelo(lista, dist) {
  if (!lista.length) return null;
  const validos = lista.filter(m => m.pitch <= dist + 1e-9);
  if (!validos.length) return lista[0];
  const pMax = Math.max(...validos.map(m => m.pitch));
  return validos.find(m => m.pitch === pMax) || validos[validos.length - 1];
}

// Cálculo LED de una superficie con un modelo de cabinet
export function calcularLed(sup, m, ajuste = 'dentro') {
  const cw = m.cabAncho / 1000, ch = m.cabAlto / 1000;
  const f = ajuste === 'dentro' ? (v) => Math.floor(v + 1e-6) : Math.round;
  const cols = Math.max(1, f(sup.ancho / cw)), rows = Math.max(1, f(sup.alto / ch));
  const cab = cols * rows;
  const resW = cols * m.cabPixAncho, resH = rows * m.cabPixAlto, pix = resW * resH;
  const pixCab = m.cabPixAncho * m.cabPixAlto;
  const cabPuerto = Math.floor(PX_PUERTO / pixCab);
  const lineas = cabPuerto > 0 ? Math.ceil(cab / cabPuerto) : Math.ceil(pix / PX_PUERTO);
  return {
    cols, rows, cab, ancho: cols * cw, alto: rows * ch, resW, resH, pix, lineas,
    peso: cab * (m.cabKg || 0), kw: m.wMax ? cab * m.wMax / 1000 : 0, amp: cab * (Number(m.cabAmp) || 0),
    salidas4k: Math.ceil(resW / 3840) * Math.ceil(resH / 2160),
    sobra: { w: sup.ancho - cols * cw, h: sup.alto - rows * ch }
  };
}

export function totales(filas) {
  const t = { cab: 0, pix: 0, peso: 0, kw: 0, amp: 0, lineas: 0, salidas4k: 0 };
  filas.forEach(({ r }) => { if (!r) return; t.cab += r.cab; t.pix += r.pix; t.peso += r.peso; t.kw += r.kw; t.amp += r.amp; t.lineas += r.lineas; t.salidas4k += r.salidas4k; });
  // lienzo de contenido: las paredes en orden de recorrido (izquierda → frontal → derecha → trasera) a la misma altura
  const orden = ['izquierda', 'frontal', 'derecha', 'trasera'];
  const paredes = filas.filter(f => f.r && f.s.tipo !== 'suelo');
  const sec = paredes.sort((a, b) => (orden.indexOf(a.s.id) + 10 * (a.s.tipo === 'pantalla' ? a.s.num : 0)) - (orden.indexOf(b.s.id) + 10 * (b.s.tipo === 'pantalla' ? b.s.num : 0)));
  t.lienzoW = sec.reduce((s, f) => s + f.r.resW, 0);
  t.lienzoH = sec.reduce((s, f) => Math.max(s, f.r.resH), 0);
  return t;
}
