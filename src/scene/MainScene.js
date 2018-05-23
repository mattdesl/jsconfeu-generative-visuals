const RND = require('../util/random');
const clamp = require('clamp');
const newArray = require('new-array');
const anime = require('animejs');
const colliderCircle = require('../util/colliderCircle');
const touches = require('touches');
const Shape = require('../object/Shape');

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

const materialTypes = [
  { weight: 100, value: 'fill' },
  { weight: 50, value: 'texture-pattern' }
  // { weight: 50, value: 'shader-pattern' }
  // { weight: 25, value: 'fill-texture-pattern' }
];

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

const getRandomMaterialProps = ({ colors }) => {
  const palette = colors[RND.randomInt(colors.length)];
  const color = getColor(palette);
  const altPalette = RND.shuffle(colors).find(c => c !== palette);
  const altColor = getColor(altPalette);

  // Randomize the object and its materials
  const shapeType = RND.weighted(shapeTypes);
  const materialType = RND.weighted(materialTypes);
  return { shapeType, materialType, altColor, color };
}

module.exports = class TestScene extends THREE.Object3D {
  constructor (app) {
    super();
    this.app = app;

    const maxCapacity = 100;
    this.pool = newArray(maxCapacity).map(() => {
      const mesh = new Shape(app);
      mesh.visible = false;
      this.add(mesh);
      return mesh;
    });

    this.textCollider = colliderCircle({ radius: 1.25 });
    if (this.textCollider.mesh) this.add(this.textCollider.mesh);

    this.start();

    touches(this.app.canvas).on('move', (ev, pos) => {
      const x = (pos[0] / this.app.width) * 2 - 1;
      const y = (pos[1] / this.app.height) * -2 + 1;
      const vec = new THREE.Vector3(x, y, 0);
      vec.unproject(this.app.camera);
      this.textCollider.center.set(vec.x, vec.y);
    });
  }

  clear () {
    // reset pool to initial state
    this.pool.forEach(p => {
      p.visible = false;
      p.active = false;
    });
  }

  start () {
    const app = this.app;
    const pool = this.pool;

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
      // const t = RND.randomFloat(0, 1)
      const t = isTopOrBottom
        ? (RND.randomBoolean() ? RND.randomFloat(0.0, 0.35) : RND.randomFloat(0.65, 1))
        : RND.randomFloat(0, 1);
      const vec = edge[0].clone().lerp(edge[1], t);
      vec.x *= RND.randomFloat(1.0, 1.2);
      vec.y *= RND.randomFloat(1.0, 1.25);
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

      object.reset(); // reset time properties
      object.randomize(getRandomMaterialProps({ colors: app.colorPalette.colors })); // reset color/etc

      // randomize position and scale
      const scale = RND.randomFloat(0.5, 4.0);
      // const scale = RND.weighted(scales)()
      object.scale.setScalar(scale * (1 / 3) * app.targetScale);

      const p = getRandomPosition(scale);
      object.position.set(p.x, p.y, 0);

      // other position we will tween to
      const other = object.position.clone();
      other.y *= -1;

      // randomize the direction by some turn amount
      // const other = new THREE.Vector2().copy(mesh.position)
      // const randomDirection = new THREE.Vector2().copy(other).normalize()
      const randomDirection = new THREE.Vector2().fromArray(RND.randomCircle([], 1));
      
      // const randomLength = RND.randomFloat(0.25, 5);
      // randomDirection.y /= app.unitScale.x;
      // other.addScaledVector(randomDirection, 1);
      // other.addScaledVector(randomDirection, randomLength);

      const heading = object.position.clone().normalize().negate();
      const rotStrength = RND.randomFloat(0, 1);
      heading.addScaledVector(randomDirection, rotStrength).normalize();
      // const heading = other.clone().sub(object.position)
      //.normalize();

      // start at zero
      const animation = { value: 0 };
      object.setAnimation(animation.value);
      const updateAnimation = ev => {
        object.setAnimation(animation.value);
      };

      const durationMod = app.targetScale;
      object.velocity.setScalar(0);
      object.velocity.addScaledVector(heading, 0.001 * durationMod);

      // const newAngle = object.rotation.z + RND.randomFloat(-1, 1) * Math.PI * 2 * 0.25
      const startDelay = RND.randomFloat(0, 8000);
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
        duration: 8000
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
          duration: 8000
        });
      };
    };

    for (let i = 0; i < 30; i++) {
      next();
    }
  }

  onTrigger (event) {
    if (event === 'randomize') {
      this.pool.forEach(shape => {
        if (shape.active) {
          const { color, altColor, materialType, shapeType } = getRandomMaterialProps({ colors: this.app.colorPalette.colors });
          shape.randomize({ materialType, color, altColor, shapeType });
        }
      });
    } else if (event === 'palette') {
      this.pool.forEach(shape => {
        if (shape.active) {
          const { color, altColor } = getRandomMaterialProps({ colors: this.app.colorPalette.colors });
          shape.randomize({ color, altColor });
        }
      });
    }
  }

  update (time, dt) {
    this.textCollider.update();
    this.pool.forEach(shape => {
      if (!shape.active || !shape.running) return;

      const tmpVec2 = new THREE.Vector2();
      const tmpVec3 = new THREE.Vector3();
      const a = shape.collisionArea.getWorldSphere(shape);
      const b = this.textCollider.getWorldSphere(this);
      if (a.intersectsSphere(b)) {
        tmpVec3.copy(a.center).sub(b.center);
        const bounce = 0.00005;
        shape.velocity.addScaledVector(tmpVec2.copy(tmpVec3), bounce);
      }
    });
  }
};

function circlesCollide (a, b) {
  const delta = a.center.distanceToSquared(b.center);
  const r = a.radius + b.radius;
  return delta <= (r * r);
}
