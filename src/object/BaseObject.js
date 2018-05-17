module.exports = class BaseObject extends THREE.Object3D {
  constructor (app) {
    super();

    // the app state that holds width/height etc
    this.app = app;

    // Whether the mesh is currently part of the scene or not
    this.active = false;
  }

  // For subclasses to implement...

  randomize () {
  }

  setAnimation (value) {
  }

  update (time, dt) {
  }

  frame (frame, time) {
  }
};
