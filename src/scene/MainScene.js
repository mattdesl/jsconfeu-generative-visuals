const RND = require('../util/random');
const clamp = require('clamp');
const newArray = require('new-array');
const anime = require('animejs');
const colliderCircle = require('../util/colliderCircle');
const touches = require('touches');
const defined = require('defined');
const Shape = require('../object/Shape');
const pickColors = require('../util/pickColors');

const shapeTypes = [
  { weight: 100, value: 'circle-blob' },
  { weight: 100, value: 'rectangle-blob' },
  { weight: 30, value: 'triangle' },
  { weight: 5, value: 'circle' },
  { weight: 10, value: 'square' },
  { weight: 40, value: 'svg-heart' },
  { weight: 40, value: 'svg-feather' },
  { weight: 10, value: 'svg-lightning' }
];

// Other types:
// 'squiggle', 'ring',
// 'eye', 'feather', 'lightning', 'heart'

const makeMaterialTypesWeights = ({ paletteName }) => {
  return [
    { weight: paletteName === 'ambient' ? 5 : 100, value: 'fill' },
    { weight: 50, value: 'texture-pattern' }
    // { weight: 50, value: 'shader-pattern' }
    // { weight: 25, value: 'fill-texture-pattern' }
  ];
};

const makeScale = ({ paletteName, materialType }) => {
  if (paletteName !== 'ambient') return RND.randomFloat(0.5, 4.0);

  // white fill in ambient mode only looks good for small shapes
  return materialType === 'fill' ? RND.randomFloat(0.5, 0.75) : RND.randomFloat(0.5, 4.0);
};

// const scales = [
//   { weight: 50, value: () => RND.randomFloat(2.5, 4) },
//   { weight: 100, value: () => RND.randomFloat(1.5, 2.5) },
//   { weight: 50, value: () => RND.randomFloat(0.75, 1.5) },
//   { weight: 25, value: () => RND.randomFloat(0.5, 0.75) }
// ]

// const effects = {
//   dropShadow: true, // only works with certain geom types?
//   sharpEdges: false // rounded edges or not for things like triangle/etc
// }

const getRandomMaterialProps = ({ colors, paletteName }) => {
  const { color, altColor } = pickColors(colors);

  // Randomize the object and its materials
  const shapeType = RND.weighted(shapeTypes);
  const materialType = RND.weighted(makeMaterialTypesWeights({ paletteName }));
  return { shapeType, materialType, altColor, color };
};

