const anime = require('animejs');

module.exports = function (api) {
  const container = document.querySelector('.canvas-text-container');
  const textEl = document.querySelector('.canvas-text');

  const texts = [
    { preset: 'intro0', text: 'SinnerSchrader, Greenkeeper, Cobot & The AMP Project present' },
    { preset: 'intro1', text: 'A JSConf International production' },
    { preset: 'intro2', text: 'In cooperation with wwwtf.berlin' },
    { preset: 'intro3', text: 'And supported by the Chrome team' },
    { preset: 'intro4', text: 'Live.js Network' },
    { preset: 'intro5', text: 'Nested Loops' },
    { preset: 'intro6', text: 'Curated by Feli, Holger, Jan, Malte, Megan & Simone' },
    { preset: 'default', text: 'Welcome to JSConf EU 2018' }
  ];

  let index = 0;

  function next (opt = {}) {
    const { delay = 0 } = opt;
    const item = texts[index];
    const nextItem = (index < texts.length - 1) ? texts[index + 1] : null;
    textEl.textContent = item.text;
    textEl.style.opacity = '0';
    textEl.style.color = api.getPresets()[item.preset].foreground;
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
        delay: 1000,
        begin: () => {
          if (nextItem) {
            setTimeout(() => {
              api.transitionToPreset(nextItem.preset);
            }, 1750);
          }
        },
        duration: 2000,
        easing: 'easeInQuad'
      }).finished.then(() => {
        index++;
        if (index > texts.length - 1) {
          console.log('finished');
          setTimeout(() => {
            api.fadeOut();
          });
        } else {
          next({ delay: 1000 });
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
