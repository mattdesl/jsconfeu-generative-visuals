const defined = require('defined');
const path = require('path');
const glslify = require('glslify');
const RND = require('../util/random');
const query = require('../util/query');

const allowGradient = query.gradient;

const vertexShaders = [
  glslify(path.resolve(__dirname, '../shader/shape-blob.vert'))
];

const fragGradient = glslify(path.resolve(__dirname, '../shader/surface-gradient.frag'));
const fragFill = glslify(path.resolve(__dirname, '../shader/surface-fill.frag'));

const fragmentShaders = [
  allowGradient ? fragGradient : fragFill,
  glslify(path.resolve(__dirname, '../shader/surface-texture.frag'))
];

const shader = (opt = {}) => {
  return new THREE.ShaderMaterial({
    vertexShader: opt.vertexShader,
    fragmentShader: opt.fragmentShader,
    uniforms: Object.assign({
      frame: { value: 0 },
      time: { value: 0 }
    }, opt.uniforms),
    side: defined(opt.side, THREE.FrontSide),
    transparent: opt.transparent !== false,
    depthTest: Boolean(opt.depthTest),
    depthWrite: Boolean(opt.depthWrite)
  });
};

module.exports = function (opt = {}) {
  const vertexShader = vertexShaders[RND.randomInt(0, vertexShaders.length)];
  const fragmentShader = fragmentShaders[RND.randomInt(0, fragmentShaders.length)];
  return shader({
    uniforms: {
      animate: { value: 0 },
      mapOffset: { value: new THREE.Vector2() },
      mapScale: { value: 1 },
      mapMask: { value: false, type: 'b' },
      map: { value: new THREE.Texture() },
      randomOffset: { value: 0 },
      centroid: { value: new THREE.Vector2() },
      direction: { value: new THREE.Vector2(1, 0) },
      velocity: { value: new THREE.Vector2() },
      resolution: { value: new THREE.Vector2() },
      mapResolution: { value: new THREE.Vector2() },
      color: { value: this.color },
      opacity: { value: defined(opt.opacity, 1) }
    },
    vertexShader,
    fragmentShader
  });
};
