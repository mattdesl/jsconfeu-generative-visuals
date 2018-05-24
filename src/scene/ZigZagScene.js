const RND = require('../util/random');
const ZigZag = require('../object/ZigZag');
const newArray = require('new-array');
const pickColors = require('../util/pickColors');

function pointOutsideRect([x, y], [rw, rh]) {
  return x > rw || x < -rw || y > rh || y < -rh;
}

module.exports = class ZigZagScene extends THREE.Object3D {
  constructor(app) {
    super();
    this.app = app;

    this.createPool();
  }

  createPool() {
    const maxCapacity = 5;

    this.pool = newArray(maxCapacity).map(() => {
      const mesh = new ZigZag(this.app, {
        segments: RND.randomInt(100, 200)
      });

      mesh.active = false;
      mesh.visible = false;
      this.add(mesh);

      return mesh;
    });
  }

  clear() {
    this.pool.forEach(p => {
      p.visible = false;
      p.active = false;
      p.wasVisible = false;
      p.reset();
    });
  }

  start() {
    this.pool.forEach(() => this.next());
  }

  onTrigger(event) {
    if (event === 'randomize') {
      // recreate pool to get new random zigzags
      this.clear();
      this.start();
    } else if (event === 'palette') {
      this.pool.forEach(shape => {
        // only randomize invisible shapes, others will re-appear with proper colors once they leave the stage
        if (shape.isOutside) {
          const { color } = pickColors(this.app.colorPalette.colors);
          shape.randomize({ color });
        }
      });
    } else if (event === 'clear') {
      this.clear();
    } else if (event === 'start') {
      this.start();
    }
  }

  next() {
    const { app, pool } = this;

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
      vec.multiply(app.unitScale).multiplyScalar(RND.randomFloat(1.3, 1.5));

      return vec;
    };

    const findAvailableObject = () => {
      return RND.shuffle(pool).find(p => !p.active);
    };

    const object = findAvailableObject();
    if (!object) return;

    object.active = true;
    object.visible = true;
    object.wasVisible = false;

    const lineWidth = RND.randomFloat(0.04, 0.08);

    const scale = RND.randomFloat(0.2, 0.5);
    object.scale.setScalar(scale * app.targetScale);

    const position = getRandomPosition();
    object.position.set(position.x, position.y, 0);

    const target = [RND.randomFloat(-3, 3), RND.randomFloat(-1, 1)];
    const angle = Math.atan2(position.y - target[1], position.x - target[0]) + Math.PI / 2;
    object.rotation.z = angle;

    const delay = RND.randomFloat(0, 20);
    const speed = RND.randomFloat(0.75, 1.75);

    const { color } = pickColors(this.app.colorPalette.colors);
    object.reset();
    object.randomize({ color, lineWidth, delay, speed });
  }

  update() {
    const view = [this.app.unitScale.x * 1.5, this.app.unitScale.y * 1.05];

    this.pool.forEach(p => {
      if (!p.active) return;
      const position2d = new THREE.Vector2(p.position.x, p.position.y);

      const head = p.headPos
        .clone()
        .multiplyScalar(p.scale.x)
        .add(position2d)
        .rotateAround(position2d, p.rotation.z);

      const tail = p.tailPos
        .clone()
        .multiplyScalar(p.scale.x)
        .add(position2d)
        .rotateAround(position2d, p.rotation.z);

      const isOutside = pointOutsideRect([head.x, head.y], view) && pointOutsideRect([tail.x, tail.y], view);
      p.isOutside = isOutside;

      if (isOutside) {
        if (p.wasVisible) {
          p.visible = false;
          p.active = false;

          this.next();
        }
      } else {
        p.wasVisible = true;
      }
    });
  }
};
