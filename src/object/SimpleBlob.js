const defined = require('defined');
const getCircularBlob = require('../geometry/getCirclularBlob');
const getSquareBlob = require('../geometry/getSquareBlob');
const RND = require('../util/random');
const { resampleLineByCount } = require('../util/polyline');

const Polygon2D = require('../geometry/Polygon2D');

const path = require('path');
const glslify = require('glslify');

const shader = (opt = {}) => {
  return new THREE.ShaderMaterial({
    vertexShader: opt.vertexShader,
    fragmentShader: opt.fragmentShader,
    uniforms: Object.assign({
      frame: { value: 0 },
      time: { value: 0 }
    }, opt.uniforms),
    side: defined(opt.side, THREE.FrontSide),
    transparent: Boolean(opt.transparent),
    depthTest: Boolean(opt.depthTest),
    depthWrite: Boolean(opt.depthWrite)
  });
};

module.exports = class SimpleBlob extends THREE.Object3D {
  constructor (opt = {}) {
    super();

    const randomOffset = RND.randomFloat(0, 1);
    const material = shader({
      uniforms: {
        animate: { value: 0 },
        randomOffset: { value: randomOffset },
        centroid: { value: new THREE.Vector2() },
        direction: { value: new THREE.Vector2(1, 0) },
        velocity: { value: new THREE.Vector2() },
        color: { value: new THREE.Color(opt.color || 'white') },
        opacity: { value: defined(opt.opacity, 1) }
      },
      vertexShader: glslify(path.resolve(__dirname, '../shader/circular-blob.vert')),
      fragmentShader: glslify(path.resolve(__dirname, '../shader/circular-blob.frag'))
    });

    const fillGeometry = new Polygon2D();
    this.fill = new THREE.Mesh(fillGeometry, material);
    this.fill.frustumCulled = false;
    this.add(this.fill);

    // avoid z-fighting a bit...
    this.position.z = randomOffset;
    this.generate();
  }

  generate () {
    // get the raw path of this 'blob' shape
    const blobPath = RND.randomFloat(1) > 0.5 ? getCircularBlob() : getSquareBlob();

    // resample along the path so we can add high frequency noise to give it rough edges in vert shader
    const finalCount = 200;
    this.path = resampleLineByCount(blobPath, finalCount, true);

    // compute centroid for animations
    const centroid = this.path.reduce((sum, point) => {
      return sum.add(point);
    }, new THREE.Vector2()).divideScalar(this.path.length);

    this.fill.geometry.setPoints(this.path);
    this.fill.geometry.setRandomAttributes();
    this.fill.material.uniforms.centroid.value.copy(centroid);
  }

  update (time, dt) {
    this.fill.material.uniforms.time.value = time;
  }

  frame (frame, time) {
    this.fill.material.uniforms.frame.value = time;
  }
};
