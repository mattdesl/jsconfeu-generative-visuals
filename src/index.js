global.THREE = require('three');
const query = require('./util/query');
const createArtwork = require('./createArtwork');
const keycode = require('keycode');
const canvas = document.querySelector('#canvas');
const presets = require('./scene/presets');

// Create the API. You should only create this once and re-use it.
const artwork = createArtwork(canvas, {
});

// artwork.onFinishIntro = () => {
//   artwork.transitionToPreset('default');
// };

// Some time before start(), we need to set the initial size
artwork.resize();

// The next line is only necessary for the staging link prototype
window.addEventListener('resize', () => artwork.resize());

// Load the assets at some point before start()
// You should only call this once.
artwork.load().then(() => {
  // Now that everything is loaded, we can start() and stop() the animation
  artwork.start({ intro: query.intro });

  // You should not have these events in your redux/react app, but they
  // show how to use the API a bit more
  window.addEventListener('keydown', ev => {
    const key = keycode(ev);
    if (key === '1') {
      artwork.transitionToPreset('default');
    } else if (key === '2') {
      artwork.transitionToPreset('ambient');
    } else if (key === '3') {
      artwork.transitionToPreset('intro0');
    }
  });
});
