module.exports = function (circle, bbox) {
  const rx = bbox.min.x;
  const ry = bbox.min.y;
  const rw = bbox.max.x - bbox.min.x;
  const rh = bbox.max.y - bbox.min.y;

  const cx = circle.center.x;
  const cy = circle.center.y;
  const r = circle.radius;

  const dx = Math.abs(cx - rx - rw / 2);
  const xDist = rw / 2 + r;
  if (dx > xDist) return false;
  const dy = Math.abs(cy - ry - rh / 2);
  const yDist = rh / 2 + r;
  if (dy > yDist) return false;
  if (dx <= (rw / 2) || dy <= (rh / 2)) return true;
  const xCornerDist = dx - rw / 2;
  const yCornerDist = dy - rh / 2;
  const xCornerDistSq = xCornerDist * xCornerDist;
  const yCornerDistSq = yCornerDist * yCornerDist;
  const maxCornerDistSq = r * r;
  return xCornerDistSq + yCornerDistSq <= maxCornerDistSq;
};
