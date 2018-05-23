const RND = require('../util/random');
const clamp = require('clamp');

const getColor = colorStyle => {
  const color = new THREE.Color().set(colorStyle);
  const hOff = RND.randomFloat(-1, 1) * (2 / 360);
  const sOff = RND.randomFloat(-1, 1) * 0.01;
  const lOff = RND.randomFloat(-1, 1) * 0.025;
  color.offsetHSL(hOff, sOff, lOff);
  color.r = clamp(color.r, 0, 1);
  color.g = clamp(color.g, 0, 1);
  color.b = clamp(color.b, 0, 1);
  return color;
};

module.exports = function (colors) {
  const palette = colors[RND.randomInt(colors.length)];
  const color = getColor(palette);
  const altPalette = RND.shuffle(colors).find(c => c !== palette);
  const altColor = getColor(altPalette);
  return { color, altColor };
}