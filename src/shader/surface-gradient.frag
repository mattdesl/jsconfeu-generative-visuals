uniform float time;
uniform float frame;
uniform float opacity;
uniform vec3 color;
uniform float randomOffset;

varying vec2 vUv;
varying vec2 vPosition;
varying float vSize;

#pragma glslify: gradient = require('./util/surface-gradient.glsl');

void main () {
  vec3 fragColor = color;
  fragColor = gradient(fragColor, vUv, frame, randomOffset);
  gl_FragColor = vec4(fragColor, opacity);
}