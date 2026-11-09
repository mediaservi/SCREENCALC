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
      ust: Math.min(...tr) < 0.4
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
export function calcularPared(sup, p, { alcance, solapeMin = SOLAPE_MIN, oos = false } = {}) {
  const W = sup.ancho, wMax = anchoMax(p, oos);
  const armar = (n, imgW, imgH, limite, recorte) => {
    const solape = n > 1 ? (n * imgW - W) / (n - 1) : 0, solapeRel = n > 1 ? solape / imgW : 0;
    const tiro = p.trMin * imgW;
    const centros = n === 1 ? [0] : Array.from({ length: n }, (_, i) => -W / 2 + imgW / 2 + i * (imgW - solape));
    const solapePx = Math.round(p.resX * solapeRel);
    const resW = n * p.resX - (n - 1) * solapePx, resH = Math.round(p.resY * (1 - recorte));
    const lux = p.lumens / (imgW * imgH);
    return { n, imgW, imgH, solape, solapeRel, solapePx, tiro, ratio: p.trMin, fuera: alcance != null && tiro > alcance, limite, recorte, centros, resW, resH, lux, nits: lux / Math.PI };
  };
  let imgH = sup.alto, imgW = imgH * p.ar, limite = false;
  if (imgW > wMax) { imgW = wMax; imgH = imgW / p.ar; limite = true; }
  const n = imgW >= W ? 1 : 1 + Math.ceil((W - imgW) / (imgW * (1 - solapeMin)) - 1e-9);
  let r = armar(n, imgW, imgH, limite, 0);
  if (sup.tipo === 'pantalla' && n > 1 && r.solapeRel > SOLAPE_MAX) {
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
