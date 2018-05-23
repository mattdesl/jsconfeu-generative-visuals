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
    side: THREE.DoubleSide,
    extensions: {
      derivatives: true
    },
    transparent: opt.transparent !== false,
    depthTest: Boolean(opt.depthTest),
    depthWrite: Boolean(opt.depthWrite),
    uniforms: {
      frame: { value: 0 },
      time: { value: 0 },
      animate: { value: 0 },
      maskMap: { value: new THREE.Texture() },
      mapOffset: { value: new THREE.Vector2() },
      mapScale: { value: 1 },
      mapMask: { value: false, type: 'b' },
      maskMapResolution: { value: new THREE.Vector2() },
      map: { value: new THREE.Texture() },
      shapeResolution: { value: new THREE.Vector2() },
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
    if (!opt.assets) throw new Error('expected { assets } option for patterns');

    const materialType = opt.materialType;
    this.defines.HAS_FILL = materialType === 'outline' || /fill/i.test(materialType);
    this.defines.HAS_TEXTURE_PATTERN = /texture-pattern/i.test(materialType);
    this.defines.HAS_SHADER_PATTERN = /shader-pattern/i.test(materialType);

    const { tiles, masks } = opt.assets;
    const map = tiles[RND.randomInt(0, tiles.length)];
    this.uniforms.map.value = map;
    this.uniforms.mapScale.value = RND.randomFloat(0.75, 1.0);
    this.uniforms.mapOffset.value.set(RND.randomFloat(-1, 1), RND.randomFloat(-1, 1));
    this.uniforms.mapMask.value = RND.randomBoolean();
    this.uniforms.mapResolution.value.set(map.image.width, map.image.height);

    const maskMap = masks[RND.randomInt(0, masks.length)];
    this.uniforms.maskMap.value = maskMap;
    this.uniforms.maskMapResolution.value.set(maskMap.image.width, maskMap.image.height);

    const bounds = opt.bounds;
    this.uniforms.shapeResolution.value.set(
      bounds.max.x - bounds.min.x,
      bounds.max.y - bounds.min.y
    );

    this.uniforms.randomOffset.value = RND.randomFloat(0, 1);
    if (opt.color) this.uniforms.color.value = opt.color;
    if (opt.altColor) this.uniforms.altColor.value = opt.altColor || opt.color;
    if (opt.centroid) this.uniforms.centroid.value.copy(opt.centroid);

    this.needsUpdate = true;
    return this;
  };

  return shader;
};
