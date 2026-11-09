/*
  SCREENS · entrada por voz y audio común (consola de SCREENS y futuras apps de AVHUB)
  dictar(): micrófono con el reconocimiento de voz del navegador.
  transcribir(): archivo de audio (wav, mp3, m4a, ogg…) a texto en el propio navegador con Whisper (transformers.js);
  el audio no sale del dispositivo y el modelo se descarga la primera vez.
  Licencia GPL-3.0 · mediaservi.com
*/
(function () {
  'use strict';
  const IDIOMA = { es: 'es-ES', en: 'en-GB', ca: 'ca-ES' }, WHISPER = { es: 'spanish', en: 'english', ca: 'catalan' };
  // v7.5 · dictado continuo: las pausas a media frase ya no lo cortan. Si el navegador cierra la escucha
  // (fin de frase, silencio o límite de tiempo), se vuelve a abrir sola y lo dictado se va sumando; se para al
  // pulsar otra vez el micrófono o tras SILENCIO ms sin oír nada. En Android cada resultado repite lo ya dicho:
  // lo repetido se descarta.
  const SILENCIO = 10000;
  const unir = (...p) => p.map(s => String(s || '').trim()).filter(Boolean).join(' ');
  const norma = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  function dictar(lang, alTexto, alEstado) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alEstado('sinMic'); return null; }
    let activo = true, r = null, previo = '', vacias = 0, reloj = 0;
    // tras SILENCIO ms sin oír nada, el micrófono se apaga solo
    const vigilar = () => { clearTimeout(reloj); reloj = setTimeout(() => { activo = false; try { r.stop(); } catch (e) {} }, SILENCIO); };
    const abrir = () => {
      const s = new SR(); r = s; s.lang = IDIOMA[lang] || 'es-ES'; s.interimResults = true; s.continuous = true; s.maxAlternatives = 1;
      let sesion = [], pend = '', oido = false;
      s.onresult = (e) => {
        vigilar(); oido = true; vacias = 0;
        const fin = []; let parcial = '';
        for (let i = 0; i < e.results.length; i++) {
          const t = String(e.results[i][0].transcript || '').trim(); if (!t) continue;
          if (!e.results[i].isFinal) { parcial = unir(parcial, t); continue; }
          const k = fin.length - 1;
          if (k >= 0 && norma(t).startsWith(norma(fin[k]))) fin[k] = t; else if (k < 0 || !norma(fin[k]).startsWith(norma(t))) fin.push(t);
        }
        sesion = fin;
        const f = unir(...fin); if (parcial && f && norma(parcial).startsWith(norma(f))) parcial = parcial.split(/\s+/).slice(f.split(/\s+/).length).join(' ');
        pend = parcial; alTexto(unir(previo, f, parcial), !parcial);
      };
      s.onerror = (e) => { const x = e && e.error; if (x === 'not-allowed' || x === 'service-not-allowed') { activo = false; alEstado('micDenegado'); } else if (x === 'audio-capture' || x === 'network') { activo = false; alEstado('micError'); } };
      s.onend = () => {
        previo = unir(previo, ...sesion, pend); sesion = []; pend = '';   // lo que quedó a medio reconocer no se pierde
        if (!oido) vacias++;
        if (activo && vacias < 6) { try { abrir(); return; } catch (e) {} }
        clearTimeout(reloj); activo = false; alTexto(previo, true); alEstado('micFin');
      };
      s.start();
    };
    try { abrir(); vigilar(); alEstado('escuchando'); } catch (e) { alEstado('micError'); return null; }
    return { stop() { activo = false; clearTimeout(reloj); try { r.stop(); } catch (e) { alEstado('micFin'); } } };
  }
  async function transcribir(file, lang, alEstado) {
    alEstado('leyendo');
    const buf = await file.arrayBuffer();
    const AC = window.AudioContext || window.webkitAudioContext, ctx = new AC();
    let audio; try { audio = await ctx.decodeAudioData(buf); } catch (e) { throw new Error('formato'); }
    const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(audio.duration * 16000)), 16000);
    const src = off.createBufferSource(); src.buffer = audio; src.connect(off.destination); src.start();
    const datos = (await off.startRendering()).getChannelData(0);
    alEstado('preparando');
    if (!window.__tfMod) window.__tfMod = (new Function('u', 'return import(u)'))('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2');
    try {
      const tf = await window.__tfMod; tf.env.allowLocalModels = false;
      if (!window.__asr) window.__asr = tf.pipeline('automatic-speech-recognition', 'Xenova/whisper-base', { progress_callback: (d) => { if (d && d.status === 'progress' && typeof d.progress === 'number') alEstado('descargando', Math.round(d.progress)); } });
      const asr = await window.__asr; alEstado('transcribiendo');
      const out = await asr(datos, { language: WHISPER[lang] || 'spanish', task: 'transcribe', chunk_length_s: 30, stride_length_s: 5 });
      return String((out && out.text) || '').trim();
    } catch (e) { window.__asr = null; window.__tfMod = null; throw new Error('modelo'); }
  }
  globalThis.SC_VOZ = { dictar, transcribir };
})();
