module.exports = class Mesh2D extends THREE.Mesh {

  constructor (geometry, material) {
    super(geometry, material);
    this.frustumCulled = false;
  }
};
