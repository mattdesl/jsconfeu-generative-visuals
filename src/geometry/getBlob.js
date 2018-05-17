const convexHull = require('convex-hull');
const RND = require('../util/random');
const newArray = require('new-array');

module.exports = function getCircularBlob (opt = {}) {
  const count = RND.randomInt(8, 15);
  const radius = 1;
  // Get a random set of points within a radius
  const input = newArray(count).map(() => {
    const r = RND.randomFloat(0.95, 1.05) * radius;
    return new THREE.Vector2().fromArray(RND.randomCircle([], r)).multiplyScalar(radius);
  });
  // Get the convex hull that outlines all those points
  const edges = convexHull(input.map(p => p.toArray()));
  // Get a polyline of those edges
  return edges.map(edge => input[edge[0]]);
};
