const earcut = require('earcut');
const getDimensions = require('../util/getDimensions');
const flatten = require('../util/flattenVertices');
const buffer = require('three-buffer-vertex-data');

const DEFAULT_DIMENSIONS = 2;

module.exports = class TriangulatedPolygon extends THREE.BufferGeometry {

  constructor (points) {
    super();
    if (points) this.setPoints(points);
  }

  setPoints (points) {
    const dimensions = points.length > 0 ? getDimensions(points[0]) : DEFAULT_DIMENSIONS;
    const array = flatten(points);
    const indices = earcut(array);
    buffer.attr(this, 'position', array, dimensions);
    buffer.index(this, indices);
  }
};
