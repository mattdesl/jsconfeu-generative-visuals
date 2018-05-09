const TestScene = require('./scene/TestScene');

const canvas = document.querySelector('#canvas');

function startApplication () {
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setClearColor('#F3EBDB', 1);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  const scene = createScene();
  const clock = new THREE.Clock();
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
    scene.traverse(t => {
      if (typeof t.update === 'function') {
        t.update(time, dt);
      }
    });
    renderer.render(scene, camera);
  }

  function createScene () {
    const scene = new THREE.Scene();
    scene.add(new TestScene());
    return scene;
  }
}

startApplication();
