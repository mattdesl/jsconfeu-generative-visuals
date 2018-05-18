global.THREE = require('three');

const rightNow = require('right-now');
const defined = require('defined');
const loadAssets = require('./util/loadAssets');
const MainScene = require('./scene/MainScene');
const anime = require('animejs');
const RND = require('./util/random');

module.exports = createArtwork;

function createArtwork (canvas, params = {}) {
  // I've been designing my code to this aspect ratio
  // Since it's assumed it will be the one we use
  const designAspect = 7680 / 1080;

  // But I've also been testing some other target ratios
  // in case the actual display is not what we have above for some reason
  // const targetAspect = designAspect
  const targetAspect = designAspect;
  // const targetAspect = 366 / 89
  // const targetAspect = 1416 / 334

  // You can also test full screen, it will give a different look...
  const useFullscreen = params.fullscreen !== false;

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

  let raf;
  let tickFrame = 0;
  let lastTickTime = 0;
  let elapsedTime = 0;
  let previousTime = rightNow();
  let running = false;
  let hasInit = false;
  let hasResized = false;
  let stoppedAnimations = [];
  let main;

  draw();

  const api = {
    resize,
    draw,
    isRunning () {
      return running;
    },
    load () {
      return loadAssets({ renderer }).then(assets => {
        app.assets = assets;
        console.log('[canvas] Loaded assets');
        return assets;
      });
    },
    start () {
      if (!app.assets) {
        console.error('[canvas] Assets have not yet been loaded, must await load() before start()');
      }
      if (!hasResized) {
        console.error('[canvas] You must call artwork.resize() at least once before artwork.start()');
      }
      if (!hasInit) {
        createScene(scene);
        draw();
        hasInit = true;
      }
      start();
    },
    clear,
    reset,
    stop,
    hide () {
      canvas.style.visibility = 'hidden';
    },
    show () {
      canvas.style.visibility = '';
    }
  };

  return api;

  function resize (width, height, pixelRatio) {
    width = defined(width, window.innerWidth);
    if (useFullscreen) {
      height = defined(height, window.innerHeight);
    } else {
      height = Math.floor(width / targetAspect);
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
    hasResized = true;
    draw();
  }

  function clear () {
    // stop all animations, clear shapes
    stoppedAnimations.length = 0;
    anime.running.forEach(a => a.pause());
    anime.running.length = 0;
    if (main) main.clear();
  }

  function reset () {
    // clear all animations and shapes and re-run loop
    clear();
    resetRandomSeed();
    if (main) main.start();
  }

  function resetRandomSeed () {
    RND.setSeed(RND.getRandomSeed());
  }

  function start () {
    if (running) return;
    stoppedAnimations.forEach(anim => anim.play());
    stoppedAnimations.length = 0;
    running = true;
    previousTime = rightNow();
    raf = window.requestAnimationFrame(animate);
  }

  function stop () {
    if (!running) return;
    stoppedAnimations = anime.running.slice();
    stoppedAnimations.forEach(r => r.pause());
    anime.running.length = 0;
    running = false;
    window.cancelAnimationFrame(raf);
  }

  function animate () {
    raf = window.requestAnimationFrame(animate);

    const now = rightNow();
    const deltaTime = (now - previousTime) / 1000;
    elapsedTime += deltaTime;
    previousTime = now;

    render(elapsedTime, deltaTime);
  }

  function draw () {
    render(elapsedTime, 0);
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
    main = new MainScene(app);
    scene.add(main);
  }
}
