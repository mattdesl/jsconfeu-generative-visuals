uniform float frame;

uniform float wiggleAmplitude;
uniform float wiggleSpeed;
uniform float wigglePosMod;

vec2 wiggle(vec2 position) {
  position.x += (sin(frame * wiggleSpeed) * cos(position.y * wigglePosMod)) * wiggleAmplitude;

  return position;
}

void main() {
  vec2 pos = wiggle(position.xy);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
}
