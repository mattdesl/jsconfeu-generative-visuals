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
varying vec2 noiseValues;

#pragma glslify: PI = require('glsl-pi');
#pragma glslify: noise = require('glsl-noise/simplex/4d');

vec2 motion (vec2 position, vec2 normal) {
  vec2 ret = position;
  float timeScaled = 0.25 * time;

  // high freq first
  float frequency = 1000.0;
  float n = noise(vec4(position.xy * frequency, randomOffset, randomOffset + time));
  float amplitude = 0.0075;
  noiseValues.x = n;
  ret += normal * n * amplitude;

  // now low freq
  frequency = 3.0;
  n = noise(vec4(position.xy * frequency, randomOffset, randomOffset + timeScaled));
  noiseValues.y = n;
  amplitude = 0.025;
  ret += normal * n * amplitude;

  float targetDistance = 1.0;
  vec2 target = centroid + direction * targetDistance;
  vec2 dirToTarget = ret - target;

  ret = mix(centroid, ret, animate);

  return ret;
}

void main () {
  vec2 normal = normalize(position.xy);
  vec2 pos = motion(position.xy, normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xy, 0.0, 1.0);
  vPosition = pos;
  vUv = uv;
}