const defined = require('defined');
const BaseObject = require('./BaseObject');
const Polygon2D = require('../geometry/Polygon2D');
const { resampleLineByCount } = require('../util/polyline');
const RND = require('../util/random');
const colliderCircle = require('../util/colliderCircle');
const getPolygon = require('../geometry/getPolygon');
const getRectangle = require('../geometry/getRectangle');
const getBlob = require('../geometry/getBlob');
const getSVGShape = require('../geometry/getSVGShape');
const getShapeMaterial = require('../material/getShapeMaterial');
const circleIntersectsBox = require('../util/circleIntersectBox');

const getCentroid = path => {
  return path
    .reduce((sum, point) => {
      return sum.add(point);
    }, new THREE.Vector2())
    .divideScalar(path.length);
};

const tmpVec2 = new THREE.Vector2();

module.exports = class Shape extends BaseObject {
  constructor (app) {
    super(app);

    // Debugging with wireframe material to see mesh structure
    const debugMaterial = false;
    const geometry = new Polygon2D();
    const material = debugMaterial
      ? new THREE.MeshBasicMaterial({ color: 'black', wireframe: true, side: THREE.DoubleSide })
      : getShapeMaterial();

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    this.add(this.mesh);

    this.collisionArea = colliderCircle();
    if (this.collisionArea.mesh) {
      this.add(this.collisionArea.mesh);
    }

    this.rotationSpeed = 0;
    this.running = false;
    this.time = 0;
    this.duration = 1;
    this.speed = 1;
    this.finished = false;
    this.maxVelocity = 0.005;
    this.isInView = false;

    this.velocity = new THREE.Vector2();
    // this.acceleration = new THREE.Vector2();
    this.friction = 0.99999;

    this.materialType = null;
    this.shapeType = null;
  }

  randomize (opt = {}) {
    const prevShapeType = this.shapeType;
    const prevMaterialType = this.materialType;
    this.shapeType = opt.shapeType || this.shapeType;
    this.materialType = opt.materialType || this.materialType;

    const shapeType = this.shapeType;
    const materialType = this.materialType;

    let centroid;

    if (shapeType !== prevShapeType) {
      // get a new list of points
      let points;
      let svg;
      if (shapeType === 'polygon') points = getPolygon();
      else if (shapeType === 'square') points = getPolygon({ sides: 4 });
      else if (shapeType === 'rectangle-blob') points = getRectangle();
      else if (shapeType === 'triangle') points = getPolygon({ sides: 3 });
      else if (shapeType === 'circle') points = getPolygon({ sides: 32, jitter: false });
      else if (shapeType === 'circle-blob') points = getBlob();
      else if (shapeType === 'svg-heart') svg = getSVGShape('heart');
      else if (shapeType === 'svg-feather') svg = getSVGShape('feather');
      else if (shapeType === 'svg-lightning') svg = getSVGShape('lightning');
      else points = getBlob();

      // SVG is already triangulated
      if (!points && svg) {
        points = svg.positions;
      }

      // get centroid of polygon
      centroid = getCentroid(points);

      // generate the new (triangulated) geometry data
      if (svg) {
        this.mesh.geometry.setComplex(svg.positions, svg.cells);
      } else {
        // If we should 'round' the points with splines
        const round = shapeType !== 'circle';
        if (round) {
          const minTension = shapeType === 'rectangle-blob' ? 0 : 0.1;
          const maxTension = shapeType === 'rectangle-blob' ? 1 : 0.25;
          const roundTension = RND.randomBoolean() ? minTension : RND.randomFloat(minTension, maxTension);
          const roundType = shapeType === 'circle-blob' ? 'chordal' : 'catmullrom';
          const roundSegments = shapeType === 'circle-blob' ? 30 : 40;
          const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p.x, p.y, 0)));
          curve.closed = true;
          curve.tension = roundTension;
          curve.curveType = roundType;
          points = curve
            .getSpacedPoints(roundSegments)
            .slice(0, roundSegments)
            .map(p => new THREE.Vector2(p.x, p.y));
        }

        // resample along the path so we can add high frequency noise to give it rough edges in vert shader
        const finalCount = RND.randomInt(200, 600);
        const resampled = resampleLineByCount(points, finalCount, true);
        this.mesh.geometry.setPoints(resampled);
      }
    }

    // get a new material with color etc
    if (this.mesh.material.randomize) {
      this.mesh.material.randomize({
        ...opt,
        centroid,
        materialType,
        bounds: this.mesh.geometry.getBounds2D(),
        assets: this.app.assets
      });
    }
  }

  reset (opt = {}) {
    this.time = 0;
    this.finished = false;
    this.running = false;
    this.isInView = false;
    this.hasBeenSeen = false;

    if (opt.mode === 'ambient') {
      this.duration = RND.randomFloat(10, 20) * 20;
      this.speed = RND.randomFloat(0.25, 0.5) * 1;
      this.rotationSpeed = RND.randomSign() * RND.randomFloat(0.0005, 0.001) * 0.01;
    }
    else {
      this.duration = RND.randomFloat(10, 20);
      this.speed = RND.randomFloat(0.25, 0.5) * 5;
      this.rotationSpeed = RND.randomSign() * RND.randomFloat(0.0005, 0.001);
    }
  }

  setAnimation(value) {
    // animate in / out state
    if (this.mesh.material.uniforms) {
      this.mesh.material.uniforms.animate.value = value;
    }
  }

  _finish () {
    if (!this.finished) {
      this.finished = true;
    }

    if (this.running && typeof this.onFinishMovement === 'function') {
      this.onFinishMovement();
    }
    this.running = false;
  }

  update(time, dt) {
    if (this.active && this.visible && this.running && !this.finished) {
      const worldSphere = this.collisionArea.getWorldSphere(this);
      this.isInView = circleIntersectsBox(worldSphere, this.app.sceneBounds);
      if (this.isInView && !this.hasBeenSeen) {
        this.hasBeenSeen = true;
      } else if (!this.isInView && this.hasBeenSeen) {
        this._finish();
      }
    } else {
      this.isInView = false;
    }

    if (this.running && !this.finished) {
      this.time += dt;
    }

    if (this.time > this.duration) {
      this._finish();
    }

    // animation values
    this.rotation.z += this.rotationSpeed;
    if (this.mesh.material.uniforms) {
      this.mesh.material.uniforms.time.value = time;
      this.mesh.material.uniforms.resolution.value.set(this.app.width, this.app.height);
    }

    this.position.x += this.velocity.x * this.speed;
    this.position.y += this.velocity.y * this.speed;
    this.velocity.multiplyScalar(this.friction);
    this.velocity.clampScalar(-this.maxVelocity, this.maxVelocity);

    const bounds = this.mesh.geometry.getBounds2D();
    const size = bounds.getSize(tmpVec2);
    this.collisionArea.center.set(bounds.min.x + size.x / 2, bounds.min.y + size.y / 2);

    const radiusScale = 0.25;
    this.collisionArea.radius = Math.sqrt(size.x * size.x + size.y * size.y) * radiusScale;

    this.collisionArea.update();
  }

  frame(frame, time) {
    // called on every 'tick', i.e. a fixed fps lower than 60, to give a jittery feeling
    if (this.mesh.material.uniforms) this.mesh.material.uniforms.frame.value = time;
  }
};
