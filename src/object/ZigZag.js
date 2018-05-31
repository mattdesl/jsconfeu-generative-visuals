const anime = require('animejs');
const normalizePath = require('normalize-path-scale');
const newArray = require('new-array');
const BaseObject = require('./BaseObject');
const defined = require('defined');
const { MeshLine, MeshLineMaterial } = require('three.meshline');
const RND = require('../util/random');

const SVG_PATH =
  'M386.4,306.3 C386.4,353.3 367.9,385.6 345.6,385.6 C323.3,385.6 305.2,360.7 305.2,329.9 L305.2,306.3 C305.2,275.5 292.1,250.6 269.8,250.6 C247.5,250.6 234.5,275.5 234.5,306.3 L234.5,329.9 C234.5,360.7 209.5,385.6 187.2,385.6 C164.9,385.6 146.8,360.7 146.8,329.9 L146.8,306.2 C146.8,275.4 128.8,250.5 106.5,250.5 C84.2,250.5 73.1,275.4 73.2,306.2 L73.2,329.8 C73.2,360.5 55.1,377.5 32.9,377.5 C10.6,377.5 -7.5,360.6 -7.5,329.8 L-7.5,306.1 C-7.5,275.4 -25.6,250.5 -47.9,250.5 C-70.2,250.5 -95.2,275.4 -95.2,306.2 L-95.2,329.8 C-95.1,360.6 -108.2,377.5 -130.5,377.5 C-152.8,377.5 -168.8,360.5 -168.8,329.8 L-168.8,306.1 C-169,275.3 -187,250.4 -209.3,250.4 C-231.6,250.4 -249.6,275.3 -249.6,306.1';

function makePath(svgData) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttributeNS(null, 'd', svgData);

  return path;
}

module.exports = class ZigZag extends BaseObject {
  constructor(app, opt = {}) {
    super(app);

    this.app = app;
    const path = makePath(SVG_PATH);

    const pathSampleCount = defined(opt.segments, 200);
    const pathPoints = normalizePath(
      newArray(pathSampleCount).map((_, i) => {
        const point = path.getPointAtLength((i / pathSampleCount) * path.getTotalLength());
        return [point.x, point.y];
      })
    );
    this.pathPoints = pathPoints;

    this.speed = defined(opt.speed, 0.5);
    this.zigZagIdx = 0;
    this.headPos = new THREE.Vector2();
    this.tailPos = new THREE.Vector2();

    this.line = new MeshLine();
    this.line.setGeometry(this.getLineGeometry(this.zigZagIdx));

    const color = defined(opt.color, { r: 0, g: 0, b: 0 });
    this.color = color;

    const material = new MeshLineMaterial({
      resolution: new THREE.Vector2(app.width, app.height),
      color,
      lineWidth: defined(opt.lineWidth, 0.04)
    });
    material.depthTest = false;
    material.depthWrite = false;
    material.transparent = true; // for layering

    this.mesh = new THREE.Mesh(this.line.geometry, material);
    this.mesh.frustumCulled = false;

    this.add(this.mesh);
  }

  destroy() {
    this.mesh.geometry.dispose();
  }

  randomize(opt = {}) {
    if (this.lineWidthAnimation) this.lineWidthAnimation.pause();
    if (this.colorAnimation) this.colorAnimation.pause();
    if (opt.color) {
      this.color = opt.color;
      this.mesh.material.uniforms.color.value = opt.color;
    }
    if (typeof opt.lineWidth === 'number') this.mesh.material.uniforms.lineWidth.value = opt.lineWidth;
    this.delay = opt.delay || 0;
    this.initTime = undefined;
    if (opt.speed) this.speed = opt.speed;

    this.mesh.material.uniforms.resolution.value.x = this.app.width;
    this.mesh.material.uniforms.resolution.value.y = this.app.height;
  }

  transitionColor(color) {
    if (this.colorAnimation) this.colorAnimation.pause();

    this.colorAnimation = anime({
      targets: this.color,
      r: color.r,
      g: color.g,
      b: color.b,
      easing: 'linear',
      duration: 1000
    });
  }

  animateOut() {
    if (this.lineWidthAnimation) this.lineWidthAnimation.pause();
    this.lineWidthAnimation = anime({
      targets: this.mesh.material.uniforms.lineWidth,
      value: 0,
      easing: 'easeOutExpo',
      duration: 2000
    });
  }

  reset() {
    this.headPos = new THREE.Vector2();
    this.tailPos = new THREE.Vector2();
    this.zigZagIdx = 0;
    this.line.setGeometry(this.getLineGeometry(this.zigZagIdx));
  }

  getLineGeometry(idx) {
    const geometry = new THREE.Geometry();

    this.getZigZagPoints(idx).forEach(v => geometry.vertices.push(v));

    this.headPos.x = geometry.vertices[0].x;
    this.headPos.y = geometry.vertices[0].y;

    this.tailPos.x = geometry.vertices[geometry.vertices.length - 1].x;
    this.tailPos.y = geometry.vertices[geometry.vertices.length - 1].y;

    return geometry;
  }

  getZigZagPoints(idx) {
    const zigZagPoints = this.pathPoints.map((_, i) => {
      const finalIdx = Math.floor(i + idx) % this.pathPoints.length;
      const finalPoint = this.pathPoints[finalIdx];
      const xOffset = Math.floor((i + idx) / this.pathPoints.length) * 2;
      const yOffset = 0;

      return new THREE.Vector3(finalPoint[0] - xOffset, finalPoint[1] + yOffset, 0);
    });

    return zigZagPoints;
  }

  update(time) {
    if (!this.initTime) this.initTime = time;
    if (time - this.initTime < this.delay) return;

    this.zigZagIdx += this.speed;
    this.line.setGeometry(this.getLineGeometry(this.zigZagIdx));
  }
};
