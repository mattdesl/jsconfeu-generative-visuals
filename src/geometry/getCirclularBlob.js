const convexHull = require('convex-hull');
const RND = require('../util/random');
const newArray = require('new-array');

module.exports = function getCircularBlob (opt = {}) {
  const count = 10;
  const radius = 0.5;
  // Get a random set of points within a radius
  const input = newArray(count).map(() => {
    const r = RND.randomFloat(0.95, 1.05) * radius;
    return new THREE.Vector2().fromArray(RND.randomCircle([], r)).multiplyScalar(radius);
  });
  // Get the convex hull that outlines all those points
  const edges = convexHull(input.map(p => p.toArray()));
  // Get a polyline of those edges
  const points = edges.map(edge => input[edge[0]]);

  const points3D = points.map(position => new THREE.Vector3(position.x, position.y, 0));
  const curve = new THREE.CatmullRomCurve3(points3D);
  curve.closed = true;
  curve.curveType = 'chordal';

  const pointCount = 30;
  return curve.getSpacedPoints(pointCount).slice(0, pointCount).map(p => new THREE.Vector2().copy(p));
};
