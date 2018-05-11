const defined = require('defined');

module.exports = (opt = {}) => {
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
