
#pragma glslify: PI = require('glsl-pi');
#pragma glslify: noise = require('glsl-noise/simplex/4d');

vec2 motion (vec2 position, vec2 normal, float time, float randomOffset) {
  vec2 ret = vec2(0.0);
  float amplitudeScale = 2.0;

  // high freq first
  float frequency = mix(250.0, 4500.0, randomOffset);
  float n = 0.0;
  float amplitude = 0.0;

  #ifdef HIGH_FREQ_MOTION
  n = noise(vec4(position.xy * frequency, randomOffset, randomOffset + time));
  amplitude = mix(0.0075, 0.0075 * 2.0, randomOffset);
  ret += normal * n * amplitude * amplitudeScale;
  #endif

  // now low freq
  float timeScaled = mix(0.5, 1.0, randomOffset) * time;
  frequency = mix(0.1, 2.0, randomOffset);
  n = noise(vec4(position.xy * frequency, randomOffset, randomOffset + timeScaled));
  amplitude = 0.025;
  ret += normal * n * amplitude * amplitudeScale;

  return ret;
}

#pragma glslify: export(motion);