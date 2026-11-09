// SCREENS · catálogo LED en vivo (mismo origen y misma caché cifrada que SCREENCALC).
// Nunca usa datos de muestra: si no hay conexión ni caché, devuelve una lista vacía y la interfaz lo avisa.
const ADMIN_URL = 'https://script.google.com/macros/s/AKfycbwkc12y4LODbFe-kQidnR2MbbA6cbW1WbhU3UiqmDmshx-ncAdGYrFRy8PNjm9Wg6Mx3w/exec';
const CLAVE = 'sc_m1';
const ORIGEN = ['aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvZS8yUEF', 'DWC0xdlJlREdjbWlRZzFTb2ZZeFdyS1Rrbmw2RWRKUGxTSDJObEpKc0NFZG', 'lJR0Q4ejE1UExqd3ZBQi10ZlRnTFBzZ2d2dGJ6NS1MMHczdnhBVS9wdWI='].join('');

const aB64 = (u8) => btoa(String.fromCharCode(...u8));
const deB64 = (t) => Uint8Array.from(atob(t), c => c.charCodeAt(0));
const getKey = async () => {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(String.fromCharCode(83, 67, 45, 99, 97, 116, 45, 107, 101, 121, 45, 52, 50)), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('screencalc'), iterations: 20000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
};
async function guardar(data) {
  try {
    const txt = JSON.stringify(data);
    if (window.crypto && crypto.subtle) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getKey(), new TextEncoder().encode(txt)));
      const all = new Uint8Array(iv.length + ct.length); all.set(iv); all.set(ct, iv.length);
      localStorage.setItem(CLAVE, 'a:' + aB64(all));
    } else {
      localStorage.setItem(CLAVE, 'b:' + btoa(unescape(encodeURIComponent(txt.split('').reverse().join('')))));
    }
  } catch (e) {}
}
async function leer() {
  try {
    const v = localStorage.getItem(CLAVE); if (!v) return null;
    if (v.startsWith('a:') && window.crypto && crypto.subtle) {
      const all = deB64(v.slice(2));
      const pl = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.slice(0, 12) }, await getKey(), all.slice(12));
      return JSON.parse(new TextDecoder().decode(pl));
    }
    if (v.startsWith('b:')) return JSON.parse(decodeURIComponent(escape(atob(v.slice(2)))).split('').reverse().join(''));
  } catch (e) {}
  return null;
}
function parseCSV(csv) {
  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = []; let cur = '', q = false;
    for (const ch of line) { if (ch === '"') q = !q; else if (ch === ',' && !q) { vals.push(cur.trim()); cur = ''; } else cur += ch; }
    vals.push(cur.trim());
    const o = {}; headers.forEach((h, i) => { o[h] = vals[i] || ''; }); return o;
  });
}
export const normTipo = (v) => {
  const t = String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase();
  if (/^(INDOOR|INTERIOR)$/.test(t)) return 'INDOOR';
  if (/^(OUTDOOR|EXTERIOR)$/.test(t)) return 'OUTDOOR';
  if (/^(ESCAPARATE|VITRINA|SHOP ?WINDOW)$/.test(t)) return 'ESCAPARATE';
  return t;
};
const num = (v, ent) => { const n = ent ? parseInt(String(v || 0).replace(',', '.')) : parseFloat(String(v || 0).replace(',', '.')); return isNaN(n) ? 0 : n; };
function normalizar(data) {
  return data.map(it => ({
    ...it,
    tipo: normTipo(it.tipo), class: String(it.class || '').trim().toUpperCase(),
    cabAmp: num(it.cabAmp || it.Amp || it.amp), cabKg: num(it.cabKg || it.Kg || it.kg || it.peso),
    cabAncho: num(it.cabAncho), cabAlto: num(it.cabAlto), cabPixAncho: num(it.cabPixAncho, 1), cabPixAlto: num(it.cabPixAlto, 1),
    pitch: num(it.pitch), nits: num(it.nits, 1), hz: num(it.hz, 1), wMax: num(it.wMax || it.wmax), thick: num(it.thick || it.profundidad)
  })).filter(it => String(it.obs || '').trim().toUpperCase() !== 'NOSHOW' && String(it.crm || '').trim() !== ''
    && ['INSTALL', 'RENTAL'].includes(it.class) && ['INDOOR', 'OUTDOOR', 'ESCAPARATE'].includes(it.tipo)
    && it.cabAncho > 0 && it.cabAlto > 0 && it.cabPixAncho > 0 && it.cabPixAlto > 0);
}
async function leerMaestro() {
  try {
    const r = await fetch(ADMIN_URL + '?accion=catalogo', { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json();
    if (!j || !j.d) return null;
    const b = atob(j.d), u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    const filas = JSON.parse(new TextDecoder().decode(u).split('').reverse().join(''));
    return Array.isArray(filas) && filas.length ? filas : null;
  } catch (e) { return null; }
}
async function leerHoja() {
  try {
    const res = await fetch(atob(ORIGEN) + '?gid=0&single=true&output=csv', { cache: 'no-store' });
    if (!res.ok) return null;
    const d = parseCSV(await res.text());
    return d.length ? d : null;
  } catch (e) { return null; }
}
// Devuelve primero la caché (si la hay) y luego avisa con los datos en vivo
export async function cargarCatalogo(alActualizar) {
  const cache = await leer();
  if (cache && cache.length) alActualizar(normalizar(cache), 'cache');
  const vivo = (await leerMaestro()) || (await leerHoja());
  if (vivo) { await guardar(vivo); alActualizar(normalizar(vivo), 'vivo'); }
  else if (!cache || !cache.length) alActualizar([], 'error');
}
export const enStock = (m) => String(m.disp || m.stock || '').toUpperCase() === 'STOCK' || String(m.stock || '').toUpperCase() === 'SI';
// Prioridad a igual pitch (misma regla que SCREENCALC): prioridad manual, stock y familia preferente
export function ordenar(lista) {
  const fam = (m) => String(m.family || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const rank = (m) => {
    let f = 1; const tech = String(m.tech || '').toUpperCase().trim(), crm = String(m.crm || '').toUpperCase();
    if (m.class === 'INSTALL' || !m.class) {
      if (m.tipo === 'INDOOR') f = tech === 'SMD' && fam(m) === 'ufixavant' ? 0 : 1;
      else if (m.tipo === 'ESCAPARATE') f = fam(m) === 'slimfix' ? 0 : 1;
      else if (m.tipo === 'OUTDOOR') f = fam(m) === 'jfix' ? (/^JFIXII/.test(crm) ? 0 : /^JFIX-K/.test(crm) ? 1 : 2) : 3;
    }
    return (enStock(m) ? 0 : 10) + f;
  };
  const pm = (m) => { const p = parseFloat(m.prioridad); return isNaN(p) ? 999 : p; };
  return [...lista].sort((a, b) => (a.pitch - b.pitch) || (pm(a) - pm(b)) || (rank(a) - rank(b)) || (a.nits - b.nits));
}
