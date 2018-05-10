const rightNow = require('right-now');

const TestScene = require('./scene/TestScene');

const canvas = document.querySelector('#canvas');

function startApplication () {
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setClearColor('#FBF9F3', 1);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  const scene = createScene();
  const clock = new THREE.Clock();

  let lastTime = rightNow();
  let frame = 0;
  const tickFPS = 14;

  resize();
  window.addEventListener('resize', resize);
  renderer.animate(animate);

  function resize () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio;
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);

    const aspect = width / height;
    if (width > height) {
      camera.scale.x = aspect;
      camera.scale.y = 1;
    } else {
      camera.scale.x = aspect;
      camera.scale.y = 1;
    }
    camera.updateProjectionMatrix();
  }

  function animate () {
    const time = clock.getElapsedTime();
    const dt = clock.getDelta();

    let now = rightNow();
    const frameIntervalMS = 1000 / tickFPS;
    const deltaTimeMS = now - lastTime;

    if (deltaTimeMS > frameIntervalMS) {
      now = now - (deltaTimeMS % frameIntervalMS);
      lastTime = now;
      traverse('frame', frame++, time);
    }

    traverse('update', time, dt);
    renderer.render(scene, camera);
  }

  function traverse (fn, ...args) {
    scene.traverse(t => {
      if (typeof t[fn] === 'function') {
        t[fn](...args);
      }
    });
  }

  function createScene () {
    const scene = new THREE.Scene();
    scene.add(new TestScene());
    return scene;
  }
}

startApplication();
