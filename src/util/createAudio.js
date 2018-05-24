const webAudioPlayer = require('web-audio-player');

module.exports = function () {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  return new Promise((resolve, reject) => {
    const src = 'assets/audio/intro-short.mp3';
    const player = webAudioPlayer(src, {
      context,
      buffer: true
    });
    player.node.connect(context.destination);
    player.once('load', () => resolve(player));
    player.once('error', () => reject(new Error(`Could not load audio at ${src}`)));
  });
};
