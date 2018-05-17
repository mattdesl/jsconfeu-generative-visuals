global.THREE = require('three');

const rightNow = require('right-now');
const defined = require('defined');
const loadAssets = require('./util/loadAssets');
const query = require('./util/query');
const MainScene = require('./scene/MainScene');

module.exports = startApplication;

function startApplication (canvas) {
  // I've been designing my code to this aspect ratio
  // Since it's assumed it will be the one we use
  const designAspect = 7680 / 1080;

  // But I've also been testing some other target ratios
  // in case the actual display is not what we have above for some reason
  // const targetAspect = designAspect
  const targetAspect = 24 / 6;
  // const targetAspect = 366 / 89
  // const targetAspect = 1416 / 334

  // You can also test full screen, it will give a different look...
  const useTargetAspect = !query.fullscreen;

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setClearColor('#FBF9F3', 1);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  const scene = new THREE.Scene();

  const app = {
    camera,
    scene,
    unitScale: new THREE.Vector2(1, 1)
    // will contain some other properties for scenes to use, like width/height
  };

  const tickFPS = 24;

  let tickFrame = 0;
  let lastTickTime = 0;
  let elapsedTime = 0;
  let previousTime = rightNow();

  resize();
  window.addEventListener('resize', () => resize());

  canvas.style.display = 'none';
  loadAssets({renderer}).then(assets => {
    canvas.style.display = '';
    app.assets = assets;
    console.log('Loaded assets', app.assets);
    createScene(scene);
    startLoop();
  });

  function resize (width, height, pixelRatio) {
    width = defined(width, window.innerWidth);
    if (useTargetAspect) {
      height = Math.floor(width / targetAspect);
    } else {
      height = defined(height, window.innerHeight);
    }
    pixelRatio = defined(pixelRatio, window.devicePixelRatio);

    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);

    const aspect = width / height;
    camera.scale.x = aspect;
    camera.scale.y = 1;

    app.targetScale = aspect / designAspect;
    app.unitScale.x = aspect;

    camera.updateProjectionMatrix();
    app.width = width;
    app.height = height;
    app.pixelRatio = pixelRatio;
    app.aspect = aspect;
  }

  function startLoop () {
    renderer.animate(animate);
  }

  function animate () {
    const now = rightNow();
    const deltaTime = (now - previousTime) / 1000;
    elapsedTime += deltaTime;
    previousTime = now;

    render(elapsedTime, deltaTime);
  }

  function render (time, deltaTime) {
    const frameInterval = 1 / tickFPS;
    const deltaSinceTick = time - lastTickTime;
    if (deltaSinceTick > frameInterval) {
      lastTickTime = time - (deltaSinceTick % frameInterval);
      traverse('frame', tickFrame++, time);
    }

    traverse('update', time, deltaTime);
    renderer.render(scene, camera);
  }

  function traverse (fn, ...args) {
    scene.traverse(t => {
      if (typeof t[fn] === 'function') {
        t[fn](...args);
      }
    });
  }

  function createScene (scene) {
    scene.add(new MainScene(app));
  }
}
