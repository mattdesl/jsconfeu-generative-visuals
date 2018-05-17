const query = require('./util/query');

// The API, exported as a library
const createArtwork = require('./createArtwork');
module.exports = createArtwork;

// If we are running this module directly, i.e. as a test
if (!module.parent) {
  const canvas = document.querySelector('#canvas');
  const isFullscreen = !!query.fullscreen;

  // Create the API. You should only create this once and re-use it.
  const artwork = createArtwork(canvas, {
    // In the staging link prototype, test with a fixed aspect ratio
    // In your redux/react app, set this to true to get full width/height
    fullscreen: isFullscreen
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

    // You should not have these events in your redux/react app, but they
    // show how to use the API a bit more
    window.addEventListener('keydown', ev => {
      if (ev.keyCode === 32) { // space
        ev.preventDefault();
        // Toggle play/pause
        if (artwork.isRunning()) artwork.stop();
        else artwork.start();
      } else if (ev.keyCode === 82) { // 'r'
        ev.preventDefault();
        // Clear the canas and add new shapes back in with
        // a new random seed
        artwork.reset();
      } else if (ev.keyCode === 67) { // 'c'
        ev.preventDefault();
        // Clear the canvas (does not stop render loop!)
        artwork.clear();
      }
    });
  });
}
