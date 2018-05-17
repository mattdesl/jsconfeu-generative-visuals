const defined = require('defined');
const path = require('path');
const glslify = require('glslify');
const RND = require('../util/random');

const vertexShader = glslify(path.resolve(__dirname, '../shader/shape.vert'));
const fragmentShader = glslify(path.resolve(__dirname, '../shader/shape.frag'));

module.exports = function (opt = {}) {
  const shader = new THREE.ShaderMaterial({
    defines: Object.assign({}, opt.defines),
    vertexShader,
    fragmentShader,
    side: defined(opt.side, THREE.FrontSide),
    transparent: opt.transparent !== false,
    depthTest: Boolean(opt.depthTest),
    depthWrite: Boolean(opt.depthWrite),
    uniforms: {
      frame: { value: 0 },
      time: { value: 0 },
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
      color: { value: new THREE.Color() },
      altColor: { value: new THREE.Color() },
      opacity: { value: 1 }
    }
  });

  shader.randomize = function (opt = {}) {
    if (!opt.tiles) throw new Error('expected { tiles } option for patterns');
    if (!opt.color) throw new Error('expected { color } option for fills');
    if (!opt.centroid) throw new Error('expected { centroid } option for motion');

    const materialType = opt.materialType;
    this.defines.HAS_FILL = materialType === 'outline' || /fill/i.test(materialType);
    this.defines.HAS_TEXTURE_PATTERN = /texture-pattern/i.test(materialType);
    this.defines.HAS_SHADER_PATTERN = /shader-pattern/i.test(materialType);

    const map = opt.tiles[RND.randomInt(0, opt.tiles.length)];
    this.uniforms.map.value = map;
    this.uniforms.mapScale.value = RND.randomFloat(0.75, 1.25);
    this.uniforms.mapOffset.value.set(RND.randomFloat(-1, 1), RND.randomFloat(-1, 1));
    this.uniforms.mapMask.value = RND.randomBoolean();
    this.uniforms.mapResolution.value.set(map.image.width, map.image.height);
    this.uniforms.randomOffset.value = RND.randomFloat(0, 1);
    this.uniforms.color.value = opt.color;
    this.uniforms.altColor.value = opt.altColor || opt.color;
    this.uniforms.animate.value = 0;
    this.uniforms.centroid.value.copy(opt.centroid);

    this.needsUpdate = true;
    return this;
  };

  return shader;
};
