uniform float frame;
uniform float time;

#pragma glslify: PI = require('glsl-pi');
#pragma glslify: noise = require('glsl-noise/simplex/4d');

vec2 motion (vec2 position, vec2 normal) {
  vec2 ret = position;

  float frameSpeed = frame;

  // high freq first
  float frequency = 100.0;
  float n = noise(vec4(position.xy * frequency, 0.0, frame));
  float amplitude = 0.015;
  ret += normal * n * amplitude;

  // now low freq
  frequency = 3.0;
  n = noise(vec4(position.xy * frequency, 0.0, frame));
  amplitude = 0.025;
  ret += normal * n * amplitude;

  // float noiseRadius = 0.35;
  // float noiseScale = 2.0;
  // float t = frame;
  // float angle = PI * 2.0 * t;
  // vec2 circ = vec2(cos(angle), sin(angle));
  // n = noise(vec4(position.xy * noiseScale, circ * noiseRadius));
  // amplitude = 0.04;
  // ret += normal * n * amplitude;

  // ret.x += sin(time);
  return ret;
}

void main () {
  vec2 normal = normalize(position.xy);
  vec2 pos = motion(position.xy, normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xy, 0.0, 1.0);
}