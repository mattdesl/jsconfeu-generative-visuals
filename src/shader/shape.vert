attribute float random;

uniform float frame;
uniform float time;
uniform float animate;
uniform vec2 centroid;
uniform vec2 direction;
uniform vec3 audioSignal;
uniform float randomOffset;

varying vec2 vPosition;
varying float vSize;
varying vec2 vUv;
varying float vRandom;

#pragma glslify: motion = require('./util/motion.glsl');
#pragma glslify: noise = require('glsl-noise/simplex/3d');

void main () {
  vec2 normal = normalize(position.xy);
  vec2 pos = position.xy + motion(position.xy, normal, time, randomOffset);

  // Scaling effect: this needs to be re-considered into something more interesting
  // pos = mix(centroid, pos, audioSignal);
  vec2 dir = normalize(pos - centroid);

  #ifdef HAS_AUDIO
  pos += dir * 0.25 * audioSignal.x;
  pos += dir * 0.15 * (noise(vec3(position.xy * 1.0, time * 0.1)) * 0.5 + 0.5) * audioSignal.y;
  #endif

  vec4 modelViewPos = modelViewMatrix * vec4(pos.xy, 0.0, 1.0);
  gl_Position = projectionMatrix * modelViewPos;
  vUv = uv;
  vRandom = random;
  vPosition = pos;
}