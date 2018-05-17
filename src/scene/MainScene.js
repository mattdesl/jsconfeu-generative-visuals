const RND = require('../util/random');
const clamp = require('clamp');
const newArray = require('new-array');
const anime = require('animejs');

const Shape = require('../object/Shape');

const shapeTypes = [
  { weight: 100, value: 'circle-blob' },
  { weight: 100, value: 'rectangle-blob' },
  { weight: 30, value: 'triangle' },
  // { weight: 5, value: 'circle' },
  { weight: 10, value: 'square' }
];

// Other types:
// 'squiggle', 'ring',
// 'eye', 'feather', 'lightning', 'heart'

const materialTypes = [
  { weight: 100, value: 'fill' },
  { weight: 50, value: 'texture-pattern' },
  // { weight: 50, value: 'shader-pattern' }
  // { weight: 25, value: 'fill-texture-pattern' }
];

// const scales = [
//   { weight: 50, value: () => RND.randomFloat(2.5, 4) },
//   { weight: 100, value: () => RND.randomFloat(1.5, 2.5) },
//   { weight: 50, value: () => RND.randomFloat(0.75, 1.5) },
//   { weight: 25, value: () => RND.randomFloat(0.5, 0.75) }
// ];

// const effects = {
//   dropShadow: true, // only works with certain geom types?
//   sharpEdges: false // rounded edges or not for things like triangle/etc
// };

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
    ];

    const pool = newArray(150).map(() => {
      const mesh = new Shape(app);
      mesh.visible = false;
      this.add(mesh);
      return mesh;
    });

    const getRandomPosition = (scale) => {
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
        ? (RND.randomBoolean() ? RND.randomFloat(0.0, 0.35) : RND.randomFloat(0.65, 1))
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
      // Get unused mesh
      const object = findAvailableObject();

      // No free meshes
      if (!object) return;

      // Now in scene, no longer in pool
      object.active = true;
      // But initially hidden until we animate in
      object.visible = false;

      // randomize color a bit
      const palette = colors[RND.randomInt(colors.length)];
      const color = getColor(palette);
      const altPalette = RND.shuffle(colors).find(c => c !== palette);
      const altColor = getColor(altPalette);

      // Randomize the object and its materials
      const shapeType = RND.weighted(shapeTypes);
      const materialType = RND.weighted(materialTypes);
      const rotationSpeed = RND.randomSign() * RND.randomFloat(0.0005, 0.001);
      object.randomize({ color, altColor, shapeType, materialType, rotationSpeed });

      // randomize position and scale
      const scale = RND.randomFloat(0.5, 4.0);
      // const scale = RND.weighted(scales)();
      object.scale.setScalar(scale * (1 / 3) * app.targetScale);

      const p = getRandomPosition(scale);
      object.position.set(p.x, p.y, 0);

      // other position we will tween to
      const other = object.position.clone();
      other.y *= -1;

      // randomize the direction by some turn amount
      // const other = new THREE.Vector2().copy(mesh.position);
      // const randomDirection = new THREE.Vector2().copy(other).normalize();
      const randomDirection = new THREE.Vector2().fromArray(RND.randomCircle([], 1));
      const randomLength = RND.randomFloat(0.25, 5);
      randomDirection.y /= app.unitScale.x;
      other.addScaledVector(randomDirection, randomLength);

      // start at zero
      const animation = { value: 0 };
      object.setAnimation(animation.value);
      const updateAnimation = ev => {
        object.setAnimation(animation.value);
      };

      object.rotation.z = RND.randomFloat(-1, 1) * Math.PI * 2;

      // const newAngle = object.rotation.z + RND.randomFloat(-1, 1) * Math.PI * 2 * 0.25;
      const startDelay = RND.randomFloat(0, 15000);
      const durationMod = 1 / app.targetScale;
      anime({
        targets: animation,
        value: 1,
        update: updateAnimation,
        easing: 'easeOutQuad',
        delay: startDelay,
        duration: 5000
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
        duration: RND.randomFloat(40000, 60000) * durationMod
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

    for (let i = 0; i < 60; i++) {
      next();
    }
  }

  update (time, dt) {
  }
};
