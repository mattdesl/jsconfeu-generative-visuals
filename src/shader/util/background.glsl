vec2 backgroundUV (vec2 uv, vec2 resolution, vec2 texResolution) {
  float tAspect = texResolution.x / texResolution.y;
  float pAspect = resolution.x / resolution.y;
  float pwidth = resolution.x;
  float pheight = resolution.y;
  
  float width = 0.0;
  float height = 0.0;  
  if (tAspect > pAspect) {
    height = pheight;
    width = height * tAspect; 
  } else {
    width = pwidth;
    height = width / tAspect;
  }
  float x = (pwidth - width) / 2.0;
  float y = (pheight - height) / 2.0;
  vec2 nUv = uv;
  nUv -= vec2(x, y) / resolution;
  nUv /= vec2(width, height) / resolution;
  return nUv;
}

#pragma glslify: export(backgroundUV)