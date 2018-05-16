uniform float time;
uniform float frame;
uniform float opacity;
uniform vec3 color;
uniform float randomOffset;
uniform sampler2D map;
uniform vec2 mapResolution;
uniform vec2 resolution;
uniform vec2 centroid;
uniform vec2 mapOffset;
uniform bool mapMask;
uniform float mapScale;

varying vec2 vUv;
varying vec2 vPosition;
varying vec2 noiseValues;
varying float vSize;

#pragma glslify: backgroundUV = require('./util/background.glsl');

void main () {
  vec2 uvPos = vPosition;
  if (!mapMask) uvPos += centroid;
  vec2 uv = uvPos * mapScale;
  uv.y += time * 0.1 * randomOffset;
  uv.x += time * 0.05;
  uv += mapOffset;
  vec4 texColor = texture2D(map, uv);
  vec3 fragColor = color;
  gl_FragColor = vec4(fragColor, texColor.r * opacity);
}