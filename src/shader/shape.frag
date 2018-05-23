uniform float time;
uniform float frame;
uniform float opacity;
uniform vec3 color;
uniform vec3 altColor;
uniform float randomOffset;
uniform sampler2D map;
uniform sampler2D maskMap;

uniform vec2 mapResolution;
uniform vec2 maskMapResolution;
uniform vec2 shapeResolution;
uniform vec2 resolution;
uniform float animate;
uniform vec2 centroid;
uniform vec2 mapOffset;
uniform bool mapMask;
uniform float mapScale;

varying float vRandom;
varying vec2 vUv;
varying vec2 vPosition;
varying float vSize;

#pragma glslify: noise = require('glsl-noise/classic/3d');
#pragma glslify: backgroundUV = require('./util/background.glsl');
#pragma glslify: aastep = require('glsl-aastep');

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

  vec2 bgUV = vUv * 2.0 - 1.0;
  float shapeAspect = shapeResolution.x / shapeResolution.y;
  if (shapeResolution.x > shapeResolution.y) {
    bgUV *= shapeAspect;
  } else {
    bgUV /= shapeAspect;
  }
  // float d = texture2D(maskMap, bgUV * 0.5 + 0.5).r;


  if (animate < 1.0) {
    vec2 maskUVPos = vPosition;
    maskUVPos += centroid;
    vec2 maskUV = maskUVPos * 1.25;
    maskUV.y += time * -0.1 * randomOffset;
    maskUV.x += time * -0.05;
    maskUV += mapOffset;

    // float centDist = (distance(vPosition, centroid));
    float n = 0.0;
    n += noise(vec3(vUv * mix(1.0, 2.0, animate), randomOffset));
    n = n * 0.5 + 0.5;
    float sdf = texture2D(maskMap, maskUV).a * n;
    float d = aastep(0.5 * (1.0 - animate), sdf);
    gl_FragColor.a *= d;


    // #ifdef NOISE_ANIMATION
    // float n = 0.0;
    // n += noise(vec3(vPosition * mapScale * mix(4.0, 2.0, animate), randomOffset));
    // float anim = aastep(1.0 - animate, n * 0.5 + 0.5);
    // gl_FragColor.a *= anim;
    // #endif
  }
}