const RND = require('../util/random');
const clamp = require('clamp');
const normalize = require('normalize-path-scale');

module.exports = class ZigZagScene extends THREE.Object3D {
  constructor(app) {
    super();

    this.app = app;

    const colors = ['#313F61', '#DF1378', '#0C2AD9', '#FEC3BE', '#DDE4F0', '#7A899C'];

    const palette = colors[RND.randomInt(colors.length)];

    const getColor = colorStyle => {
      const color = new THREE.Color().set(colorStyle);
      const hOff = RND.randomFloat(-1, 1) * (2 / 360);
      const sOff = RND.randomFloat(-1, 1) * 0.01;
      const lOff = RND.randomFloat(-1, 1) * 0.025;
      color.offsetHSL(hOff, sOff, lOff);
      color.r = clamp(color.r, 0, 1);
      color.g = clamp(color.g, 0, 1);
      color.b = clamp(color.b, 0, 1);
      return color;
    };

    const color = getColor(palette);

    // I've put circles on the zig-zag path in sketch, and copied their positions ¯\_(ツ)_/¯
    const zigZagPoints = normalize([
      [113.5, 952.5],
      [264.5, 809.5],
      [78.5, 711.5],
      [257.5, 568.5],
      [47.5, 458.5],
      [227.5, 331.5],
      [8.5, 224.5],
      [199.5, 134.5],
      [135.5, 8.5]
    ]);

    const curve = new THREE.CatmullRomCurve3(zigZagPoints.map(([x, y]) => new THREE.Vector3(x, y, 0)));

    curve.tension = 0.8;
    curve.curveType = 'catmullrom';

    const geometry = new THREE.TubeGeometry(curve, 1024, 0.05, 4, false);
    const material = new THREE.MeshBasicMaterial({ color });

    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.set(0, -1, 0);

    this.add(this.mesh);
  }

  update() {}
};
