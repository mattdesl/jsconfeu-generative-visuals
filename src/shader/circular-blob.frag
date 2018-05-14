uniform float time;
uniform float frame;
uniform float opacity;
uniform vec3 color;
uniform float randomOffset;

varying vec2 vUv;
varying vec2 vPosition;
varying vec2 noiseValues;
varying float vSize;
#pragma glslify: random = require('glsl-random');
#pragma glslify: PI = require('glsl-pi');

float Value4D( vec4 P )
{
    //  https://github.com/BrianSharpe/Wombat/blob/master/Value4D.glsl

    // establish our grid cell and unit position
    vec4 Pi = floor(P);
    vec4 Pf = P - Pi;

    // clamp the domain
    Pi = Pi - floor(Pi * ( 1.0 / 69.0 )) * 69.0;
    vec4 Pi_inc1 = step( Pi, vec4( 69.0 - 1.5 ) ) * ( Pi + 1.0 );

    // calculate the hash
    const vec4 OFFSET = vec4( 16.841230, 18.774548, 16.873274, 13.664607 );
    const vec4 SCALE = vec4( 0.102007, 0.114473, 0.139651, 0.084550 );
    Pi = ( Pi * SCALE ) + OFFSET;
    Pi_inc1 = ( Pi_inc1 * SCALE ) + OFFSET;
    Pi *= Pi;
    Pi_inc1 *= Pi_inc1;
    vec4 x0y0_x1y0_x0y1_x1y1 = vec4( Pi.x, Pi_inc1.x, Pi.x, Pi_inc1.x ) * vec4( Pi.yy, Pi_inc1.yy );
    vec4 z0w0_z1w0_z0w1_z1w1 = vec4( Pi.z, Pi_inc1.z, Pi.z, Pi_inc1.z ) * vec4( Pi.ww, Pi_inc1.ww ) * vec4( 1.0 / 56974.746094 );
    vec4 z0w0_hash = fract( x0y0_x1y0_x0y1_x1y1 * z0w0_z1w0_z0w1_z1w1.xxxx );
    vec4 z1w0_hash = fract( x0y0_x1y0_x0y1_x1y1 * z0w0_z1w0_z0w1_z1w1.yyyy );
    vec4 z0w1_hash = fract( x0y0_x1y0_x0y1_x1y1 * z0w0_z1w0_z0w1_z1w1.zzzz );
    vec4 z1w1_hash = fract( x0y0_x1y0_x0y1_x1y1 * z0w0_z1w0_z0w1_z1w1.wwww );

    //	blend the results and return
    vec4 blend = Pf * Pf * Pf * (Pf * (Pf * 6.0 - 15.0) + 10.0);
    vec4 res0 = z0w0_hash + ( z0w1_hash - z0w0_hash ) * blend.wwww;
    vec4 res1 = z1w0_hash + ( z1w1_hash - z1w0_hash ) * blend.wwww;
    res0 = res0 + ( res1 - res0 ) * blend.zzzz;
    blend.zw = vec2( 1.0 - blend.xy );
    return dot( res0, blend.zxzx * blend.wwyy );
}

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

float Value3D( vec3 P )
{
    //  https://github.com/BrianSharpe/Wombat/blob/master/Value3D.glsl
    // establish our grid cell and unit position
    vec3 Pi = floor(P);
    vec3 Pf = P - Pi;
    vec3 Pf_min1 = Pf - 1.0;

    // clamp the domain
    Pi.xyz = Pi.xyz - floor(Pi.xyz * ( 1.0 / 69.0 )) * 69.0;
    vec3 Pi_inc1 = step( Pi, vec3( 69.0 - 1.5 ) ) * ( Pi + 1.0 );

    // calculate the hash
    vec4 Pt = vec4( Pi.xy, Pi_inc1.xy ) + vec2( 50.0, 161.0 ).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec2 hash_mod = vec2( 1.0 / ( 635.298681 + vec2( Pi.z, Pi_inc1.z ) * 48.500388 ) );
    vec4 hash_lowz = fract( Pt * hash_mod.xxxx );
    vec4 hash_highz = fract( Pt * hash_mod.yyyy );

    //	blend the results and return
    vec3 blend = Pf * Pf * Pf * (Pf * (Pf * 6.0 - 15.0) + 10.0);
    vec4 res0 = mix( hash_lowz, hash_highz, blend.z );
    vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );
    return dot( res0, blend2.zxzx * blend2.wwyy );
}

float linearGradient (vec2 start, vec2 end) {
  vec2 gradientDirection = end - start;
  float gradientLenSq = dot(gradientDirection, gradientDirection);
  vec2 relCoords = vUv - start;
  float t = dot(relCoords, gradientDirection);
  if (gradientLenSq != 0.0) t /= gradientLenSq;
  return t;
}

void main () {
  vec3 fragColor = color;

  vec2 vRot = rotateAround(vUv - 0.5, vec2(0.0), time);

  // float noise = step(0.25, Value3D(vec3(vUv.xy * 250.0, 1.0 * frame)));

  float angle = randomOffset * PI * 2.0 + time * 0.05;
  float radius = 0.5;
  vec2 direction = vec2(cos(angle), sin(angle));
  vec2 start = 0.5 + direction * -radius;
  vec2 end = 0.5 + direction * radius;
  float gradient = linearGradient(start, end);

  // vec2 vNorm = vRot - 0.5;
  float center = length(vUv - 0.5);
  vec3 orig = fragColor;
  // fragColor += (1.0 - center) * 0.1;
  float rnd = random(vec2(gl_FragCoord.x + randomOffset + frame * 0.0005, gl_FragCoord.y));
  // fragColor = mix(fragColor, fragColor * 0.995, (1.0 - center));
  fragColor = mix(fragColor, orig * 1.2, gradient * step(0.2, rnd));
  // fragColor += 0.1 * step(0.05, rnd) * 0.5;
  // float gradient = (atan(vRot.y, vRot.x) + PI) / (PI * 2.0);
  // float gradient = (atan(vRot.y, vRot.x) + PI) / (2.0 * PI);
  // fragColor = vec3(gradient);
  // fragColor = mix(fragColor, fragColor * 0.95, smoothstep(0.45, 0.75, noise * center));
  // fragColor = mix(fragColor, fragColor * 1.15, gradient * (1.0 - noise));
  gl_FragColor = vec4(fragColor, opacity);
}