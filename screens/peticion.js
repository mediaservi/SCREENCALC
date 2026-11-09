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
  const nPant = t.match(/\b(\d+|dos|tres|cuatro|cinco|seis|siete|ocho|two|three|four|five|six|seven|eight|quatre|cinc|sis|set|vuit)\s+(pantallas|pantalles|screens|lienzos)\b/);
  if (/\bsala\b|inmersiv|immersiv|\bcubo\b|\bcube\b|\broom\b|paredes|parets|walls/.test(t)) { cantidad = 'varias'; c.esp.tipo = 'sala'; vistos.push({ k: 'sala' }); }
  else if (nPant && n(nPant[1]) > 1) { cantidad = 'varias'; c.esp.tipo = 'sueltas'; c.sueltas.n = Math.min(8, n(nPant[1])); vistos.push({ k: 'pant', n: c.sueltas.n }); }
  else if (/\buna (sola )?pantalla|\bun(a)? solo|\b1 pantalla|\ba screen\b|\bone screen\b|una pantalla/.test(t)) { cantidad = 'una'; vistos.push({ k: 'una' }); }
  if (!cantidad && /\bpantalla\b|\bscreen\b|\bpantallla\b/.test(t)) { cantidad = 'una'; vistos.push({ k: 'una' }); }
  // medidas: A × B (× C)
  const m = t.match(/(\d+(?:\.\d+)?)\s*(?:m|mts|metros|metres)?\s*(?:x|×|\*|por|per|by)\s*(\d+(?:\.\d+)?)\s*(?:m|mts|metros|metres)?(?:\s*(?:x|×|\*|por|per|by)\s*(\d+(?:\.\d+)?))?/);
  if (m) {
    const a = n(m[1]), b = n(m[2]), h = m[3] != null ? n(m[3]) : NaN;
    if (c.esp.tipo === 'sala' || (cantidad !== 'una' && !nPant && !isNaN(h))) { c.esp.tipo = 'sala'; cantidad = 'varias'; c.esp.ancho = a; c.esp.fondo = b; if (!isNaN(h)) c.esp.alto = h; vistos.push({ k: 'medida', v: isNaN(h) ? [a, b] : [a, b, h] }); }
    else { c.sueltas.ancho = a; c.sueltas.alto = b; vistos.push({ k: 'medida', v: [a, b] }); }
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
  // LED: interior / exterior, instalación / alquiler; electrónica
  if (/exterior|outdoor|intemperie/.test(t)) { c.led.tipo = 'OUTDOOR'; vistos.push({ k: 'txt', v: 'OUTDOOR' }); } else if (/interior|indoor/.test(t)) c.led.tipo = 'INDOOR';
  if (/alquiler|rental|lloguer|eventos|gira/.test(t)) { c.led.clase = 'RENTAL'; vistos.push({ k: 'txt', v: 'RENTAL' }); }
  if (/backup|redundan/.test(t)) { c.elec.backup = true; vistos.push({ k: 'txt', v: 'BACKUP' }); }
  if (/fibra|fiber|fibre/.test(t)) { c.elec.conexion = 'fibra'; vistos.push({ k: 'fibra' }); }
  return { cantidad, tecnologia, cambios: c, vistos };
}
