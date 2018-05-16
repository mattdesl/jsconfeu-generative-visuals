uniform float time;
uniform float frame;
uniform float opacity;
uniform vec3 color;
uniform float randomOffset;
uniform sampler2D map;

varying vec2 vUv;
varying vec2 vPosition;
varying vec2 noiseValues;
varying float vSize;

void main () {
  vec3 fragColor = color;
  gl_FragColor = vec4(fragColor, opacity);
}