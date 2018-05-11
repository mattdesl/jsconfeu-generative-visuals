uniform float frame;

vec2 wiggle(vec2 position) {
  position.x += (sin(frame * 10.0) * cos(position.y * 2.0)) * 0.2;

  return position;
}

void main() {
  vec2 pos = wiggle(position.xy);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
}
