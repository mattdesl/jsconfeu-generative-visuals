const earcut = require('earcut');
const flatten = require('../util/flattenVertices');
const RND = require('../util/random');
const buffer = require('three-buffer-vertex-data');
const unlerp = require('unlerp');

const defaultRandomFunc = (point, index, list) => RND.randomFloat(0, 1);

// Given a set of 2D or 3D vectors, will triangulate them as a closed polygon
// This is 'sorta' fast, but probably better to do per-frame motion in vertex shader,
// and have occasional re-triangulation as new shapes are about to animate in.
module.exports = class Polygon extends THREE.BufferGeometry {
  constructor (points) {
    super();
    this.boundingBox2 = new THREE.Box2();
    this.points = null;
    if (points) this.setPoints(points);
  }

  setRandomAttributes (fn) {
    if (this.points == null) throw new Error('must call setPoints prior to this');

    fn = fn || defaultRandomFunc;

    const randoms = this.points.map((p, i, list) => {
      return fn(p, i, list);
    });
    buffer.attr(this, 'random', randoms, 1);
  }

  setPoints (points) {
    this.points = points;

    const array = flatten(points);
    const indices = earcut(array);

    const box = this.boundingBox2;
    box.makeEmpty();
    box.setFromPoints(points);

    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    const uvs = points.map(p => {
      return [
        width === 0 ? 0 : unlerp(box.min.x, box.max.x, p.x),
        height === 0 ? 0 : unlerp(box.min.y, box.max.y, p.y)
      ];
    });
    buffer.attr(this, 'position', array, 2);
    buffer.attr(this, 'uv', uvs, 2);
    buffer.index(this, indices);
  }

  // For now, make these methods return empty bounding volumes,
  // since it doesn't work so well with 2D position attribute data.
  computeBoundingSphere () {
    if (this.boundingSphere === null) {
      this.boundingSphere = new THREE.Sphere();
    }
    this.boundingSphere.center.set(0, 0, 0);
    this.boundingSphere.radius = 0;
  }

  computeBoundingBox () {
    if (this.boundingBox === null) {
      this.boundingBox = new THREE.Box3();
    }
    this.boundingBox.makeEmpty();
  }
};
