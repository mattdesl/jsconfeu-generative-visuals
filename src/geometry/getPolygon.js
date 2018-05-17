const defined = require('defined');
const RND = require('../util/random');

module.exports = (opt = {}) => {
  const steps = defined(opt.sides, 3);
  const points = [];
  const jitter = opt.jitter !== false;
  const jitterAmount = defined(opt.jitterAmount, 0.25);
  const radianJitter = defined(opt.radianJitter, 0.01);
  for (let i = 0; i < steps; i++) {
    let angle = i / steps * Math.PI * 2;
    if (jitter) {
      angle += Math.PI * 2 * RND.randomFloat(-1, 1) * radianJitter;
    }
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const vec = new THREE.Vector2(x, y);

    if (jitter) {
      const r = RND.randomFloat(0, 1) * jitterAmount;
      const off = new THREE.Vector2().fromArray(RND.randomCircle([], r));
      vec.add(off);
    }

    points.push(vec);
  }
  return points;
};