const tmp = new THREE.Vector2(0, 0);

module.exports.resampleLineBySpacing = function (points, spacing = 1 , closed = false) {
  if (spacing <= 0) {
    throw new Error('Spacing must be positive and larger than 0');
  }
  let totalLength = 0;
  let curStep = 0;
  let lastPosition = points.length - 1;
  if (closed) {
    lastPosition++;
  }
  const result = [];
  for (let i = 0; i < lastPosition; i++) {
    const repeatNext = i === points.length - 1;
    const cur = points[i];
    const next = repeatNext ? points[0] : points[i + 1];
    const diff = tmp.copy(next).sub(cur);

    let curSegmentLength = diff.length();
    totalLength += curSegmentLength;

    while (curStep * spacing <= totalLength) {
      let curSample = curStep * spacing;
      let curLength = curSample - (totalLength - curSegmentLength);
      let relativeSample = curLength / curSegmentLength;
      result.push(cur.clone().lerp(next, relativeSample));
      curStep++;
    }
  }
  return result;
};

module.exports.getPolylinePerimeter = function (points, closed = false) {
  let perimeter = 0;
  let lastPosition = points.length - 1;
  for (let i = 0; i < lastPosition; i++) {
    perimeter += tmp.copy(points[i]).distanceTo(points[i + 1]);
  }
  if (closed && points.length > 1) {
    perimeter += tmp.copy(points[points.length - 1]).distanceTo(points[0]);
  }
  return perimeter;
};

module.exports.resampleLineByCount = function (points, count = 1 , closed = false) {
  if (count <= 0) return [];
  const perimeter = module.exports.getPolylinePerimeter(points, closed);
  return module.exports.resampleLineBySpacing(points, perimeter / count, closed);
};
