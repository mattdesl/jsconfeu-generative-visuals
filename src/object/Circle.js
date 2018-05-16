const defined = require('defined');
const BaseObject = require('./BaseObject');

// This module is not really used, but it
// can be used as a reference point for building
// new shapes
module.exports = class Circle extends BaseObject {
  constructor () {
    super();

    const geometry = new THREE.CircleGeometry(1, 64);
    const material = new THREE.MeshBasicMaterial({
      color: this.color
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    this.add(this.mesh);

    this.color = material.color;
  }

  setAnimation (value) {
    this.mesh.scale.setScalar(value);
  }
};
