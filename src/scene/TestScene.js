const RND = require('../util/random');
const clamp = require('clamp');
const newArray = require('new-array');
const anime = require('animejs');

const SimpleBlob = require('../object/SimpleBlob');
const Circle = require('../object/Circle');

module.exports = class TestScene extends THREE.Object3D {
  constructor (app) {
    super();
    this.app = app;

    const colors = [
      '#313F61',
      '#DF1378',
      '#0C2AD9',
      '#FEC3BE',
      '#DDE4F0',
      '#7A899C'
    ].map(c => new THREE.Color(c));

    const pool = newArray(150).map(() => {
      const mesh = new SimpleBlob(app);
      // const mesh = RND.randomBoolean()
      //   ? new Circle(app)
      //   : new SimpleBlob(app);
      mesh.visible = false;
      this.add(mesh);
      return mesh;
    });

    const getRandomPosition = () => {
      const edges = [
        [ new THREE.Vector2(-1, -1), new THREE.Vector2(1, -1) ],
        [ new THREE.Vector2(1, -1), new THREE.Vector2(1, 1) ],
        [ new THREE.Vector2(1, 1), new THREE.Vector2(-1, 1) ],
        [ new THREE.Vector2(-1, 1), new THREE.Vector2(-1, -1) ]
      ];
      const edgeIndex = RND.randomInt(edges.length);
      const isTopOrBottom = edgeIndex === 0 || edgeIndex === 2;
      const edge = edges[edgeIndex];
      // const t = RND.randomFloat(0, 1);
      const t = isTopOrBottom
        ? (RND.randomBoolean() ? RND.randomFloat(0.0, 0.45) : RND.randomFloat(0.55, 1))
        : RND.randomFloat(0, 1);
      const vec = edge[0].clone().lerp(edge[1], t);
      vec.x *= RND.randomFloat(1.0, 1.2);
      vec.y *= RND.randomFloat(1.0, 2);
      vec.multiply(app.unitScale);
      return vec;
    };

    const findAvailableObject = () => {
      return RND.shuffle(pool).find(p => !p.active);
    };

    const next = () => {
      // Get unused mesh
      const object = findAvailableObject();

      // No free meshes
      if (!object) return;

      // Now in scene, no longer in pool
      object.active = true;
      // But initially hidden until we animate in
      object.visible = false;

      // Randomize the object and its materials
      object.randomize();

      // randomize color a bit
      const palette = colors[RND.randomInt(colors.length)];
      const color = object.getColor();
      color.copy(palette);
      const hOff = RND.randomFloat(-1, 1) * (2 / 360);
      const sOff = RND.randomFloat(-1, 1) * 0.01;
      const lOff = RND.randomFloat(-1, 1) * 0.025;
      color.offsetHSL(hOff, sOff, lOff);
      color.r = clamp(color.r, 0, 1);
      color.g = clamp(color.g, 0, 1);
      color.b = clamp(color.b, 0, 1);

      // randomize position and scale
      const p = getRandomPosition();
      const scale = RND.randomFloat(0.5, 4) * (1 / 3);
      object.scale.setScalar(scale);
      object.position.set(p.x, p.y, 0);

      // other position we will tween to
      const other = object.position.clone();
      other.y *= -1;

      // randomize the direction by some turn amount
      // const other = new THREE.Vector2().copy(mesh.position);
      // const randomDirection = new THREE.Vector2().copy(other).normalize();
      const randomDirection = new THREE.Vector2().fromArray(RND.randomCircle([], 1));
      const randomLength = RND.randomFloat(0.1, 5);
      randomDirection.y /= app.unitScale.x;
      other.addScaledVector(randomDirection, randomLength);

      // start at zero
      const animation = { value: 0 };
      object.setAnimation(animation.value);
      const updateAnimation = ev => {
        object.setAnimation(animation.value);
      };

      object.rotation.z = RND.randomFloat(-1, 1) * Math.PI * 2;
      const newAngle = object.rotation.z + RND.randomFloat(-1, 1) * Math.PI * 2 * 0.25;
      const startDelay = RND.randomFloat(0, 15000);
      anime({
        targets: animation,
        value: 1,
        update: updateAnimation,
        easing: 'easeOutQuad',
        delay: startDelay,
        duration: 5000
      });
      anime({
        targets: object.rotation,
        z: newAngle,
        easing: 'easeOutQuad',
        delay: startDelay,
        duration: 10000
      });
      anime({
        targets: object.position,
        x: other.x,
        y: other.y,
        begin: () => {
          // start rendering it
          object.visible = true;
        },
        easing: 'easeOutQuad',
        delay: startDelay,
        duration: RND.randomFloat(40000, 60000)
      }).finished.then(() => {
        anime({
          targets: animation,
          update: updateAnimation,
          value: 0,
          complete: () => {
            // Hide completely
            object.visible = false;
            // Place back in pool for re-use
            object.active = false;
            next();
          },
          easing: 'easeInExpo',
          delay: RND.randomFloat(100, 2000),
          duration: 2000
        });
      });
    };

    for (let i = 0; i < 40; i++) {
      next();
    }
  }

  update (time, dt) {
  }
};
