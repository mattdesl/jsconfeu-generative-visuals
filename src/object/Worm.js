const CreateGeom = require("three-simplicial-complex")(THREE);
const defined = require("defined");
const glslify = require("glslify");
const makeShader = require("../util/makeShader");
const path = require("path");
const svgMesh3d = require("svg-mesh-3d");

module.exports = class Worm extends THREE.Object3D {
  constructor(wormSvgPath, opt = {}) {
    super();

    const complex = svgMesh3d(wormSvgPath, { scale: 1 });
    const geom = new CreateGeom(complex);

    const material = makeShader({
      uniforms: {
        wiggleAmplitude: { value: defined(opt.wiggleAmplitude, 0) },
        wiggleSpeed: { value: defined(opt.wiggleSpeed, 0) },
        wigglePosMod: { value: defined(opt.wigglePosMod, 0) },
        color: { value: new THREE.Color("#303F62") }
      },
      side: THREE.DoubleSide,
      vertexShader: glslify(path.resolve(__dirname, "../shader/worm.vert")),
      fragmentShader: glslify(path.resolve(__dirname, "../shader/worm.frag"))
    });

    const mesh = new THREE.Mesh(geom, material);
    mesh.scale.set(0.01, 0.01, 0.01);

    this.mesh = mesh;
    this.add(mesh);
  }

  update(time, dt) {}

  frame(frame, time) {
    this.mesh.material.uniforms.frame.value = time;
  }
};
