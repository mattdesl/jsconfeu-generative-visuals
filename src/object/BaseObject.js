const defined = require('defined');

module.exports = class BaseObject extends THREE.Object3D {
  constructor () {
    super();

    // Whether the mesh is currently part of the scene or not
    this.active = false;

    // Color for the mesh
    this.color = new THREE.Color('white');
  }

  setAnimation (val) {
    // You should implement this to support animate in / out
  }

  getAnimation () {
    // You should implement this to support animate in / out
  }

  randomize () {
    // Apply randomization, i.e. before re-showing a mesh
  }

  setColor (color) {
    this.color.copy(color);
  }

  getColor () {
    return this.color;
  }
};
