const path = require("path");
const CreateGeom = require("three-simplicial-complex")(THREE);
const glslify = require("glslify");
const makeShader = require("../util/makeShader");
const svgMesh3d = require("svg-mesh-3d");

const WORM_SVG_PATH =
  "M10.4790729,6.86455767 C10.8150729,8.98855767 10.2560729,10.6665577 9.13707289,12.3435577 C8.35507289,13.3495577 7.23707289,13.9085577 6.00707289,14.1325577 C4.32907289,14.1325577 3.06607289,11.8615577 2.22707289,9.47755767 C1.38807289,7.09255767 0.976072889,4.59455767 1.00107289,4.14055767 C1.08707289,1.05055767 5.00007289,0.491557668 6.78907289,1.38555767 C8.57807289,2.28055767 10.1440729,4.74055767 10.4790729,6.86455767";

module.exports = class WormScene extends THREE.Object3D {
  constructor() {
    super();

    const complex = svgMesh3d(WORM_SVG_PATH, { scale: 10 });
    const geom = new CreateGeom(complex);

    const material = makeShader({
      uniforms: {
        color: { value: new THREE.Color("#303F62") }
      },
      side: THREE.DoubleSide,
      vertexShader: glslify(path.resolve(__dirname, "../shader/worm.vert")),
      fragmentShader: glslify(path.resolve(__dirname, "../shader/worm.frag"))
    });

    const mesh = new THREE.Mesh(geom, material);
    mesh.scale.set(0.02, 0.02, 0.02);

    this.mesh = mesh;
    this.add(mesh);
  }

  update(time, dt) {}

  frame(frame, time) {
    this.mesh.material.uniforms.frame.value = time;
  }
};
