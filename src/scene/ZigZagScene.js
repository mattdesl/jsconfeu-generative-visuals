const RND = require('../util/random');
const ZigZag = require('../object/ZigZag');
const newArray = require('new-array');
const pickColors = require('../util/pickColors');

function pointOutsideRect([x, y], [rw, rh]) {
  return x > rw || x < -rw || y > rh || y < -rh;
}

const tmpView = new THREE.Box2();

module.exports = class ZigZagScene extends THREE.Object3D {
  constructor(app) {
    super();
    this.app = app;

    this.createPool();
  }

  createPool() {
    const maxCapacity = 6;
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
    this.running = true;
    this.pool.forEach(() => this.next());
  }

  onTrigger(event) {
    if (event === 'fadeOut') {
      this.running = false;
      this.pool.forEach(s => {
        s.transitionColor('#000');
      });
    } else if (event === 'randomize') {
      // recreate pool to get new random zigzags
      this.clear();
      this.start();
    } else if (event === 'clear') {
      this.clear();
    } else if (event === 'start') {
      this.start();
    }
  }

  onPresetChanged(preset, oldPreset) {
    this.running = true;
    this.clear();
    this.start();
  }

  onPresetTransition(preset, oldPreset) {
    this.running = true;
    // Transition colors to new features
    this.pool.forEach(shape => {
      if (!shape.active) return;
      const { color } = pickColors(preset.colors);
      shape.transitionColor(color);
    });

    this.trimCapacity();
    this.start();
    // TODO: Could animate out shapes here if capacity is less than current?
  }

  trimCapacity() {
    const active = this.pool.filter(p => p.active);
    const capacity = this.app.preset.zigZagCapacity;
    if (active.length <= capacity) return; // less than max
    const toKill = RND.shuffle(active).slice(capacity);
    toKill.forEach(k => k.animateOut());
  }

  next() {
    if (!this.running) return;
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
      const activeCount = pool.filter(p => p.active).length;
      if (activeCount >= this.app.preset.zigZagCapacity) return;

      return RND.shuffle(pool).find(p => !p.active);
    };

    const object = findAvailableObject();
    if (!object) return;

    object.active = true;
    object.visible = true;
    object.wasVisible = false;

    const lineWidth = RND.randomFloat(0.02, 0.05) * 1;

    const scale = RND.randomFloat(0.2, 0.5);
    object.scale.setScalar(scale * app.targetScale);

    const position = getRandomPosition();
    object.position.set(position.x, position.y, 0);

    const target = [RND.randomFloat(-3, 3), RND.randomFloat(-1, 1)];
    const angle = Math.atan2(position.y - target[1], position.x - target[0]) + Math.PI / 2;
    object.rotation.z = angle;

    const delay = RND.randomFloat(0, 20);
    const speed = RND.randomFloat(0.75, 1.75);

    const { color } = pickColors(this.app.preset.colors);
    object.reset();
    object.randomize({ color, lineWidth, delay, speed });
  }

  update() {
    tmpView.copy(this.app.sceneBounds);
    tmpView.expandByScalar(1.05); // slight padding to avoid popping

    const position2d = new THREE.Vector2();

    this.pool.forEach(p => {
      if (!p.active) return;

      position2d.x = p.position.x;
      position2d.y = p.position.y;

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

      const isOutside = !tmpView.containsPoint(head) && !tmpView.containsPoint(tail);
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
