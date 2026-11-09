// SCREENS · petición en lenguaje natural (es / en / ca) para salas, varias pantallas y proyección.
// Devuelve los cambios a aplicar en el estado y la lista de lo que se ha entendido ({ k, n, v }: la consola lo rotula en su idioma).
// Reglas locales, sin servicios externos.
const NUM = { un: 1, una: 1, uno: 1, one: 1, dos: 2, two: 2, tres: 3, three: 3, cuatro: 4, four: 4, quatre: 4, cinco: 5, five: 5, cinc: 5, seis: 6, six: 6, sis: 6, siete: 7, seven: 7, set: 7, ocho: 8, eight: 8, vuit: 8 };
const n = (v) => (v == null ? NaN : NUM[v] != null ? NUM[v] : parseFloat(String(v).replace(',', '.')));

export function interpretar(texto) {
  const t = ' ' + String(texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(\d),(\d)/g, '$1.$2') + ' ';
  const c = { esp: {}, sueltas: {}, paredes: null, led: {}, proy: {}, elec: {} }, vistos = [];
  let cantidad = null, tecnologia = null;
  // tecnología
  if (/proyecc|proyector|proyectar|projecc|projector|projection|videoproyec|mapping/.test(t)) { tecnologia = 'proy'; vistos.push({ k: 'proy' }); }
  else if (/\bled\b|cabinet|pantalla led|ecran led/.test(t)) { tecnologia = 'led'; vistos.push({ k: 'led' }); }
  // sala inmersiva o pantallas
  const nPant = t.match(/\b(\d+|dos|tres|cuatro|cinco|seis|siete|ocho|two|three|four|five|six|seven|eight|quatre|cinc|sis|set|vuit)\s+(?:led\s+)?(pantallas|pantalles|screens|lienzos)\b/);   // «3 pantallas», «3 LED screens»
  if (/\bsala\b|inmersiv|immersiv|\bcubo\b|\bcube\b|\broom\b|paredes|parets|walls/.test(t)) { cantidad = 'varias'; c.esp.tipo = 'sala'; vistos.push({ k: 'sala' }); }
  else if (nPant && n(nPant[1]) > 1) { cantidad = 'varias'; c.esp.tipo = 'sueltas'; c.sueltas.n = Math.min(8, n(nPant[1])); vistos.push({ k: 'pant', n: c.sueltas.n }); }
  else if (/\buna (sola )?pantalla|\bun(a)? solo|\b1 pantalla|\ba screen\b|\bone screen\b|una pantalla/.test(t)) { cantidad = 'una'; vistos.push({ k: 'una' }); }
  if (!cantidad && /\bpantalla\b|\bscreen\b|\bpantallla\b/.test(t)) { cantidad = 'una'; vistos.push({ k: 'una' }); }
  // una fachada (mapping) es una sola superficie
  if (!cantidad && /fachada|facade|facana|\bedificio\b|\bedifici\b|building/.test(t)) { cantidad = 'una'; vistos.push({ k: 'una' }); }
  // medidas: A × B (× C)
  const m = t.match(/(\d+(?:\.\d+)?)\s*(?:m|mts|metros|metres)?\s*(?:x|×|\*|por|per|by)\s*(\d+(?:\.\d+)?)\s*(?:m|mts|metros|metres)?(?:\s*(?:x|×|\*|por|per|by)\s*(\d+(?:\.\d+)?))?/);
  if (m) {
    const a = n(m[1]), b = n(m[2]), h = m[3] != null ? n(m[3]) : NaN;
    if (c.esp.tipo === 'sala' || (cantidad !== 'una' && !nPant && !isNaN(h))) { c.esp.tipo = 'sala'; cantidad = 'varias'; c.esp.ancho = a; c.esp.fondo = b; if (!isNaN(h)) c.esp.alto = h; vistos.push({ k: 'medida', v: isNaN(h) ? [a, b] : [a, b, h] }); }
    else { c.sueltas.ancho = a; c.sueltas.alto = b; vistos.push({ k: 'medida', v: [a, b] }); }
  }
  // v7.9 · varias pantallas de medidas distintas (auditorio): «una central de 6,6 x 3,7 y dos laterales (verticales) de 4,2 x 2,36»
  if (c.esp.tipo === 'sueltas') {
    const MED = /(\d+(?:\.\d+)?)\s*(?:m|mts|metros|metres)?\s*(?:x|×|\*|por|per|by)\s*(\d+(?:\.\d+)?)/g, meds = []; let q, fin = 0;
    while ((q = MED.exec(t))) { meds.push({ a: n(q[1]), b: n(q[2]), antes: t.slice(fin, q.index), despues: t.slice(q.index + q[0].length, q.index + q[0].length + 30) }); fin = q.index + q[0].length; }
    if (meds.length >= 2) {
      const CEN = /central|principal|centro|centre|center|\bmain\b|mas grande|mayor|\bgran\b|grande/, LAT = /lateral|\bside|a los lados|als costats|costat|a cada lado/;
      const cuenta = (x) => { const k = x.antes.match(/^.*\b(una|un|uno|one|1|dos|two|2|tres|three|3|quatre|cuatro|four|4)\b[^\d]*$/); return k ? n(k[1]) : 0; };   // la última cantidad antes de la medida
      let cen = meds.find(x => CEN.test(x.antes)), lat = meds.find(x => x !== cen && LAT.test(x.antes));
      if (!cen && !lat) { cen = meds.find(x => cuenta(x) === 1); lat = meds.find(x => x !== cen && cuenta(x) > 1); }
      if (!cen && lat) cen = meds.find(x => x !== lat);
      if (cen && !lat) lat = meds.find(x => x !== cen);
      if (cen && lat) {
        // «vertical»: la pantalla va en vertical (más alta que ancha)
        const med = (x) => (/vertical|portrait/.test(x.antes.slice(-40) + ' ' + x.despues) && x.a > x.b ? [x.b, x.a] : [x.a, x.b]);
        [c.sueltas.cAncho, c.sueltas.cAlto] = med(cen); [c.sueltas.ancho, c.sueltas.alto] = med(lat); c.sueltas.central = true;
        const i = vistos.findIndex(x => x.k === 'medida'); vistos.splice(i < 0 ? vistos.length : i, i < 0 ? 0 : 1, { k: 'central', v: [c.sueltas.cAncho, c.sueltas.cAlto] }, { k: 'laterales', v: [c.sueltas.ancho, c.sueltas.alto] });
      }
    } else if (meds.length === 1) c.sueltas.central = false;
  }
  const alto = t.match(/(\d+(?:\.\d+)?)\s*(?:m|metros|metres)?\s*de (?:alto|altura|alcada)|(?:alto|altura|height|alcada)\s*(?:de\s*)?(\d+(?:\.\d+)?)/);
  if (alto && c.esp.tipo === 'sala' && c.esp.alto == null) { c.esp.alto = n(alto[1] || alto[2]); vistos.push({ k: 'alto', v: c.esp.alto }); }
  // paredes
  const nPar = t.match(/\b(\d|dos|tres|cuatro|two|three|four|quatre)\s+(paredes|parets|walls)\b/);
  if (nPar) { const k = n(nPar[1]); c.paredes = { frontal: true, izquierda: k >= 3, derecha: k >= 2, trasera: k >= 4 }; vistos.push({ k: 'paredes', n: k }); }
  const nom = { frontal: /frontal|front\b|del fondo/, izquierda: /izquierda|esquerra|\bleft\b/, derecha: /derecha|dreta|\bright\b/, trasera: /trasera|posterior|\bback\b|darrera/ };
  const citadas = Object.keys(nom).filter(k => nom[k].test(t));
  if (!nPar && citadas.length >= 2) { c.paredes = { frontal: false, izquierda: false, derecha: false, trasera: false }; citadas.forEach(k => { c.paredes[k] = true; }); vistos.push({ k: 'paredes', n: citadas.length }); }
  if (/\bsuelo\b|\bterra\b|\bfloor\b/.test(t)) { c.paredes = c.paredes || {}; c.paredes.suelo = true; vistos.push({ k: 'suelo' }); }
  // disposición de pantallas sueltas
  if (/en arco|curva|curved|\barc\b|en arc/.test(t)) { c.sueltas.disp = 'arco'; vistos.push({ k: 'arco' }); }
  else if (/en linea|seguidas|in a row|en fila|en linia/.test(t)) { c.sueltas.disp = 'linea'; vistos.push({ k: 'linea' }); }
  // público, luz, ganancia, techo
  const dist = t.match(/(?:\ba|\bat)\s*(\d+(?:\.\d+)?)\s*(?:m|metros|metres)\b\s*(?:del publico|de distancia|distance|del public)?/);
  if (dist && /publico|distancia|distance|public|\bvista\b|\bver\b|\bveure\b|\bviewing\b/.test(t)) { c.sueltas.dist = n(dist[1]); vistos.push({ k: 'publico', v: c.sueltas.dist }); }
  const lx = t.match(/(\d+(?:\.\d+)?)\s*(?:lx|lux)\b/); if (lx) { c.proy.lux = n(lx[1]); vistos.push({ k: 'lux', v: c.proy.lux }); }
  if (!lx && /a oscuras|oscura|dark room|fosca|a les fosques/.test(t)) { c.proy.lux = 10; vistos.push({ k: 'lux', v: 10 }); }
  const g = t.match(/(?:ganancia|gain|guany)\s*(?:de\s*)?(\d+(?:\.\d+)?)/); if (g) { c.proy.ganancia = n(g[1]); vistos.push({ k: 'ganancia', v: c.proy.ganancia }); }
  const te = t.match(/techo\s*(?:de|a)?\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:m|metros)?\s*de techo|ceiling\s*(?:of\s*)?(\d+(?:\.\d+)?)|sostre\s*(?:de\s*|a\s*)?(\d+(?:\.\d+)?)/);
  if (te) { const v = n(te[1] || te[2] || te[3] || te[4]); c.sueltas.techo = v; if (c.esp.tipo === 'sala' && c.esp.alto == null) c.esp.alto = v; vistos.push({ k: 'techo', v }); }
  // v8.2 · tipo de proyección: mapping (fachada o edificio, «mapping») o pared (auditorio, pared); la sala inmersiva sale de «sala»
  if (/mapping|fachada|facade|facana|\bedificio\b|\bedifici\b|building/.test(t)) { c.proy.tipo = 'mapping'; vistos.push({ k: 'tipo', v: 'mapping' }); }
  else if (/auditorio|auditorium|auditori\b/.test(t)) { c.proy.tipo = 'pared'; vistos.push({ k: 'tipo', v: 'pared' }); }
  // v8.0 · proyección: orientación, distancia a la superficie y montaje («proyectores en torres a 25 m», «en vertical»,
  // «torre de 6 m», «colgados de un truss a 8 m», «sobremesa»)
  if (/(?:proyector|projector|proyectar|projectar)[^.]{0,40}\b(?:en )?vertical|\ben vertical\b|portrait|modo retrato|in portrait/.test(t)) { c.proy.orient = 'vertical'; vistos.push({ k: 'vertical' }); }
  else if (/(?:proyector|projector)[^.]{0,40}\ben horizontal|\bin landscape\b/.test(t)) { c.proy.orient = 'horizontal'; vistos.push({ k: 'horizontal' }); }
  const dP = t.match(/(?:proyector(?:es)?|projector(?:s)?|projectors|torres?|towers?)[^.\d]{0,40}?(?:\ba|\bat|desde|from)\s*(\d+(?:\.\d+)?)\s*(?:m|metros|metres)\b/) || t.match(/(?:\ba|\bat)\s*(\d+(?:\.\d+)?)\s*(?:m|metros|metres)\s*(?:de|from|of)\s*(?:la |el |the )?(?:fachada|pared|pantalla|superficie|edificio|facade|wall|screen|facana|paret|edifici)/);
  if (dP) { c.proy.dist = n(dP[1]); vistos.push({ k: 'distProy', v: c.proy.dist }); }
  // v8.4 · en un mapping, «a 40 m (de distancia)» sin hablar del público es la distancia de los proyectores a la fachada
  else if (c.proy.tipo === 'mapping' && c.sueltas.dist != null && !/publico|public|audiencia|audience|espectador|viewer/.test(t)) {
    c.proy.dist = c.sueltas.dist; delete c.sueltas.dist;
    const iv = vistos.findIndex(x => x.k === 'publico'); if (iv >= 0) vistos.splice(iv, 1); vistos.push({ k: 'distProy', v: c.proy.dist });
  }
  else if (c.proy.tipo === 'mapping' && c.sueltas.dist == null) {   // «fachada de 12 x 20 a 40 m»
    const am = t.match(/(?:\ba|\bat|desde|from)\s*(\d+(?:\.\d+)?)\s*(?:m|metros|metres)\b(?!\s*(?:de alto|de ancho|high|wide|d'alt|d'ample))/);
    if (am) { c.proy.dist = n(am[1]); vistos.push({ k: 'distProy', v: c.proy.dist }); }
  }
  const torre = t.match(/(?:torre|tower|torres|towers)\s*(?:de|of)?\s*(\d+(?:\.\d+)?)\s*(?:m|metros|metres)?/);
  const colg = t.match(/(?:colgad[oa]s?|truss|penjats?|hung|hanging)[^.\d]{0,25}?(?:a|at|de)?\s*(\d+(?:\.\d+)?)\s*(?:m|metros|metres)\b/);
  if (torre) { c.proy.montaje = 'apoyado'; c.proy.altura = n(torre[1]); vistos.push({ k: 'montaje', v: 'apoyado', h: c.proy.altura }); }
  else if (/sobremesa|sobre (?:una )?mesa|en el suelo|on a table|on the floor|sobretaula|a terra/.test(t) && /proyect|project/.test(t)) { c.proy.montaje = 'apoyado'; c.proy.altura = /suelo|floor|terra/.test(t) ? 0.3 : 0.8; vistos.push({ k: 'montaje', v: 'apoyado', h: c.proy.altura }); }
  else if (colg) { c.proy.montaje = 'colgado'; c.proy.altura = n(colg[1]); vistos.push({ k: 'montaje', v: 'colgado', h: c.proy.altura }); }
  else if (/colgad[oa]s? del techo|del techo|hung from the ceiling|penjats? del sostre/.test(t) && /proyect|project/.test(t)) { c.proy.montaje = 'colgado'; vistos.push({ k: 'montaje', v: 'colgado' }); }
  // LED: interior / exterior, instalación / alquiler; electrónica
  if (/exterior|outdoor|intemperie/.test(t)) { c.led.tipo = 'OUTDOOR'; vistos.push({ k: 'txt', v: 'OUTDOOR' }); } else if (/interior|indoor/.test(t)) c.led.tipo = 'INDOOR';
  if (/alquiler|rental|lloguer|eventos|gira/.test(t)) { c.led.clase = 'RENTAL'; vistos.push({ k: 'txt', v: 'RENTAL' }); }
  if (/backup|redundan/.test(t)) { c.elec.backup = true; vistos.push({ k: 'txt', v: 'BACKUP' }); }
  if (/fibra|fiber|fibre/.test(t)) { c.elec.conexion = 'fibra'; vistos.push({ k: 'fibra' }); }
  // v7.9 · pitch pedido («P1.5», «pitch 1,5», «1,5 mm de pitch»): la consola elige el modelo de ese pitch; «COB», uno COB
  const pi = t.match(/\bp\s?(\d{1,2}(?:\.\d{1,3})?)\b|pitch\s*(?:de\s*)?(\d{1,2}(?:\.\d{1,3})?)|(\d{1,2}(?:\.\d{1,3})?)\s*mm\s*de\s*pitch/);
  const pitch = pi ? n(pi[1] || pi[2] || pi[3]) : null; if (pitch) vistos.push({ k: 'pitch', v: pitch });
  return { cantidad, tecnologia, cambios: c, vistos, pitch, cob: /\bcob\b/.test(t) };
}
