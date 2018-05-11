const SimpleBlob = require('../object/SimpleBlob');
const RND = require('../util/random');
const clamp = require('clamp');
const newArray = require('new-array');
const anime = require('animejs');

module.exports = class TestScene extends THREE.Object3D {
  constructor () {
    super();

    const colors = [
      '#313F61',
      '#DF1378',
      '#0C2AD9',
      '#FEC3BE',
      // '#DDE4F0'
      '#7A899C'
    ].map(c => new THREE.Color(c));

    const pool = newArray(100).map(() => {
      const mesh = new SimpleBlob();
      mesh.visible = false;
      this.add(mesh);
      return mesh;
    });

    const getRandomEdgePosition = () => {
      const radius = RND.randomFloat(0.75, 1.5);
      const v = new THREE.Vector2().fromArray(RND.randomCircle([], radius));
      return v;
    };

    const next = () => {
      const mesh = pool.find(p => !p.visible);
      if (!mesh) return;

      const palette = colors[RND.randomInt(colors.length)];
      const color = mesh.fill.material.uniforms.color.value;
      color.copy(palette);
      const hOff = RND.randomFloat(-1, 1) * (2 / 360);
      const sOff = RND.randomFloat(-1, 1) * 0.01;
      const lOff = RND.randomFloat(-1, 1) * 0.025;
      color.offsetHSL(hOff, sOff, lOff);
      color.r = clamp(color.r, 0, 1);
      color.g = clamp(color.g, 0, 1);
      color.b = clamp(color.b, 0, 1);
      mesh.generate();

      const p = getRandomEdgePosition();
      mesh.position.set(p.x, p.y, 0);
      mesh.scale.setScalar(RND.randomFloat(0.5, 3));
      mesh.visible = true;

      const other = p.clone();
      const randomDirection = new THREE.Vector2().fromArray(RND.randomCircle([], 1));
      const randomLength = RND.randomFloat(0.05, 0.15);
      other.addScaledVector(randomDirection, randomLength);
      mesh.fill.material.visible = false;
      anime({
        targets: mesh.position,
        x: other.x,
        y: other.y,
        begin: () => {
          mesh.fill.material.visible = true;
        },
        easing: 'easeOutElastic',
        delay: RND.randomFloat(0, 2500),
        duration: RND.randomFloat(1500, 2000)
      }).finished.then(() => {
        setTimeout(() => {
          mesh.visible = false;
        }, RND.randomFloat(2500, 3500));
      });
    };

    next();
    setInterval(next, 300);
    // const refresh = () => {

    // };
    // refresh();
    // setInterval(() => refresh(), 2500);
    // window.addEventListener('click', () => mesh.generate());
  }

  update (time, dt) {
  }
};
