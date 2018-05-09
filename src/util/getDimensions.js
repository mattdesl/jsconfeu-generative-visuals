module.exports = function getDimensions (point) {
  if (point.isVector4) return 4;
  if (point.isVector3) return 3;
  if (point.isVector2) return 2;
  return point.length;
};
