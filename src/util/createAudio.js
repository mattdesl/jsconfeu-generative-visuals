const webAudioPlayer = require('web-audio-player');
const analyserAverage = require('analyser-frequency-average');
const smoothstep = require('smoothstep');

module.exports = function () {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  return new Promise((resolve, reject) => {
    const src = 'assets/audio/intro-short.mp3';
    const player = webAudioPlayer(src, {
      context,
      buffer: false
    });
    const analyser = context.createAnalyser();
    player.node.connect(analyser);
    player.node.connect(context.destination);
    const freqs = new Uint8Array(analyser.fftSize);
    player.updateFrequencies = () => {
      analyser.getByteTimeDomainData(freqs);
      const signal = analyserAverage(analyser, freqs, 40, 125);
      // const smoothed = smoothstep(signal, 1, 0.75);
      return signal;
    };
    player.once('load', () => resolve(player));
    player.once('error', () => reject(new Error(`Could not load audio at ${src}`)));
  });
};
