const defined = require('defined');
const query = require('../util/query');
const debug = query.debug;
let geom;

const circleGeom = () => {
  if (geom) return geom;
  geom = new THREE.CircleGeometry(1, 64);
  return geom;
};

module.exports = function (opt = {}) {
  const obj = {
    center: opt.center || new THREE.Vector2(),
    radius: defined(opt.radius, 1),
    update,
    sphere: new THREE.Sphere(),
    mesh: null
  };

  obj.getWorldSphere = (target) => {
    obj.sphere.center.set(
      obj.center.x,
      obj.center.y,
      0
    );
    obj.sphere.radius = obj.radius;
    target.updateMatrixWorld();
    return obj.sphere.applyMatrix4(target.matrixWorld);
  };

  if (debug) {
    obj.mesh = new THREE.Mesh(
      circleGeom(),
      new THREE.MeshBasicMaterial({
        depthTest: false,
        depthWrite: false,
        transparent: true,
        wireframe: true,
        side: THREE.DoubleSide,
        color: 'cyan'
      })
    );
  }

  return obj;

  function update () {
    if (obj.mesh) {
      obj.mesh.position.x = obj.center.x;
      obj.mesh.position.y = obj.center.y;
      obj.mesh.scale.setScalar(obj.radius);
    }
  }
};
