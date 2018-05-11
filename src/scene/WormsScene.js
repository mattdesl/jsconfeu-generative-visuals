const WORMS = require("../assets/worms.json");
const Worm = require("../object/Worm");
const boids = require("boids");

module.exports = class WormScene extends THREE.Object3D {
  constructor() {
    super();

    this.meshes = [];

    this.flock = boids({
      boids: WORMS.length,

      speedLimit: 0.005,
      // accelerationLimit: 0.01,
      separationForce: 0.2,
      alignmentForce: 0.2,
      cohesionForce: 0.2,

      separationDistance: 0.1,
      alignmentDistance: 0.2,
      cohesionDistance: 0.4,

      attractors: [
        // attract to center
        [0, 0, 2.0, -0.005],
        // atract away from forming a circle in the center
        [0, 0, 0.3, 0.02]
      ]
    });

    for (let i = 0; i < WORMS.length; i++) {
      const mesh = new Worm(WORMS[i], {
        wiggleSpeed: Math.random() * 6 + 2,
        wiggleAmplitude: Math.random() * 0.4,
        wigglePosMod: Math.random() * 2 + 1
      });

      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;

      // boids position setting
      this.flock.boids[i][0] = x;
      this.flock.boids[i][1] = y;

      this.add(mesh);
      this.meshes.push(mesh);
    }
  }

  update() {
    this.flock.tick();

    for (let i = 0; i < this.meshes.length; i++) {
      const px = this.meshes[i].position.x;
      const py = this.meshes[i].position.y;

      const x = this.flock.boids[i][0];
      const y = this.flock.boids[i][1];

      // FIXME: for this to make more sense, we would have to properly align all paths in worms.json
      const angle = Math.atan2(py - y, px - x);
      this.meshes[i].rotation.z = angle;

      this.meshes[i].position.set(x, y, 0);
    }
  }

  frame(frame, time) {
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].mesh.material.uniforms.frame.value = time;
    }
  }
};
