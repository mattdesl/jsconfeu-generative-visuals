const ZigZag = require('../object/ZigZag');

module.exports = class ZigZagScene extends THREE.Object3D {
  constructor(app) {
    super();
    this.app = app;

    // TODO: multiple zig-zags
    this.add(new ZigZag(app));
  }
};
