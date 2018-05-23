const earcut = require('earcut');
const flatten = require('../util/flattenVertices');
const RND = require('../util/random');
const buffer = require('three-buffer-vertex-data');
const unlerp = require('unlerp');

// Given a set of 2D or 3D vectors, will triangulate them as a closed polygon
// This is 'sorta' fast, but probably better to do per-frame motion in vertex shader,
// and have occasional re-triangulation as new shapes are about to animate in.
module.exports =
  class Polygon extends THREE.BufferGeometry {
    constructor (points) {
      super();
      this.boundingBox2 = new THREE.Box2();
      if (points) this.setPoints(points);
    }

    updateUVs (points) {
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

      buffer.attr(this, 'uv', uvs, 2);
    }

    updateRandoms (points) {
      const randoms = points.map((p, i, list) => RND.randomFloat(0, 1));
      buffer.attr(this, 'random', randoms, 1);
    }

    // Pass an already-triangulated polygon
    setComplex (points, cells) {
      buffer.attr(this, 'position', points.map(p => p.toArray().slice(0, 2)), 2);
      buffer.index(this, cells);

      this.updateRandoms(points);
      this.updateUVs(points);
    }

    getBounds2D () {
      return this.boundingBox2;
    }

    // Triangulate a polygon
    setPoints (points) {
      const array = flatten(points);
      const indices = earcut(array);
      buffer.attr(this, 'position', array, 2);
      buffer.index(this, indices);

      this.updateRandoms(points);
      this.updateUVs(points);
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
