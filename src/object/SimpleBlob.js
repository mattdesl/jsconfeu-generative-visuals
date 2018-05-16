const defined = require('defined');
const getCircularBlob = require('../geometry/getCirclularBlob');
const getSquareBlob = require('../geometry/getSquareBlob');
const RND = require('../util/random');
const { resampleLineByCount } = require('../util/polyline');

const getRandomMaterial = require('../material/getRandomMaterial');
const Polygon2D = require('../geometry/Polygon2D');
const BaseObject = require('./BaseObject');

module.exports = class SimpleBlob extends BaseObject {
  constructor (app) {
    super(app);
    this.app = app;

    const material = getRandomMaterial();
    const fillGeometry = new Polygon2D();
    this.fill = new THREE.Mesh(fillGeometry, material);
    this.fill.frustumCulled = false;
    this.add(this.fill);

    this.randomize();
  }

  randomize () {
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

    this.randomOffset = RND.randomFloat(0, 1);
    this.position.z = this.randomOffset;

    this.fill.material = getRandomMaterial();
    const map = this.app.assets.tiles[RND.randomInt(0, this.app.assets.tiles.length)];
    this.fill.material.uniforms.map.value = map;
    this.fill.material.uniforms.mapScale.value = RND.randomFloat(0.75, 1.0);
    this.fill.material.uniforms.mapOffset.value.set(RND.randomFloat(-1, 1), RND.randomFloat(-1, 1));
    this.fill.material.uniforms.mapMask.value = RND.randomBoolean();
    this.fill.material.uniforms.mapResolution.value.set(map.image.width, map.image.height);
    this.fill.material.uniforms.randomOffset.value = this.randomOffset;
    this.fill.material.uniforms.color.value = this.color;
    this.fill.material.uniforms.animate.value = 0;
    this.fill.material.uniforms.centroid.value.copy(centroid);
  }

  setAnimation (value) {
    this.fill.material.uniforms.animate.value = value;
  }

  update (time, dt) {
    this.fill.material.uniforms.time.value = time;
    this.fill.material.uniforms.resolution.value.set(this.app.width, this.app.height);
  }

  frame (frame, time) {
    this.fill.material.uniforms.frame.value = time;
  }
};
