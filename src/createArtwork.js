global.THREE = require('three');

const rightNow = require('right-now');
const defined = require('defined');
const loadAssets = require('./util/loadAssets');
const MainScene = require('./scene/MainScene');
const anime = require('animejs');
const RND = require('./util/random');
const ZigZagScene = require('./scene/ZigZagScene');
const tmpVec3 = new THREE.Vector3();

module.exports = createArtwork;

function createArtwork(canvas, params = {}) {
  // I've been designing my code to this aspect ratio
  // Since it's assumed it will be the one we use
  const designAspect = 7680 / 1200;

  // But I've also been testing some other target ratios
  // in case the actual display is not what we have above for some reason
  // const targetAspect = designAspect
  const targetAspect = designAspect;
  // const targetAspect = 366 / 89
  // const targetAspect = 1416 / 334

  // You can also test full screen, it will give a different look...
  const useFullscreen = params.fullscreen !== false;

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.sortObjects = false;

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  const scene = new THREE.Scene();

  const colorPalettes = {
    dark: {
      name: 'dark',
      background: '#313F61',
      colors: ['#DF1378', '#0C2AD9', '#FEC3BE', '#DDE4F0', '#7A899C']
    },
    light: {
      name: 'light',
      background: '#FBF9F3',
      colors: ['#313F61', '#DF1378', '#0C2AD9', '#FEC3BE', '#DDE4F0', '#7A899C']
    },
    ambient: {
      name: 'ambient',
      background: '#313F61',
      colors: ['#FFFFFF']
    }
  };

  const app = {
    camera,
    scene,
    canvas,
    sceneBounds: new THREE.Box2(),
    unitScale: new THREE.Vector2(1, 1),

    // ideally we'd have some mode/colorPalette pairing, but this works for now
    colorPalette: colorPalettes.light,
    mode: 'generative'

    // will contain some other properties for scenes to use, like width/height
  };

  const tickFPS = 30;

  let raf;
  let tickFrame = 0;
  let lastTickTime = 0;
  let elapsedTime = 0;
  let previousTime = rightNow();
  let running = false;
  let hasInit = false;
  let hasResized = false;
  let stoppedAnimations = [];

  scene.backgroundValue = app.colorPalette.background;
  scene.background = new THREE.Color(scene.backgroundValue);

  updatePalette();
  draw();

  const api = {
    resize,
    draw,
    isRunning() {
      return running;
    },
    load() {
      return loadAssets({ renderer }).then(assets => {
        app.assets = assets;
        console.log('[canvas] Loaded assets');
        return assets;
      });
    },
    start(opt = {}) {
      if (!app.assets) {
        console.error('[canvas] Assets have not yet been loaded, must await load() before start()');
      }
      if (!hasResized) {
        console.error('[canvas] You must call artwork.resize() at least once before artwork.start()');
      }
      let needsStart = false;
      if (!hasInit) {
        needsStart = true;
        createScene(scene);
        draw();
        hasInit = true;
      }
      resume();
      switchMode(opt.mode || 'generative');
      if (needsStart) {
        traverse('onTrigger', 'start', opt);
      }
      if (opt.mode === 'intro') {
        if (app.assets && app.assets.audio) app.assets.audio.play();
      }
    },
    clear,
    reset,
    stop,
    bounce,
    switchMode,
    spawn() {},
    randomize() {
      traverse('onTrigger', 'randomize');
    },
    swapPalettes() {
      const newPalette = app.colorPalette === colorPalettes.light ? colorPalettes.dark : colorPalettes.light;
      app.colorPalette = newPalette;
      updatePalette();
      traverse('onTrigger', 'palette');
    },
    hide() {
      canvas.style.visibility = 'hidden';
    },
    show() {
      canvas.style.visibility = '';
    },
    // set to match text position to be repelled
    setTextPosition(x, y, radius = 1) {
      traverse('onTrigger', 'colliderPosition', { x, y, radius });
    }
  };

  // so we can `api.switchMode('ambient')` from devtools
  window.api = api;

  return api;

  function switchMode(mode = 'generative') {
    app.mode = mode;
    traverse('onTrigger', 'switchMode');

    if (mode === 'intro') {
      app.colorPalette = colorPalettes.dark;
      updatePalette();
    } else if (mode === 'generative') {
      app.colorPalette = colorPalettes.light;
      updatePalette();
      traverse('onTrigger', 'palette');
    } else if (mode === 'ambient') {
      app.colorPalette = colorPalettes.ambient;
      updatePalette();
      traverse('onTrigger', 'palette');
    } else {
      console.error(`[mode] unknown mode ${mode}`);
    }
  }

  function updatePalette() {
    anime({
      targets: scene,
      backgroundValue: app.colorPalette.background,
      duration: 5000,
      easing: 'easeInQuad',
      update: () => {
        scene.background.set(scene.backgroundValue);
      }
    });
  }

  function resize(width, height, pixelRatio) {
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
    camera.updateMatrix();
    camera.updateMatrixWorld();
    app.width = width;
    app.height = height;
    app.pixelRatio = pixelRatio;
    app.aspect = aspect;

    app.sceneBounds.min.set(-1, -1);
    app.sceneBounds.max.set(1, 1);
    // project clip space into real world space
    tmpVec3.set(app.sceneBounds.min.x, app.sceneBounds.min.y, 0).unproject(camera);
    app.sceneBounds.min.copy(tmpVec3);
    tmpVec3.set(app.sceneBounds.max.x, app.sceneBounds.max.y, 0).unproject(camera);
    app.sceneBounds.max.copy(tmpVec3);

    hasResized = true;
    draw();
  }

  function bounce() {
    const scale = { value: scene.scale.x };
    anime({
      targets: scale,
      easing: 'easeInQuad',
      value: 0.9,
      duration: 500,
      update: () => {
        scene.scale.setScalar(scale.value);
      },
      complete: () => {
        anime({
          duration: 500,
          targets: scale,
          easing: 'easeOutQuad',
          value: 1,
          update: () => {
            scene.scale.setScalar(scale.value);
          }
        });
      }
    });
  }

  function clear() {
    // stop all animations, clear shapes
    stoppedAnimations.length = 0;
    anime.running.forEach(a => a.pause());
    anime.running.length = 0;
    traverse('onTrigger', 'clear');
  }

  function reset() {
    // clear all animations and shapes and re-run loop
    clear();
    resetRandomSeed();
  }

  function resetRandomSeed() {
    RND.setSeed(RND.getRandomSeed());
  }

  function resume() {
    if (running) return;
    stoppedAnimations.forEach(anim => anim.play());
    stoppedAnimations.length = 0;
    running = true;
    previousTime = rightNow();
    raf = window.requestAnimationFrame(animate);
  }

  function stop() {
    if (!running) return;
    stoppedAnimations = anime.running.slice();
    stoppedAnimations.forEach(r => r.pause());
    anime.running.length = 0;
    running = false;
    window.cancelAnimationFrame(raf);
  }

  function animate() {
    raf = window.requestAnimationFrame(animate);

    const now = rightNow();
    const deltaTime = (now - previousTime) / 1000;
    elapsedTime += deltaTime;
    previousTime = now;

    render(elapsedTime, deltaTime);
  }

  function draw() {
    render(elapsedTime, 0);
  }

  function render(time, deltaTime) {
    const frameInterval = 1 / tickFPS;
    const deltaSinceTick = time - lastTickTime;
    if (deltaSinceTick > frameInterval) {
      lastTickTime = time - deltaSinceTick % frameInterval;
      traverse('frame', tickFrame++, time);
    }

    traverse('update', time, deltaTime);
    renderer.render(scene, camera);
  }

  function traverse(fn, ...args) {
    scene.traverse(t => {
      if (typeof t[fn] === 'function') {
        t[fn](...args);
      }
    });
  }

  function createScene(scene) {
    scene.add(new MainScene(app));
    scene.add(new ZigZagScene(app));
  }
}
