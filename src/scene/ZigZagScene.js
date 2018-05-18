const RND = require('../util/random');
const ZigZag = require('../object/ZigZag');
const newArray = require('new-array');
const clamp = require('clamp');

module.exports = class ZigZagScene extends THREE.Object3D {
  constructor(app) {
    super();
    this.app = app;

    const maxCapacity = 10;

    this.pool = newArray(maxCapacity).map(() => {
      const mesh = new ZigZag(app, { length: RND.randomInt(100, 500) });
      mesh.visible = false;
      this.add(mesh);
      return mesh;
    });

    console.log(this.pool);

    this.start();
  }

  clear() {
    this.pool.forEach(p => {
      p.visible = false;
      p.active = false;
    });
  }

  start() {
    const { app, pool } = this;

    const colors = ['#313F61', '#DF1378', '#0C2AD9', '#FEC3BE', '#DDE4F0', '#7A899C'];

    const getRandomPosition = scale => {
      const edges = [
        [new THREE.Vector2(-1, -1), new THREE.Vector2(1, -1)],
        [new THREE.Vector2(1, -1), new THREE.Vector2(1, 1)],
        [new THREE.Vector2(1, 1), new THREE.Vector2(-1, 1)],
        [new THREE.Vector2(-1, 1), new THREE.Vector2(-1, -1)]
      ];
      const edgeIndex = RND.randomInt(edges.length);
      const isTopOrBottom = edgeIndex === 0 || edgeIndex === 2;
      const edge = edges[edgeIndex];
      // const t = RND.randomFloat(0, 1)
      const t = isTopOrBottom
        ? RND.randomBoolean()
          ? RND.randomFloat(0.0, 0.35)
          : RND.randomFloat(0.65, 1)
        : RND.randomFloat(0, 1);
      const vec = edge[0].clone().lerp(edge[1], t);
      vec.x *= RND.randomFloat(1.0, 1.2);
      vec.y *= RND.randomFloat(1.0, 1.25);
      vec.multiply(app.unitScale);
      return vec;
    };

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

    const findAvailableObject = () => {
      return RND.shuffle(pool).find(p => !p.active);
    };

    const next = () => {
      const object = findAvailableObject();
      if (!object) return;

      object.active = true;
      object.visible = true;

      const palette = colors[RND.randomInt(colors.length)];
      const color = getColor(palette);

      const lineWidth = RND.randomFloat(0.001, 0.01);

      const scale = RND.randomFloat(0.2, 0.5);
      object.scale.setScalar(scale * app.targetScale);

      const p = getRandomPosition(scale);
      object.position.set(p.x, p.y, 0);

      object.rotation.z = RND.randomFloat(-1, 1) * Math.PI * 2;

      object.randomize({ color, lineWidth });

      // TODO: animate zig-zags
    };

    for (let i = 0; i < 10; i++) {
      next();
    }
  }
};
