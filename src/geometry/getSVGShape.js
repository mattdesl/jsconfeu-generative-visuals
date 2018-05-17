const svgMesh3d = require('svg-mesh-3d');
const SVG_SHAPES = require('../assets/svg-shapes.json');

module.exports = function(key) {
  const svgPath = SVG_SHAPES[key];

  const complex = svgMesh3d(svgPath, { simplify: 1 });

  return complex.positions.map(([x, y]) => {
    return new THREE.Vector2(x, y);
  });
};
