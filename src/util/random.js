// a utility for random number generation
const seedRandom = require('seed-random');
const SimplexNoise = require('simplex-noise');

class Rand {
  constructor (defaultSeed = null, opt = {}) {
    this.defaultRandom = Math.random;
    this.quiet = opt.quiet;
    this.setSeed(defaultSeed);
  }

  setSeed (seed) {
    if (typeof seed === 'number' || typeof seed === 'string') {
      if (!this.quiet) console.log('Random Seed:', seed);
      this.seed = String(seed);
      this.random = seedRandom(this.seed);
    } else {
      this.seed = null;
      this.random = this.defaultRandom;
    }
    this.simplex = new SimplexNoise(this.random);
  }

  gauss () {
    return Math.sqrt(-2.0 * Math.log(this.random())) * Math.cos(2.0 * Math.PI * this.random());
  }

  getSeed () {
    return this.seed;
  }

  noise2D (x, y) {
    return this.simplex.noise2D(x, y);
  }

  noise3D (x, y, z) {
    return this.simplex.noise3D(x, y, z);
  }

  noise4D (x, y, z, w) {
    return this.simplex.noise4D(x, y, z, w);
  }

  randomSign () {
    return this.randomBoolean() ? 1 : -1;
  }

  randomBoolean () {
    return this.random() > 0.5;
  }

  randomFloat (min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new TypeError('Expected all arguments to be numbers');
    }

    return this.random() * (max - min) + min;
  }

  randomInt (min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new TypeError('Expected all arguments to be numbers');
    }

    return Math.floor(this.randomFloat(min, max));
  }

  shuffle (arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError('Expected Array, got ' + typeof arr);
    }

    var rand;
    var tmp;
    var len = arr.length;
    var ret = arr.slice();
    while (len) {
      rand = Math.floor(this.random() * len--);
      tmp = ret[len];
      ret[len] = ret[rand];
      ret[rand] = tmp;
    }
    return ret;
  }

  randomCircle (out, scale = 1) {
    var r = this.random() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
    return out;
  }

  randomSphere (out, scale = 1) {
    var r = this.random() * 2.0 * Math.PI;
    var z = (this.random() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0 - z * z) * scale;
    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
  }

  randomHemisphere (out, scale = 1) {
    var r = this.random() * 1.0 * Math.PI;
    var z = (this.random() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0 - z * z) * scale;
    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
  }

  randomQuaternion (out) {
    const u1 = this.random();
    const u2 = this.random();
    const u3 = this.random();

    const sq1 = Math.sqrt(1 - u1);
    const sq2 = Math.sqrt(u1);

    const theta1 = Math.PI * 2 * u2;
    const theta2 = Math.PI * 2 * u3;

    const x = Math.sin(theta1) * sq1;
    const y = Math.cos(theta1) * sq1;
    const z = Math.sin(theta2) * sq2;
    const w = Math.cos(theta2) * sq2;
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  }

  weighted (set) {
    if (set.length === 0) return null;
    return set[this.weightedIndex(set)].value;
  }

  weightedIndex (set) {
    if (set.length === 0) return -1;
    return this.weightedRandom(set.map(s => s.weight));
  }

  weightedRandom (weights) {
    if (weights.length === 0) return -1;
    let totalWeight = 0;

    for (let i = 0; i < weights.length; i++) {
      totalWeight += weights[i];
    }

    if (totalWeight <= 0) throw new Error('Weights must sum to > 0');

    let random = this.random() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        return i;
      }
      random -= weights[i];
    }
    return 0;
  }
}

// const initialSeed = getRandomSeed()
const initialSeed = '13'; // '42785'; // '86475' // 31144
module.exports = new Rand(initialSeed);
//8
module.exports.createInstance = (seed, opt) => new Rand(seed, opt);
module.exports.getRandomSeed = getRandomSeed;

function getRandomSeed () {
  const seed = String(Math.floor(Math.random() * 100000));
  return seed;
}
