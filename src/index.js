global.THREE = require('three');

// The API
const createArtwork = require('./createArtwork');
module.exports = createArtwork;

if (!module.parent) {
  const canvas = document.querySelector('#canvas');

  // Create the API. You should only create this once and re-use it.
  const artwork = createArtwork(canvas, {
    // In the staging link prototype, test with a fixed aspect ratio
    // In your redux/react app, set this to true to get full width/height
    fullscreen: false
  });

  // Some time before start(), we need to set the initial size
  artwork.resize();

  // The next line is only necessary for the staging link prototype
  window.addEventListener('resize', () => artwork.resize());

  // Load the assets at some point before start()
  // You should only call this once.
  artwork.load().then(() => {
    // Now that everything is loaded, we can start() and stop() the animation
    artwork.start();

    // You can use start()/stop()/isRunning() in your app to switch states
    window.addEventListener('keydown', ev => {
      if (ev.keyCode === 32) { // space
        ev.preventDefault();
        if (artwork.isRunning()) artwork.stop();
        else artwork.start();
      } else if (ev.keyCode === 82) { // 'r'
        artwork.reset();
      }
    });
  });
}
