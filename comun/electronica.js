/*
  SCREENS · motor común de electrónica de control LED (una pantalla LED y varias)
  Procesadores, tarjetas, conversores y mediaservers con especificaciones de fabricante,
  y el cálculo de las configuraciones adecuadas para un proyecto (líneas Ethernet y píxeles).
  Se carga como script clásico en led.html y con import en la consola de SCREENS: expone globalThis.SC_ELEC.
  Licencia GPL-3.0 · mediaservi.com
*/
(function () {
  'use strict';
  const ELEC_PX_PUERTO = 650000;          // píxeles por puerto Ethernet (8 bit, 60 Hz)
  const ELEC_PX_4K = 3840 * 2160;         // píxeles de una salida 4K UHD (la misma constante que la consola)
  const ELEC_CVT = { ref: 'CVT10 Pro', porCvt: 10, desc: 'Conv. fibra→10 RJ45 (pantalla)' };
  const CHARMEX_NOVASTAR = 'https://charmex.net/novastar-';
  // Búsqueda en Charmex por modelo: sirve de enlace cuando no hay URL directa de producto
  const charmexBusca = (modelo) => 'https://charmex.net/productos-search/' + encodeURIComponent(String(modelo).replace(/\s*\(.*\)\s*$/, '').trim());

  // rj = salidas RJ45 · opt = salidas ópticas 10G (espejo de los RJ45 salvo equipos solo fibra)
  // ppo = puertos Ethernet que transporta cada salida óptica · capPx = capacidad total en píxeles
  const ELEC_DEVICES = [
    { id: 'MCTRL660PRO', marca: 'NOVASTAR', serie: 'MCTRL',        modelo: 'MCTRL660 PRO', rj: 6,  opt: 2,  ppo: 6,  capPx: 2304000,   escalador: false, url: null },
    { id: 'MCTRL4K',     marca: 'NOVASTAR', serie: 'MCTRL',        modelo: 'MCTRL 4K',     rj: 16, opt: 4,  ppo: 8,  capPx: 8800000,   escalador: false, url: 'https://www.novastar.tech/product/detail.html?catid=2&id=24' },
    { id: 'VX400PRO',    marca: 'NOVASTAR', serie: 'VX Pro',       modelo: 'VX400 Pro',    rj: 4,  opt: 2,  ppo: 10, capPx: 2600000,   escalador: true,  url: 'https://charmex.net/novastar-serie-vx--vx400-pro/44270' },
    { id: 'VX600PRO',    marca: 'NOVASTAR', serie: 'VX Pro',       modelo: 'VX600 Pro',    rj: 6,  opt: 2,  ppo: 10, capPx: 3900000,   escalador: true,  url: null },
    { id: 'VX1000PRO',   marca: 'NOVASTAR', serie: 'VX Pro',       modelo: 'VX1000 Pro',   rj: 10, opt: 2,  ppo: 10, capPx: 6500000,   escalador: true,  url: CHARMEX_NOVASTAR + 'serie-vx--vx1000-pro' },
    { id: 'VX2000PRO',   marca: 'NOVASTAR', serie: 'VX Pro',       modelo: 'VX2000 Pro',   rj: 20, opt: 4,  ppo: 10, capPx: 13000000,  escalador: true,  url: null },
    { id: 'NOVAPROJR',   marca: 'NOVASTAR', serie: 'NovaPro',      modelo: 'NovaPro UHD Jr', rj: 16, opt: 4, ppo: 8, capPx: 10400000,  escalador: true,  url: null },
    { id: 'MX20',        marca: 'COEX',     serie: 'MX',      modelo: 'MX20',         rj: 6,  opt: 2,  ppo: 10, capPx: 3900000,   escalador: true,  url: null },
    { id: 'MX30',        marca: 'COEX',     serie: 'MX',      modelo: 'MX30',         rj: 10, opt: 2,  ppo: 10, capPx: 6500000,   escalador: true,  url: null },
    { id: 'MX40PRO',     marca: 'COEX',     serie: 'MX Pro',     modelo: 'MX40 Pro',     rj: 20, opt: 4,  ppo: 10, capPx: 9000000,   escalador: true,  url: CHARMEX_NOVASTAR + 'serie-mx-electronica--mx40-pro' },
    { id: 'MX2000PRO',   marca: 'COEX',     serie: 'MX Pro',     modelo: 'MX2000 Pro',   rj: 0,  opt: 8,  ppo: 10, capPx: 35380000,  escalador: true,  url: null, soloFibra: true, chasis: 'MX2000' },
    { id: 'MX6000PRO',   marca: 'COEX',     serie: 'MX Pro',     modelo: 'MX6000 Pro',   rj: 0,  opt: 24, ppo: 10, capPx: 141000000, escalador: true,  url: null, soloFibra: true, chasis: 'MX6000' }
  ];
  // COEX MX Pro modulares (solo chasis): hay que añadir tarjetas de salida, módulos ópticos y tarjetas de entrada.
  // Fichas del fabricante: MX2000 Pro = 2 ranuras de entrada + 2 de salida; MX6000 Pro = 8 + 8.
  // Salida 1G: MX_4x10G_Fiber (4 puertos ópticos SFP+, módulos aparte) + conversor CVT10 estándar
  // (el CVT10-M ya trae de serie sus módulos SFP+ multimodo). Entradas: MX6000 Pro admite 2×HDMI 2.1,
  // 4×HDMI 2.0, 2×DP 1.4 y 4×12G-SDI; MX2000 Pro admite 4×HDMI 2.0 y 2×DP 1.4.
  const ELEC_MX_CHASIS = {
    MX2000: { slotsIn: 2, slotsOut: 2, entradas: { HDMI: { ref: 'MX_4xHDMI 2.0', n: 4, desc: 'Tarjeta entrada MX 4×HDMI 2.0' }, DP: { ref: 'MX_2xDP 1.4', n: 2, desc: 'Tarjeta entrada MX 2×DP 1.4' } } },
    MX6000: { slotsIn: 8, slotsOut: 8, entradas: { HDMI: { ref: 'MX-2XHDMI2.1', n: 2, desc: 'Tarjeta entrada MX 2×HDMI 2.1' }, DP: { ref: 'MX_2xDP 1.4', n: 2, desc: 'Tarjeta entrada MX 2×DP 1.4' }, SDI: { ref: 'MX_4x12G-SDI', n: 4, desc: 'Tarjeta entrada MX 4×12G-SDI' } } }
  };
  const ELEC_MX_TARJ_OUT = { ref: 'MX-4X10G-OPT-M', opt: 4, desc: 'Tarjeta salida serie MX 4×OPT multimodo' };
  const ELEC_MX_SFP = { ref: '10G SFP Module-M', desc: 'Módulo SFP+ 10G multimodo (puertos de la tarjeta de salida)' };
  const ELEC_MX_CVT = { ref: 'CVT10-M', desc: 'Conv. fibra→10 RJ45 multimodo (incluye sus módulos SFP+)' };

  // H Series: equipo modular (se monta por piezas como un PC): chasis + tarjetas de salida + tarjetas de entrada / previo.
  // maxTarj = nº máximo de tarjetas de salida; maxIn = posiciones para tarjetas de entrada o de previo (fichas NovaStar).
  // ref = referencia comercial del chasis en Charmex.
  const ELEC_H_CHASIS = [
    { id: 'H2', ref: 'H2-MAINFRAME', maxTarj: 2, maxIn: 4 }, { id: 'H5', ref: 'H5-MAINFRAME', maxTarj: 3, maxIn: 10 }, { id: 'H9', ref: 'H9-MAINFRAME', maxTarj: 5, maxIn: 15 },
    { id: 'H15', ref: 'H15-MAINFRAME', maxTarj: 10, maxIn: 30 }, { id: 'H20', ref: 'H20-MAINFRAME', maxTarj: 20, maxIn: 40 }
  ];
  // Tarjeta de entrada mínima (si no se indicó tipo ni número de entradas) y tarjeta base de previo y salidas, recomendada en todos los proyectos
  const ELEC_H_IN_BASE = { ref: 'H-INPC-1XHDMI2.0', desc: 'Tarjeta de entrada 1×HDMI 2.0 (mínima del equipo)' };
  const ELEC_H_PREVIO = { ref: 'H-OUT2RJ45-1HDMI-MVR', desc: 'Tarjeta base 2×RJ45 + 1×HDMI de previo / monitorización (recomendada)' };
  // Referencias comerciales de Charmex (H-OUTC… salidas, H-INPC… entradas)
  const ELEC_H_TARJ_RJ = { ref: 'H-OUTC-20XRJ45', puertos: 20 };
  const ELEC_H_TARJ_FIB = { ref: 'H-OUTC-16RJ45-2OPT', opt: 2, ppo: 8 }; // 16 RJ45 + 2 fibras (8 puertos por fibra)
  // Tarjetas de entrada H Series (n = entradas por tarjeta)
  const ELEC_H_TARJ_IN = {
    HDMI: { ref: 'H-INPC-4XHDMI',    n: 4, desc: 'Tarjeta entrada 4×HDMI' },
    HDMI4K: { ref: 'H-INPC-2XHDMI2.0', n: 2, desc: 'Tarjeta entrada 2×HDMI 2.0 (4K)' },
    DP:   { ref: 'H-INPC-1XDP1.2',   n: 1, desc: 'Tarjeta entrada 1×DP 1.2' },
    SDI:  { ref: 'H-INPC-4X3GSDI',   n: 4, desc: 'Tarjeta entrada 4×3G-SDI' }
  };

  // Mediaservers. out4k = salidas 4K simultáneas. dante = audio Dante declarado por el fabricante.
  const ELEC_MEDIASERVERS = [
    { id: 'ET1S',   marca: 'NOVASTAR', modelo: 'ET1S-G',        out4k: 1,  dante: false, backupNativo: false, resumen: '1 salida 4K60 · 1 capa 4K o 4 capas 2K · hasta 4 capas + audio', url: 'https://charmex.net/novastar-media-server--et1s-g' },
    { id: 'ET2S',   marca: 'NOVASTAR', modelo: 'ET2S-G',        out4k: 2,  dante: false, backupNativo: false, resumen: '2 salidas 4K60 · 2 capas 4K o 1 capa 8K30 · hasta 8 capas + audio', url: null },
    { id: 'ET4S',   marca: 'NOVASTAR', modelo: 'ET4S-G (A4)',   out4k: 4,  dante: false, backupNativo: false, resumen: '4 salidas 4K60 · 4 capas 4K o 1 capa 8K60 · hasta 12 capas + audio', url: null },
    { id: 'ET16S2', marca: 'NOVASTAR', modelo: 'ET16S-G (2A4)', out4k: 8,  dante: false, backupNativo: true,  resumen: '8 salidas 4K · 8 capas 4K · sincronismo, cascada y backup entre equipos', url: null },
    { id: 'ET16S3', marca: 'NOVASTAR', modelo: 'ET16S-G (3A4)', out4k: 12, dante: false, backupNativo: true,  resumen: '12 salidas 4K · 12 capas 4K · sincronismo, cascada y backup entre equipos', url: null },
    { id: 'PHP10',  marca: 'PIXELHUE', modelo: 'P10',           out4k: 4,  dante: false, inp: 6, backupNativo: false, resumen: '6 entradas (4 DP/HDMI + 2 12G-SDI) · 8 salidas HDMI · switcher 4K60', url: null },
    { id: 'PHP20',  marca: 'PIXELHUE', modelo: 'P20',           out4k: 4,  dante: false, inp: 12, backupNativo: false, resumen: '8 entradas + 4 SDI · 8 salidas HDMI 2.0 · 4 capas 4K60 · 8 salidas fibra 10G', url: null },
    { id: 'PHP20D', marca: 'PIXELHUE', modelo: 'P20-DS',        out4k: 4,  dante: true,  inp: 12, backupNativo: false, resumen: 'Como P20 + salida 12G-SDI y audio Dante 32×32', url: null },
    { id: 'PHP80',  marca: 'PIXELHUE', modelo: 'P80',           out4k: 4,  dante: false, inp: 12, backupNativo: false, resumen: '12 entradas 4K + ranura · 8 capas 4K + 4 PIP · 8 HDMI + 4 SDI + fibra 10G', url: null },
    { id: 'PHQ8',   marca: 'PIXELHUE', modelo: 'Q8',            out4k: 16, dante: true,  inp: 48, backupNativo: true,  resumen: 'Hasta 48 entradas / 16 salidas 4K · 32 capas 4K · Dante 64×64 · backup de equipo y entradas', url: null }
  ];

  const elecNorm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const elecMpx = (n) => (n / 1000000).toFixed(1).replace('.0', '');

  // Enriquecimiento opcional (stock / enlace). Nunca condiciona el cálculo.
  const elecDeHoja = (modelo, hoja) => {
    const k = elecNorm(modelo);
    const f = (hoja || []).find(h => k && elecNorm(h.modelo).includes(k));
    if (!f) return { enStock: false, url: null, front: null, back: null, logo: null };
    const ok = (v) => { const t = String(v || '').trim(); return /^https?:\/\//i.test(t) ? t : null; };
    return {
      enStock: String(f.stock || '').toUpperCase() === 'SI',
      url: ok(f.url || f.urlprod || f.link || f.web),
      front: ok(f.front || f.frontal || f.img1 || f.imagen),
      back: ok(f.back || f.trasera || f.img2),
      logo: ok(f.logo)
    };
  };

  // Motor de cálculo: devuelve las configuraciones adecuadas para el proyecto
  const calcularElectronicas = (stats, o, hoja) => {
    if (!stats || !stats.lines) return [];
    const lines = stats.lines, totalPix = stats.totalPix || 0;
    const mult = o.backup ? 2 : 1;
    const directo = o.conexion === 'directo';
    // v7.9 · varias pantallas separadas (stats.porSup = líneas de cada una): con fibra, cada pantalla lleva sus propios conversores
    // detrás (una fibra no reparte sus líneas entre pantallas alejadas); sin ese dato, se cuentan juntas como hasta ahora
    const porSup = Array.isArray(stats.porSup) ? stats.porSup.filter(l => l > 0) : [];
    const conversores = (ppo) => (porSup.length > 1 ? porSup.reduce((a, l) => a + Math.ceil(l / ppo), 0) : Math.ceil(lines / ppo));
    const reparto = (ppo) => (porSup.length > 1 ? ' · ' + porSup.map(l => Math.ceil(l / ppo)).join(' + ') + ' conv. por pantalla' : '');
    let res = [];
    let hItem = null;

    const porSerie = {};
    ELEC_DEVICES.forEach((d, idx) => {
      if (o.escalador === 'con' ? !d.escalador : d.escalador) return;
      if (totalPix > d.capPx) return;
      let det;
      if (directo) {
        if (d.rj === 0 || lines * mult > d.rj) return;
        det = { puertos: lines + (lines === 1 ? ' línea' : ' líneas') + (o.backup ? ' + ' + lines + ' backup' : '') + ' (de ' + d.rj + ' RJ45)', equipos: [] };
      } else {
        if (d.opt === 0) return;
        const ppo = Math.min(ELEC_CVT.porCvt, d.ppo);
        const cvt = conversores(ppo), fibras = cvt * mult;
        if (fibras > d.opt || (d.rj > 0 && lines > d.rj)) return;
        if (d.chasis) {
          // Chasis modular: despiece de tarjetas de salida, módulos SFP+, conversores y tarjetas de entrada
          const ch = ELEC_MX_CHASIS[d.chasis];
          const tOut = Math.ceil(fibras / ELEC_MX_TARJ_OUT.opt);
          if (tOut > ch.slotsOut) return;
          const nIn = Math.max(1, o.entradas || 0);
          const tIn = ch.entradas[o.tipoEntrada || 'HDMI'];
          const cIn = tIn ? Math.ceil(nIn / tIn.n) : 0;
          if (cIn > ch.slotsIn) return;
          det = {
            puertos: fibras + ' fibra' + (fibras > 1 ? 's' : '') + (o.backup ? ' (' + cvt + ' + ' + cvt + ' backup)' : '') + ' (' + tOut * ELEC_MX_TARJ_OUT.opt + ' OPT)' + reparto(ppo),
            equipos: [
              tIn ? { ref: tIn.ref, cant: cIn, desc: tIn.desc } : { ref: '+ Tarjeta entrada ' + (o.tipoEntrada || ''), cant: 0, desc: 'no disponible en este chasis: verificar con el fabricante' },
              { ref: ELEC_MX_TARJ_OUT.ref, cant: tOut, desc: ELEC_MX_TARJ_OUT.desc },
              { ref: ELEC_MX_CVT.ref, cant: cvt, desc: ELEC_MX_CVT.desc },
              { ref: ELEC_MX_SFP.ref, cant: fibras, desc: ELEC_MX_SFP.desc }
            ]
          };
        } else
        det = {
          puertos: fibras + ' fibra' + (fibras > 1 ? 's' : '') + (o.backup ? ' (' + cvt + ' + ' + cvt + ' backup)' : '') + ' (de ' + d.opt + ' OPT)' + reparto(ppo),
          equipos: [{ ref: ELEC_CVT.ref, cant: cvt, desc: ELEC_CVT.desc }]
        };
      }
      const cand = { d, idx, det };
      if (!porSerie[d.serie] || porSerie[d.serie].idx > idx) porSerie[d.serie] = cand;
    });
    Object.values(porSerie).sort((a, b) => a.idx - b.idx).forEach(c => {
      const h = elecDeHoja(c.d.modelo, hoja);
      res.push({
        key: c.d.id, marca: c.d.marca, serie: c.d.serie, modelo: c.d.modelo, escalador: c.d.escalador,
        puertos: c.det.puertos, capacidad: elecMpx(c.d.capPx) + ' Mpx (proyecto ' + elecMpx(totalPix) + ' Mpx)',
        equipos: c.det.equipos, url: h.url || c.d.url || charmexBusca(c.d.modelo), enStock: h.enStock, nota: (o.entradas ? o.entradas + '× ' + (o.tipoEntrada || 'HDMI') + (o.resEntrada ? ' ' + o.resEntrada : '') + ' (verificar entradas en ficha)' : ''),
        front: c.d.front || h.front, back: c.d.back || h.back, logo: c.d.logo || h.logo
      });
    });

    // H Series (solo con escalador): chasis + tarjetas de salida
    if (o.escalador === 'con' && (lines >= 8 || res.length === 0)) {
      let tarj, equipos, puertos;
      if (directo) {
        tarj = Math.ceil(lines * mult / ELEC_H_TARJ_RJ.puertos);
        equipos = [{ ref: ELEC_H_TARJ_RJ.ref, cant: tarj, desc: 'Tarjeta de salida 20×RJ45' }];
        puertos = lines + (lines === 1 ? ' línea' : ' líneas') + (o.backup ? ' + ' + lines + ' backup' : '') + ' (' + tarj * ELEC_H_TARJ_RJ.puertos + ' RJ45)';
      } else {
        const cvt = conversores(ELEC_H_TARJ_FIB.ppo), fibras = cvt * mult;
        tarj = Math.ceil(fibras / ELEC_H_TARJ_FIB.opt);
        equipos = [
          { ref: ELEC_H_TARJ_FIB.ref, cant: tarj, desc: 'Tarjeta de salida 16×RJ45 + 2×fibra' },
          { ref: ELEC_CVT.ref, cant: cvt, desc: ELEC_CVT.desc }
        ];
        puertos = fibras + ' fibra' + (fibras > 1 ? 's' : '') + (o.backup ? ' (' + cvt + ' + ' + cvt + ' backup)' : '') + reparto(ELEC_H_TARJ_FIB.ppo);
      }
      const nIn = o.entradas || 0;
      // HDMI: una entrada (o sin datos) o entradas 4K → tarjetas de 1×HDMI 2.0 (una por entrada); varias entradas 2K → tarjetas de 4×HDMI
      // entradas: una (o sin datos) → 1×HDMI 2.0; HDMI 4K → 2×HDMI 2.0; varias HDMI 2K → 4×HDMI; DP → 1×DP; SDI → 4×3G-SDI
      const hdmi = !o.tipoEntrada || o.tipoEntrada === 'HDMI';
      const usaBase = hdmi && nIn <= 1;
      const tIn = usaBase ? { ref: ELEC_H_IN_BASE.ref, n: 1, desc: 'Tarjeta de entrada 1×HDMI 2.0' }
        : (hdmi && o.resEntrada === '4K') ? ELEC_H_TARJ_IN.HDMI4K : (ELEC_H_TARJ_IN[o.tipoEntrada] || ELEC_H_TARJ_IN.HDMI);
      const tarjIn = usaBase ? 1 : Math.ceil(nIn / tIn.n);
      // las tarjetas de entrada y la de previo ocupan las posiciones de entrada; las de salida, las suyas
      const ch = ELEC_H_CHASIS.find(c => c.maxTarj >= tarj && c.maxIn >= tarjIn + 1);
      if (ch) {
        equipos.unshift({ ref: ch.ref, cant: 1, desc: 'Chasis (mainframe)' });
        equipos.push({ ref: ELEC_H_PREVIO.ref, cant: 1, desc: ELEC_H_PREVIO.desc });
        if (usaBase) equipos.push({ ref: ELEC_H_IN_BASE.ref, cant: 1, desc: ELEC_H_IN_BASE.desc });
        else equipos.push({ ref: tIn.ref, cant: tarjIn, desc: tIn.desc });
        const capPx = directo ? tarj * ELEC_H_TARJ_RJ.puertos * ELEC_PX_PUERTO : tarj * ELEC_H_TARJ_FIB.opt * ELEC_H_TARJ_FIB.ppo * ELEC_PX_PUERTO;
        if (totalPix <= capPx) {
          hItem = ({
            key: 'H-' + ch.id, marca: 'NOVASTAR', serie: 'H Series', modelo: 'H Series ' + ch.id, escalador: true, modular: true,
            puertos: puertos, capacidad: elecMpx(capPx) + ' Mpx (proyecto ' + elecMpx(totalPix) + ' Mpx)',
            equipos: equipos, url: null, enStock: false
          });
        }
      }
    }
    // Máximo 4 burbujas (una fila en el PDF): si hay H Series, se reserva un hueco para ella
    return hItem ? res.slice(0, 3).concat([hItem]) : res.slice(0, 4);
  };

  // Mediaservers adecuados (marca: todos|novastar|pixelhue; dante: exige audio Dante)
  const calcularMediaservers = (stats, o) => {
    if (!stats) return [];
    /* v9.7 · salidas 4K por rejilla (ancho y alto del lienzo entre 3840 × 2160), como la consola: una tira de 6144 px de ancho no cabe en una sola salida aunque tenga pocos píxeles */
    const need = stats.resW > 0 && stats.resH > 0 ? Math.max(1, Math.ceil(stats.resW / 3840) * Math.ceil(stats.resH / 2160)) : Math.max(1, Math.ceil((stats.totalPix || 0) / ELEC_PX_4K));
    const lista = ELEC_MEDIASERVERS.filter(m =>
      m.out4k >= need && (!o.entradas || m.inp == null || m.inp >= o.entradas) &&
      (o.marca === 'todos' || m.marca.toLowerCase() === o.marca) &&
      (!o.dante || m.dante)
    );
    const out = [];
    ['NOVASTAR', 'PIXELHUE'].forEach(marca => {
      lista.filter(m => m.marca === marca).sort((a, b) => a.out4k - b.out4k).slice(0, 2).forEach(m => out.push({ ...m, need }));
    });
    return out;
  };
  globalThis.SC_ELEC = { ELEC_PX_PUERTO, ELEC_PX_4K, ELEC_CVT, CHARMEX_NOVASTAR, charmexBusca, ELEC_DEVICES, ELEC_MX_CHASIS, ELEC_MX_TARJ_OUT, ELEC_MX_SFP, ELEC_MX_CVT, ELEC_H_CHASIS, ELEC_H_IN_BASE, ELEC_H_PREVIO, ELEC_H_TARJ_RJ, ELEC_H_TARJ_FIB, ELEC_H_TARJ_IN, ELEC_MEDIASERVERS, elecNorm, elecMpx, elecDeHoja, calcularElectronicas, calcularMediaservers };
})();
