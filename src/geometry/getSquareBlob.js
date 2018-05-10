const convexHull = require('convex-hull');
const RND = require('../util/random');
const newArray = require('new-array');

module.exports = function getCircularBlob (opt = {}) {
  // var roundedRectShape = new THREE.Shape();
  // (function roundedRect (ctx, x, y, width, height, radius) {
  //   ctx.moveTo(x, y + radius);
  //   ctx.lineTo(x, y + height - radius);
  //   ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
  //   ctx.lineTo(x + width - radius, y + height);
  //   ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  //   ctx.lineTo(x + width, y + radius);
  //   ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
  //   ctx.lineTo(x + radius, y);
  //   ctx.quadraticCurveTo(x, y, x, y + radius);
  // })(roundedRectShape, 0, 0, 50, 50, 20);

  const size = 0.25;
  const min = new THREE.Vector2(-1, -1).multiplyScalar(size);
  const max = new THREE.Vector2(1, 1).multiplyScalar(size);
  let path = [
    min,
    new THREE.Vector2(max.x, min.y),
    max,
    new THREE.Vector2(min.x, max.y)
  ];

  const rotation = RND.randomFloat(-1, 1) * Math.PI * 2;
  let width, height;

  const minDim = 0.25;
  const maxDim = 1.0;
  const dimScale = RND.randomFloat(0.25, 2);
  width = RND.randomFloat(minDim, maxDim);
  height = RND.randomFloat(minDim, maxDim);

  const typeList = [ 0, 1, 2 ];
  const type = typeList[RND.randomInt(typeList.length)];
  if (type === 0) {
    width *= dimScale;
  } else if (type === 1) {
    height *= dimScale;
  } else {
    width = height;
  }

  const center = new THREE.Vector2(0, 0);
  path.forEach(p => {
    p.x *= width;
    p.y *= height;
    const rotationOffset = RND.randomFloat(1) > 0.5 ? 0 : RND.randomFloat(0.25, 0.5);
    p.rotateAround(center, rotation + RND.randomFloat(-1, 1) * rotationOffset);
  });

  const points3D = path.map(position => new THREE.Vector3(position.x, position.y, 0));
  const curve = new THREE.CatmullRomCurve3(points3D);
  curve.closed = true;
  curve.tension = RND.randomFloat(1) > 0.5 ? 0 : RND.randomFloat(0, 1);
  curve.curveType = 'catmullrom';

  const pointCount = 40;
  return curve.getSpacedPoints(pointCount).slice(0, pointCount).map(p => new THREE.Vector2().copy(p));
};
