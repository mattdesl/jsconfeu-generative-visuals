const RND = require('../util/random');
const ZigZag = require('../object/ZigZag');
const newArray = require('new-array');
const clamp = require('clamp');

function pointOutsideRect([x, y], [rw, rh]) {
  return x > rw || x < -rw || y > rh || y < -rh;
}

module.exports = class ZigZagScene extends THREE.Object3D {
  constructor(app) {
    super();
    this.app = app;

    const maxCapacity = 10;

    this.pool = newArray(maxCapacity).map(() => {
      const mesh = new ZigZag(app, {
        length: RND.randomInt(50, 200),
        speed: RND.randomFloat(0.3, 1.5)
        // speed: 2
      });
      mesh.visible = false;
      this.add(mesh);
      return mesh;
    });

    this.start();
  }

  clear() {
    this.pool.forEach(p => {
      p.visible = false;
      p.active = false;
    });
  }

  start() {
    this.pool.forEach(() => this.next());
  }

  next() {
    const { app, pool } = this;

    const colors = ['#313F61', '#DF1378', '#0C2AD9', '#FEC3BE', '#DDE4F0', '#7A899C'];

    const getRandomPosition = () => {
      const edges = [
        [new THREE.Vector2(-1, -1), new THREE.Vector2(1, -1)],
        [new THREE.Vector2(1, -1), new THREE.Vector2(1, 1)],
        [new THREE.Vector2(1, 1), new THREE.Vector2(-1, 1)],
        [new THREE.Vector2(-1, 1), new THREE.Vector2(-1, -1)]
      ];

      const edgeIndex = RND.randomInt(edges.length);
      const edge = edges[edgeIndex];
      const t = RND.randomFloat(0, 1);

      const vec = edge[0].clone().lerp(edge[1], t);
      vec.multiply(app.unitScale).multiplyScalar(1.2);

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
      color.head = clamp(color.head, 0, 1);

      return color;
    };

    const findAvailableObject = () => {
      return RND.shuffle(pool).find(p => !p.active);
    };

    const object = findAvailableObject();
    if (!object) return;

    object.active = true;
    object.visible = true;
    object.wasOutside = false;

    const palette = colors[RND.randomInt(colors.length)];
    const color = getColor(palette);

    const lineWidth = RND.randomFloat(0.02, 0.06);

    const scale = RND.randomFloat(0.2, 0.5);
    object.scale.setScalar(scale * app.targetScale);

    const position = getRandomPosition();
    object.position.set(position.x, position.y, 0);

    const target = [RND.randomFloat(-2, 2), RND.randomFloat(-1, 1)];

    const angle = Math.atan2(position.y - target[1], position.x - target[0]) + Math.PI / 2;
    object.rotation.z = angle;

    object.randomize({ color, lineWidth });
  }

  update() {
    const view = [this.app.unitScale.x, this.app.unitScale.y];

    this.pool.forEach(p => {
      const position2d = new THREE.Vector2(p.position.x, p.position.y);

      const head = position2d
        .clone()
        .add(p.headPos)
        .rotateAround(position2d, p.rotation.z)
        .multiply(p.scale);

      const tail = position2d
        .clone()
        .add(p.tailPos)
        .rotateAround(position2d, p.rotation.z)
        .multiply(p.scale);

      const isOutside = pointOutsideRect([head.x, head.y], view) && pointOutsideRect([tail.x, tail.y], view);

      if (isOutside) {
        if (!p.wasOutside) {
          p.wasOutside = true;
        } else {
          p.visible = false;
          p.active = false;
          this.next();
        }
      }
    });
  }
};
