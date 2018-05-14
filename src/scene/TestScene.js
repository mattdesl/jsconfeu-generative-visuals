const SimpleBlob = require('../object/SimpleBlob');
const RND = require('../util/random');
const clamp = require('clamp');
const newArray = require('new-array');
const anime = require('animejs');

module.exports = class TestScene extends THREE.Object3D {
  constructor (app) {
    super();
    this.app = app;

    const colors = [
      '#313F61',
      '#DF1378',
      '#0C2AD9',
      '#FEC3BE',
      '#DDE4F0',
      '#7A899C'
    ].map(c => new THREE.Color(c));

    const pool = newArray(100).map(() => {
      const mesh = new SimpleBlob();
      mesh.visible = false;
      this.add(mesh);
      return mesh;
    });

    const getRandomPosition = () => {
      const edges = [
        [ new THREE.Vector2(-1, -1), new THREE.Vector2(1, -1) ],
        [ new THREE.Vector2(1, -1), new THREE.Vector2(1, 1) ],
        [ new THREE.Vector2(1, 1), new THREE.Vector2(-1, 1) ],
        [ new THREE.Vector2(-1, 1), new THREE.Vector2(-1, -1) ]
      ];
      const edgeIndex = RND.randomInt(edges.length);
      const isTopOrBottom = edgeIndex === 0 || edgeIndex === 2;
      const edge = edges[edgeIndex];
      const t = isTopOrBottom
        ? (RND.randomBoolean() ? RND.randomFloat(0.0, 0.45) : RND.randomFloat(0.55, 1))
        : RND.randomFloat(0, 1);
      const vec = edge[0].clone().lerp(edge[1], t);
      vec.x *= RND.randomFloat(1.0, 1.2);
      vec.y *= RND.randomFloat(1.0, 2);
      vec.multiply(app.unitScale);
      return vec;
    };

    const next = () => {
      const mesh = pool.find(p => !p.visible);
      if (!mesh) return;

      const palette = colors[RND.randomInt(colors.length)];
      const color = mesh.fill.material.uniforms.color.value;
      color.copy(palette);
      const hOff = RND.randomFloat(-1, 1) * (2 / 360);
      const sOff = RND.randomFloat(-1, 1) * 0.01;
      const lOff = RND.randomFloat(-1, 1) * 0.025;
      color.offsetHSL(hOff, sOff, lOff);
      color.r = clamp(color.r, 0, 1);
      color.g = clamp(color.g, 0, 1);
      color.b = clamp(color.b, 0, 1);
      mesh.generate();

      const p = getRandomPosition();
      const scale = RND.randomFloat(0.5, 4);
      // p.y += scale * 0.5;
      mesh.scale.setScalar(scale);
      mesh.position.set(p.x, p.y, 0);
      mesh.visible = true;

      const other = mesh.position.clone();
      other.y *= -1;

      // const other = new THREE.Vector2().copy(mesh.position);
      // const randomDirection = new THREE.Vector2().copy(other).normalize();
      const randomDirection = new THREE.Vector2().fromArray(RND.randomCircle([], 1));
      const randomLength = RND.randomFloat(0.1, 5);
      randomDirection.y /= app.unitScale.x;

      other.addScaledVector(randomDirection, randomLength);
      console.count('emit');

      mesh.fill.material.visible = false;
      mesh.fill.material.uniforms.animate.value = 0;

      mesh.rotation.z = RND.randomFloat(-1, 1) * Math.PI * 2;
      const newAngle = mesh.rotation.z + RND.randomFloat(-1, 1) * Math.PI * 2 * 0.25;
      const startDelay = RND.randomFloat(0, 15000);
      anime({
        targets: mesh.fill.material.uniforms.animate,
        value: 1,
        easing: 'easeOutQuad',
        delay: startDelay,
        duration: 5000
      });
      anime({
        targets: mesh.rotation,
        z: newAngle,
        easing: 'easeOutQuad',
        delay: startDelay,
        duration: 10000
      });
      anime({
        targets: mesh.position,
        x: other.x,
        y: other.y,
        begin: () => {
          mesh.fill.material.visible = true;
        },
        easing: 'easeOutQuad',
        delay: startDelay,
        duration: RND.randomFloat(40000, 60000)
      }).finished.then(() => {
        anime({
          targets: mesh.fill.material.uniforms.animate,
          value: 0,
          complete: () => {
            mesh.visible = false;
            next();
          },
          easing: 'easeInExpo',
          delay: RND.randomFloat(100, 2000),
          duration: 2000
        });
      });
    };

    const nextParticles = () => {
      const emitCount = RND.randomInt(5, 6);
      for (let i = 0; i < emitCount; i++) {
        next();
      }
    };

    // const sphere = new THREE.Mesh(
    //   new THREE.CircleGeometry(1, 32),
    //   new THREE.MeshBasicMaterial({ color: 'red' })
    // );
    // this.add(sphere);
    // const start =
    // sphere.position.x = 1 * app.unitScale.x;
    // sphere.position.y = 0;

    // const nextTime = () => {
    //   setTimeout(() => {
    //     nextParticles();
    //     nextTime();
    //   }, RND.randomFloat(30000, 50000));
    // };
    for (let i = 0; i < 40; i++) {
      next();
    }
    // nextTime();
  }

  update (time, dt) {
  }
};
