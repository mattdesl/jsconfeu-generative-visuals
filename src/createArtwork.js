global.THREE = require('three');

const rightNow = require('right-now');
const defined = require('defined');
const loadAssets = require('./util/loadAssets');
const MainScene = require('./scene/MainScene');
const anime = require('animejs');
const RND = require('./util/random');
const ZigZagScene = require('./scene/ZigZagScene');
const tmpVec3 = new THREE.Vector3();
const presets = require('./scene/presets');
const startIntroText = require('./util/introText');
const query = require('./util/query');
const createAudio = require('./util/createAudio');
const noop = () => {};
const CSS = require('./assets/CSS.js');

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
  const useFullscreen = defined(params.fullscreen, query.fullscreen, true);
  const autoplay = defined(params.autoplay, query.autoplay, true);

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.sortObjects = false;

  const background = new THREE.Color('white');
  renderer.setClearColor(background, 1);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  const scene = new THREE.Scene();

  const app = {
    camera,
    scene,
    canvas,
    onFinishIntro: noop,
    intro: false,
    audio: createAudio(),
    audioSignal: [0, 0, 0],
    sceneBounds: new THREE.Box2(),
    unitScale: new THREE.Vector2(1, 1),
    // Holds props for visuals
    preset: {}
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
  let backgroundAnimation;
  let styleEl;

  // scene.backgroundValue = app.colorPalette.background;
  // scene.background = new THREE.Color(scene.backgroundValue);

  const isIntroDefault = false;
  const isInitiallyIntro = defined(params.intro, query.intro, isIntroDefault);
  const defaultPreset = isInitiallyIntro ? 'intro0' : 'default';
  const initialPresetKey = defined(params.preset, query.preset, defaultPreset);

  canvas.style.visibility = 'hidden';
  setPreset(initialPresetKey);
  draw();

  const api = {
    resize,
    draw,
    isRunning() {
      return running;
    },
    onFadeOutIntro: () => {
      traverse('onTrigger', 'fadeOut');
      transitionBackground('#000', {
        easing: 'linear',
        duration: 2000
      });
      app.audio.fadeOut(() => {
        app.onFinishIntro();
        if (styleEl) {
          document.getElementsByTagName('head')[0].removeChild(styleEl);
        }
      });
    },
    load() {
      return loadAssets({ renderer }).then(assets => {
        canvas.style.visibility = '';
        app.assets = assets;
        console.log('[canvas] Loaded assets');
        return assets;
      });
    },
    setPreset,
    transitionToPreset,
    start(opt = {}) {
      if (!app.assets) {
        console.error('[canvas] Assets have not yet been loaded, must await load() before start()');
      }
      if (!hasResized) {
        console.error('[canvas] You must call artwork.resize() at least once before artwork.start()');
      }

      let needsStart = false;

      // here we have bunch of code that we are repeating from other places,
      // just so we don't need to run background transition on start if we want
      // // different mode
      // app.mode = opt.mode;

      // if (app.mode === 'default') {
      //   app.colorPalette = colorPalettes.light;
      // } else if (app.mode === 'ambient') {
      //   app.colorPalette = colorPalettes.ambient;
      // }

      // scene.backgroundValue = app.colorPalette.background;
      // scene.background = new THREE.Color(scene.backgroundValue);
      // repeated code ends here

      const introMode = defined(opt.intro, isIntroDefault);
      app.intro = introMode;

      if (!hasInit) {
        needsStart = true;
        createScene(scene);
        hasInit = true;
      }

      const runStart = () => {
        resume();
        if (needsStart) {
          traverse('onTrigger', 'start', opt);
        }
        if (introMode) {
          setPreset('intro0');
          setBackground(presets.intro0.background);
          // transitionBackground(presets.intro0.background, {
          //   easing: 'linear',
          //   duration: 2000
          // });
          startIntroSequence({
            delay: 3000
          });
        }
      };

      const setupCSS = () => {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = CSS;

        document.getElementsByTagName('head')[0].appendChild(style);

        return style;
      };

      if (introMode) {
        styleEl = setupCSS();

        setBackground('#000');
        draw();
        if (autoplay) {
          runStart();
        } else {
          setupIntroClick(runStart);
        }
      } else {
        runStart();
      }

      draw();
    },
    getPresets: () => presets,
    triggerIntroSwap(ev) {
      traverse('onTrigger', 'introSwap', ev);
    },
    clear,
    reset,
    stop,
    bounce,
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

  // so we can `api.setPreset('ambient')` from devtools
  window.api = api;

  return api;

  function setupIntroClick(cb) {
    const text = document.querySelector('.canvas-text');
    if (text) text.textContent = 'Click to play';

    const done = () => {
      if (text) text.textContent = '';
      window.removeEventListener('click', done);
      window.removeEventListener('touchend', done);
      cb();
    };
    window.addEventListener('click', done);
    window.addEventListener('touchend', done);
  }

  function startIntroSequence(opts = {}) {
    app.audio.play();
    app.audio.fadeIn();
    startIntroText(api, opts);
  }

  function setBackground(color) {
    background.set(color);
    renderer.setClearColor(background, 1);
  }

  function setPreset(key) {
    const newPreset = presets[key] || presets.default;
    const oldPreset = Object.assign({}, app.preset);
    app.preset = Object.assign({}, newPreset);
    app.presetKey = key;
    setBackground(app.preset.background);
    traverse('onPresetChanged', app.preset, oldPreset);
  }

  function transitionBackground(color, opt = {}) {
    if (backgroundAnimation) backgroundAnimation.pause();
    const oldColor = background.clone();
    const newColor = new THREE.Color().set(color);
    const tmpColor = new THREE.Color();
    const tween = { value: 0 };
    backgroundAnimation = anime({
      targets: tween,
      value: 1,
      duration: defined(opt.duration, 5000),
      easing: defined(opt.easing, [0.12, 0.93, 0.12, 0.93]),
      update: () => {
        tmpColor.copy(oldColor).lerp(newColor, tween.value);
        setBackground(tmpColor);
      }
    });
  }

  function transitionToPreset(key) {
    const newPreset = presets[key] || presets.default;
    const oldPreset = Object.assign({}, app.preset);
    app.preset = Object.assign({}, newPreset);
    app.presetKey = key;
    transitionBackground(app.preset.background);
    traverse('onPresetTransition', app.preset, oldPreset);
  }

  function resize(width, height, pixelRatio) {
    if (query.test) {
      width = defined(width, window.innerWidth);
      height = useFullscreen ? window.innerHeight : Math.floor(width / targetAspect);
    } else if (useFullscreen) {
      // width =
      width = 6540;
      height = window.innerHeight;
    } else {
      
    }

    pixelRatio = defined(pixelRatio, window.devicePixelRatio);

    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    const el = document.querySelector('.canvas-text-container');
    el.style.width = `${width}px`;

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

    if (app.audio.playing) {
      app.audioSignal = app.audio.updateFrequencies();
    }

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
      lastTickTime = time - (deltaSinceTick % frameInterval);
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
    // temporarily disabled, it can be a bit distracting in generative/default mode
    scene.add(new ZigZagScene(app));
    scene.add(new MainScene(app));
  }
}