module.exports = class MainScene extends THREE.Object3D {
  constructor(app) {
    super();
    this.app = app;

    const maxCapacity = 100;
    this.activeCapacity = 30;

    this.poolContainer = new THREE.Group();
    this.add(this.poolContainer);
    this.pool = newArray(maxCapacity).map(() => {
      const mesh = new Shape(app);
      mesh.visible = false;
      this.poolContainer.add(mesh);
      return mesh;
    });

    this.textCollider = colliderCircle({ radius: 1.5 });
    if (this.textCollider.mesh) this.add(this.textCollider.mesh);
  }

  clear() {
    // reset pool to initial state
    this.pool.forEach(p => {
      p.visible = false;
      p.active = false;
    });
  }

  start(opt = {}) {
    const app = this.app;
    const pool = this.pool;
    console.log('starting', this.app.mode);

    const getRandomPosition = () => {
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

    const findAvailableObject = () => {
      const activeCount = pool.filter(p => p.active).length;
      if (activeCount >= this.activeCapacity) return;

      return RND.shuffle(pool).find(p => !p.active);
    };

    const next = (params = {}) => {
      // Get unused mesh
      const object = findAvailableObject();

      // No free meshes
      if (!object) return;

      // Now in scene, no longer in pool
      object.active = true;
      // But initially hidden until we animate in
      object.visible = false;

      const materialProps = getRandomMaterialProps({
        colors: app.colorPalette.colors,
        paletteName: app.colorPalette.name
      });

      object.reset({ mode: app.mode }); // reset time properties
      object.randomize(materialProps); // reset color/etc

      // randomize position and scale
      const scale = makeScale({ paletteName: app.colorPalette.name, materialType: materialProps.materialType });
      // const scale = RND.weighted(scales)()
      object.scale.setScalar(scale * (1 / 3) * app.targetScale);

      let p = getRandomPosition();
      if (app.mode === 'intro') {
        const scalar = RND.randomFloat(0.5, 1);
        p.multiplyScalar(scalar);
      } else {
      }
      object.position.set(p.x, p.y, 0);

      const randomDirection = new THREE.Vector2().fromArray(RND.randomCircle([], 1));

      // const randomLength = RND.randomFloat(0.25, 5);
      // randomDirection.y /= app.unitScale.x;
      // other.addScaledVector(randomDirection, 1);
      // other.addScaledVector(randomDirection, randomLength);

      const heading = object.position
        .clone()
        .normalize()
        .negate();
      const rotStrength = RND.randomFloat(0, 1);
      heading.addScaledVector(randomDirection, rotStrength).normalize();

      // start at zero
      const animation = { value: 0 };
      object.setAnimation(animation.value);
      const updateAnimation = () => {
        object.setAnimation(animation.value);
      };

      let animationDuration;
      if (app.mode === 'ambient') animationDuration = RND.randomFloat(16000, 32000);
      else if (app.mode === 'generative') animationDuration = RND.randomFloat(4000, 8000);
      else animationDuration = 3000;

      const durationMod = app.targetScale;
      object.velocity.setScalar(0);
      object.velocity.addScaledVector(heading, 0.001 * durationMod);

      // const newAngle = object.rotation.z + RND.randomFloat(-1, 1) * Math.PI * 2 * 0.25
      let defaultDelay;
      if (app.mode === 'intro') {
        defaultDelay = 0;
      } else {
        defaultDelay = RND.randomFloat(0, 8000);
      }
      let startDelay = defined(params.startDelay, defaultDelay);
      const animIn = anime({
        targets: animation,
        value: 1,
        update: updateAnimation,
        easing: 'easeOutExpo',
        delay: startDelay,
        begin: () => {
          object.running = true;
          object.visible = true;
        },
        duration: animationDuration
      });

      object.onFinishMovement = () => {
        animIn.pause();
        anime({
          targets: animation,
          update: updateAnimation,
          value: 0,
          complete: () => {
            // Hide completely
            object.onFinishMovement = null;
            object.visible = false;
            object.running = false;
            // Place back in pool for re-use
            object.active = false;
            next();
          },
          easing: 'easeOutQuad',
          duration: animationDuration
        });
      };
    };

    if (app.mode === 'intro') {
      next();
    } else {
      for (let i = 0; i < this.activeCapacity; i++) {
        next();
      }
    }

    this.next = next;
  }

  beat () {
    this.next();
  }

  onTrigger(event, args) {
    const app = this.app;
    if (event === 'randomize') {
      // this.pool.forEach(p => {
      //   p.renderOrder = RND.randomInt(-10, 10);
      // });
      // console.log('sort');
      // this.poolContainer.children.sort((a, b) => {
      //   return a.renderOrder - b.renderOrder;
      // });
      this.pool.forEach(shape => {
        if (!shape.active) return;
        const { color, shapeType, materialType, altColor } = getRandomMaterialProps({
          colors: app.colorPalette.colors,
          paletteName: app.colorPalette.name
        });
        shape.randomize({ color, shapeType, materialType, altColor });
      })
    } else if (event === 'palette') {
      // force shapes to animate out, this will call next() again, and make them re-appear with proper colors
      this.pool.forEach(shape => {
        if (shape.active) {
          shape.onFinishMovement();
        }
      });
    } else if (event === 'clear') {
      this.clear();
    } else if (event === 'start') {
      this.start();
    } else if (event === 'switchMode') {
      if (this.app.mode === 'ambient') this.activeCapacity = 6;
      else if (this.app.mode === 'intro') this.activeCapacity = 10;
      else this.activeCapacity = 30;
    } else if (event === 'colliderPosition') {
      this.textCollider.center.x = args.x;
      this.textCollider.center.y = args.y;
      if (args.radius) this.textCollider.radius = args.radius;
    } else if (event === 'beat' && this.app.mode === 'intro') {
      this.beat();
    }
  }

  update(time, dt) {
    this.textCollider.update();

    const tmpVec2 = new THREE.Vector2();
    const tmpVec3 = new THREE.Vector3();

    this.pool.forEach(shape => {
      if (!shape.active || !shape.running) return;

      const a = shape.collisionArea.getWorldSphere(shape);
      const b = this.textCollider.getWorldSphere(this);

      const size = shape.scale.x / this.app.targetScale * 3;

      if (a.intersectsSphere(b)) {
        tmpVec3.copy(a.center).sub(b.center);
        const bounce = 0.000025 * (4 / size);
        shape.velocity.addScaledVector(tmpVec2.copy(tmpVec3), bounce);
      }
    });
  }
};

function circlesCollide(a, b) {
  const delta = a.center.distanceToSquared(b.center);
  const r = a.radius + b.radius;
  return delta <= r * r;
}
