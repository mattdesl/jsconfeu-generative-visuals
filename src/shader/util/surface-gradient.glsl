#pragma glslify: random = require('glsl-random');
#pragma glslify: PI = require('glsl-pi');

vec2 rotateAround (vec2 vec, vec2 center, float angle) {
  float c = cos( angle );
  float s = sin( angle );

  float x = vec.x - center.x;
  float y = vec.y - center.y;

  vec2 outVec;
  outVec.x = x * c - y * s + center.x;
  outVec.y = x * s + y * c + center.y;
  return outVec;
}

float linearGradient (vec2 uv, vec2 start, vec2 end) {
  vec2 gradientDirection = end - start;
  float gradientLenSq = dot(gradientDirection, gradientDirection);
  vec2 relCoords = uv - start;
  float t = dot(relCoords, gradientDirection);
  if (gradientLenSq != 0.0) t /= gradientLenSq;
  return t;
}

vec3 gradientNoise (vec3 fragColor, vec2 uv, float time, float randomOffset) {
  vec2 vRot = rotateAround(uv - 0.5, vec2(0.0), time);

  float angle = randomOffset * PI * 2.0 + time * 0.05;
  float radius = 0.5;
  vec2 direction = vec2(cos(angle), sin(angle));
  vec2 start = 0.5 + direction * -radius;
  vec2 end = 0.5 + direction * radius;
  float gradient = linearGradient(uv, start, end);

  // vec2 vNorm = vRot - 0.5;
  float center = length(uv - 0.5);
  float rnd = random(vec2(gl_FragCoord.x + randomOffset + time * 0.0009, gl_FragCoord.y));
  return mix(fragColor, fragColor * 1.2, gradient * step(0.2, rnd));
}

#pragma glslify: export(gradientNoise);