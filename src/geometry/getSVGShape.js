const svgMesh3d = require('svg-mesh-3d');
const SVG_SHAPES = require('../assets/svg-shapes.json');
const cache = {};

module.exports = function (key) {
  if (key in cache) return cache[key];
  const svgPath = SVG_SHAPES[key];

  // tweak these numbers to taste, for simplifcation and curve rounding
  const complex = svgMesh3d(svgPath, { simplify: 0.5, randomization: 0, scale: 2 });
  const result = {
    positions: complex.positions.map(([x, y]) => {
      return new THREE.Vector2(x, y);
    }),
    cells: complex.cells
  };

  cache[key] = result;
  return result;
};
