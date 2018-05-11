const defined = require('defined');
const getCircularBlob = require('../geometry/getCirclularBlob');
const getSquareBlob = require('../geometry/getSquareBlob');
const RND = require('../util/random');
const { resampleLineByCount } = require('../util/polyline');
const makeShader = require("../util/makeShader");

const Polygon = require('../geometry/Polygon');

const path = require('path');
const glslify = require('glslify');

module.exports = class SimpleBlob extends THREE.Object3D {
  constructor (opt = {}) {
    super();

    const material = makeShader({
      uniforms: {
        color: { value: new THREE.Color(opt.color || 'white') },
        opacity: { value: defined(opt.opacity, 1) }
      },
      vertexShader: glslify(path.resolve(__dirname, '../shader/circular-blob.vert')),
      fragmentShader: glslify(path.resolve(__dirname, '../shader/circular-blob.frag'))
    });

    const fillGeometry = new Polygon();
    this.fill = new THREE.Mesh(fillGeometry, material);
    this.add(this.fill);

    this.generate();
  }

  generate () {
    // get the raw path of this 'blob' shape
    const blobPath = RND.randomFloat(1) > 0.5 ? getCircularBlob() : getSquareBlob();

    // resample along the path so we can add high frequency noise to give it rough edges in vert shader
    const finalCount = 100;
    this.path = resampleLineByCount(blobPath, finalCount, true);

    this.fill.geometry.setPoints(this.path);
  }

  update (time, dt) {
    this.fill.material.uniforms.time.value = time;
  }

  frame (frame, time) {
    this.fill.material.uniforms.frame.value = time;
  }
};
