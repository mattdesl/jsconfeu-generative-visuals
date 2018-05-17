const load = require('load-asset');

module.exports = function(opt = {}) {
  const renderer = opt.renderer;

  const textureResolution = 512; // 512 or 1024
  const tileFiles = ['bigdot', 'contours', 'funkygerms', 'leppard', 'littlesticks', 'smalldot', 'worms'].map(f => {
    return {
      url: `assets/image/tile/${f}_${textureResolution}_.png`,
      type: loadTextureType,
      settings: {
        minFilter: THREE.LinearFilter,
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        generateMipmaps: false
      }
    };
  });

  return load.any(
    {
      tiles: load.any(tileFiles)
      // Can add other named assets here
      // e.g.
      // image: 'foo.png',
      // texture: { url: 'blah.png', type: loadTextureType }
    },
    ev => {
      console.log(`[assets] Progress: ${ev.progress}`);
    }
  );

  function loadTextureType(ev) {
    return load({ ...ev, type: 'image' }).then(image => {
      const texture = new THREE.Texture(image);
      Object.assign(texture, ev.settings || {});
      texture.needsUpdate = true;
      if (renderer) renderer.setTexture2D(texture, 0);
      return texture;
    });
  }
};
