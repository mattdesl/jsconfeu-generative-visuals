const earcut = require('earcut');
const getDimensions = require('../util/getDimensions');
const flatten = require('../util/flattenVertices');
const buffer = require('three-buffer-vertex-data');

// Given a set of 2D or 3D vectors, will triangulate them as a closed polygon
// This is 'sorta' fast, but probably better to do per-frame motion in vertex shader,
// and have occasional re-triangulation as new shapes are about to animate in.
module.exports = class TriangulatedPolygon extends THREE.BufferGeometry {
  constructor (points) {
    super();
    if (points) this.setPoints(points);
  }

  setPoints (points) {
    const DEFAULT_DIMENSIONS = 2;
    const dimensions = points.length > 0 ? getDimensions(points[0]) : DEFAULT_DIMENSIONS;
    const array = flatten(points);
    const indices = earcut(array);
    buffer.attr(this, 'position', array, dimensions);
    buffer.index(this, indices);
  }
};
