const ChunkyHull = require('../geometries/ChunkyHull');
const Mesh2D = require('./Mesh2D');

module.exports = class TestScene extends THREE.Object3D {
  constructor () {
    super();

    const geometry = new ChunkyHull();
    const material = new THREE.MeshBasicMaterial({ color: 'pink', side: THREE.DoubleSide });
    const mesh = new Mesh2D(geometry, material);
    this.mesh = mesh;
    this.add(mesh);
  }

  update (time, dt) {
    this.mesh.position.x = Math.sin(time * 0.5);
    this.mesh.position.y = Math.cos(time * 0.25 * Math.cos(time)) * 0.5;
    this.mesh.rotation.z = Math.sin(Math.cos(time * 0.05)) * 2;
  }
};
