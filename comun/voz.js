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
  function dictar(lang, alTexto, alEstado) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alEstado('sinMic'); return null; }
    const r = new SR(); r.lang = IDIOMA[lang] || 'es-ES'; r.interimResults = true; r.continuous = false;
    let final = '';
    r.onresult = (e) => { let parcial = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) final += t; else parcial += t; } alTexto((final + ' ' + parcial).trim(), !parcial); };
    r.onerror = (e) => alEstado(e && e.error === 'not-allowed' ? 'micDenegado' : 'micError');
    r.onend = () => alEstado('micFin');
    try { r.start(); alEstado('escuchando'); } catch (e) { alEstado('micError'); return null; }
    return r;
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
