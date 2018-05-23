attribute float random;

uniform float frame;
uniform float time;
uniform float animate;
uniform vec2 centroid;
uniform vec2 direction;
uniform float randomOffset;

varying vec2 vPosition;
varying float vSize;
varying vec2 vUv;
varying float vRandom;

#pragma glslify: motion = require('./util/motion.glsl');

void main () {
  vec2 normal = normalize(position.xy);
  vec2 pos = position.xy + motion(position.xy, normal, time, randomOffset);

  // Scaling effect: this needs to be re-considered into something more interesting
  // pos = mix(centroid, pos, animate);

  vec4 modelViewPos = modelViewMatrix * vec4(pos.xy, 0.0, 1.0);
  gl_Position = projectionMatrix * modelViewPos;
  vUv = uv;
  vRandom = random;
  vPosition = pos;
}