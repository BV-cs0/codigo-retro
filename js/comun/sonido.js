(function () {
  'use strict';
  const tonos = {
    paso: [[250, 0.04]], choque: [[165, 0.08], [120, 0.07]],
    recoger: [[440, 0.05], [680, 0.07]], victoria: [[390, 0.09], [520, 0.09], [650, 0.09], [780, 0.18]]
  };
  let audio;
  function activar() {
    if (window.CR.Progreso.silencio()) return;
    try {
      const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Audio) return;
      audio ||= new Audio();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch { /* El audio es opcional. */ }
  }
  function tocar(nombre) {
    if (!audio || window.CR.Progreso.silencio()) return;
    let inicio = audio.currentTime;
    for (const [frecuencia, duracion] of tonos[nombre]) {
      const onda = audio.createOscillator();
      const volumen = audio.createGain();
      onda.type = 'triangle';
      onda.frequency.value = frecuencia;
      volumen.gain.setValueAtTime(0.075, inicio);
      volumen.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);
      onda.connect(volumen).connect(audio.destination);
      onda.start(inicio);
      onda.stop(inicio + duracion);
      inicio += duracion + 0.012;
    }
  }
  const Sonido = { activar, tocar };
  if (typeof window !== 'undefined') (window.CR ||= {}).Sonido = Sonido;
  if (typeof module !== 'undefined') module.exports = Sonido;
})();
