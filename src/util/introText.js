const anime = require('animejs');

module.exports = function () {
  const container = document.querySelector('.canvas-text-container');
  const textEl = document.querySelector('.canvas-text');
  
  const texts = [
    "SinnerSchrader, Greenkeeper, Cobot & The AMP Project present",
    "A JSConf International production",
    "In cooperation with wwwtf.berlin",
    "And supported by the Chrome team",
    "Live.js Network",
    "Nested Loops",
    "Curated by Feli, Holger, Jan, Malte, Megan & Simone",
    "Welcome to JSConf EU 2018"
  ]

  let index = 0;

  function next (opt = {}) {
    const { delay = 0 } = opt;
    textEl.textContent = texts[index];
    textEl.style.opacity = '0';
    anime.timeline()
      .add({
        targets: textEl,
        opacity: [0, 1],
        delay,
        duration: 3000,
        easing: 'easeOutQuad'
      })
      .add({
        targets: textEl,
        opacity: 0,
        duration: 2000,
        easing: 'easeInQuad'
      }).finished.then(() => {
        index++;
        if (index > texts.length - 1) {
          console.log('finished');
        } else {
          next({ delay: 500 });
        }
      });
    
  }

  index = 0;
  next();

  // var basicTimeline = anime.timeline();
  // basicTimeline
  //   .add({
  //     targets: '#basicTimeline .square.el',
  //     translateX: 250,
  //     easing: 'easeOutExpo'
  //   })
  //   .add({
  //     targets: '#basicTimeline .circle.el',
  //     translateX: 250,
  //     easing: 'easeOutExpo'
  //   })
  //   .add({
  //     targets: '#basicTimeline .triangle.el',
  //     translateX: 250,
  //     easing: 'easeOutExpo'
  //   });
};
