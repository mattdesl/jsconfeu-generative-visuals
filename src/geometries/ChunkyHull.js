const TriangulatedPolygon = require('./TriangulatedPolygon');
const convexHull = require('convex-hull');
const RND = require('../util/random');
const newArray = require('new-array');

module.exports = class ChunkyHull extends TriangulatedPolygon {

  constructor () {
    super();
    this.generate();
  }

  generate () {
    const count = 50;
    const radius = 0.5;
    // Get a random set of points within a radius
    const input = newArray(count).map(() => {
      return new THREE.Vector2(
        RND.randomFloat(-1, 1),
        RND.randomFloat(-1, 1)
      ).multiplyScalar(radius);
    });
    // Get the convex hull that outlines all those points
    const edges = convexHull(input.map(p => p.toArray()));
    // Get a polyline of those edges
    const points = edges.map(edge => input[edge[0]]);
    // Input into geometry...
    this.setPoints(points);
  }
};
