uniform float time;
uniform float frame;
uniform float opacity;
uniform vec3 color;
uniform vec3 altColor;
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
varying float vSize;

void main () {
  gl_FragColor = vec4(color, opacity);

  float pattern;
  vec2 uvPos = vPosition;
  if (!mapMask) uvPos += centroid;
  vec2 patternUV = uvPos * mapScale;
  patternUV.y += time * 0.1 * randomOffset;
  patternUV.x += time * 0.05;
  patternUV += mapOffset;

  #if defined(HAS_TEXTURE_PATTERN)
    pattern = texture2D(map, patternUV).r;
  #elif defined(HAS_SHADER_PATTERN)
    // Here we could do custom shader patterns
    // The different types of shader patterns (stripe, whatever)
    // should be chosen with a uniform I guess?
    pattern = step(0.5, fract(patternUV.x * 6.0));
  #endif

  
  #if defined(HAS_TEXTURE_PATTERN) || defined(HAS_SHADER_PATTERN)
    #if defined(HAS_FILL)
      gl_FragColor.rgb = mix(color, altColor, pattern);
    #else
      gl_FragColor.a *= pattern;
    #endif
  #endif


  // gl_FragColor = vec4(fragColor, opacity);
}