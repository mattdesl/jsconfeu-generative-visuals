const SimpleBlob = require('../object/SimpleBlob');
const RND = require('../util/random');
const clamp = require('clamp');

module.exports = class TestScene extends THREE.Object3D {
  constructor () {
    super();

    const colors = [
      '#313F61',
      '#DF1378',
      '#0C2AD9',
      '#FEC3BE',
      '#DDE4F0',
      '#7A899C'
    ].map(c => new THREE.Color(c));

    const mesh = new SimpleBlob({ color: '#FEC5BE' });
    this.mesh = mesh;
    this.add(mesh);
    const refresh = () => {
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
    };
    refresh();
    setInterval(() => refresh(), 500);
    // window.addEventListener('click', () => mesh.generate());
  }

  update (time, dt) {
  }
};
