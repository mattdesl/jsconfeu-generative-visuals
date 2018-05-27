const PolygonOffset = require('polygon-offset');
const stroke = require('extrude-polyline');

module.exports = function (vectors, opts = {}) {
  const { thickness = 0.05 } = opts;
  const points = vectors.map(p => p.toArray());
  if (!vectors[0].equals(vectors[vectors.length - 1])) {
    points.push(points[0]);
  }
  return stroke({
    thickness,
    cap: 'square',
    join: 'bevel',
    miterLimit: 10
  }).build(points);
  // const offset = new PolygonOffset();
  // const stroke = offset.data(p).offsetLine(0.5);
  // if (stroke.length !== 1) {
  //   return false;
  // }
  // const outline = stroke[0];
  
}

require('extrude-polyline')({ 
  thickness: 20, 
  cap: 'square',
  join: 'bevel',
  miterLimit: 10
})
