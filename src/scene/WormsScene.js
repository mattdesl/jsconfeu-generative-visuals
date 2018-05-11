const WORMS = require("../assets/worms.json");
const Worm = require("../object/Worm");

module.exports = class WormScene extends THREE.Object3D {
  constructor() {
    super();

    this.meshes = [];

    for (let i = 0; i < WORMS.length; i++) {
      const mesh = new Worm(WORMS[i], {
        wiggleSpeed: Math.random() * 6 + 2,
        wiggleAmplitude: Math.random() * 0.4,
        wigglePosMod: Math.random() * 2 + 1
      });

      mesh.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, 0);

      this.add(mesh);
      this.meshes.push(mesh);
    }
  }

  update(time, dt) {}

  frame(frame, time) {
    for (let i = 0; i < this.meshes; i++) {
      this.meshes[i].material.uniforms.frame.value = time;
    }
  }
};
