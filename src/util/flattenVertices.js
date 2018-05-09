const getDimensions = require('./getDimensions');

module.exports = function flattenVertices (points, outputArray) {
  if (!points || points.length === 0) return [];
  const dimensions = getDimensions(points[0]);
  const output = outputArray || new Array(points.length * dimensions);
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    point.toArray(output, i * dimensions);
  }
  return output;
};
