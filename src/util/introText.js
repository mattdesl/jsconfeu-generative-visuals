const anime = require('animejs');
const lerp = require('lerp');
module.exports = function (api, params = {}) {
  const container = document.querySelector('.canvas-text-container');
  const textEl = document.querySelector('.canvas-text');

  const texts = [
    { preset: 'intro0', text: 'SinnerSchrader, Greenkeeper, Cobot & The AMP Project present' },
    { preset: 'intro1', text: 'A JSConf International production' },
    { preset: 'intro2', text: 'In cooperation with wwwtf.berlin' },
    { preset: 'intro3', text: 'And supported by the Chrome team' },
    { preset: 'intro4', text: '{ live: js } Network' },
    { preset: 'intro5', text: 'Nested Loops' },
    { preset: 'default', text: 'Curated by Feli, Holger, Jan, Malte, Megan & Simone' },
    { text: 'Welcome to JSConf EU 2018' }
  ];

  let index = 0;

  function removeChildren (node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function buildText (el, text) {
    const chunks = text.split(' ').map(str => {
      const span = document.createElement('div');
      span.className = 'text-chunk';
      span.textContent = `${str} `;
      return { element: span, text: str };
    });
    chunks.forEach(c => el.appendChild(c.element));
    return chunks;
  }

  function next (opt = {}) {
    const { delay = 0 } = opt;
    const item = texts[index];
    const curIndex = index;
    const nextItem = (index < texts.length - 1) ? texts[index + 1] : null;
    // textEl.textContent = item.text;
    // textEl.style.opacity = '0';
    
    if (item.preset) textEl.style.color = api.getPresets()[item.preset].foreground;
    removeChildren(textEl);
    const chunks = buildText(textEl, item.text);
    const spans = chunks.map(p => p.element);
    const updateClip = (el, val) => {
      // val = 1 - val;
      // el.style.clipPath = `inset(0 ${Math.min(100, Math.round(val * 100))}% 0 0)`;
    };
    spans.forEach(s => {
      s.style.opacity = '0';
      updateClip(s, 0);
      // s.style.transform = `translateY(-40px)`;
    });

    const stagger = 20;
    const delayFn = (el, i) => {
      return delay + i * stagger;
    };
    const delayFnOut = (el, i) => {
      return 0 + i * stagger;
    };
    const easeAnimIn = [ .08,1.41,.55,1.01];
    anime.timeline()
      .add({
        targets: spans,
        opacity: {
          value: [0, 1],
          delay: delayFn,
          duration: 1000,
          easing: 'easeOutQuad'
        },
        translateX: {
          value: [-15, 0],
          delay: delayFn,
          duration: 3000,
          easing: easeAnimIn
        },
        // skewY: {
        //   value: [-5, 0],
        //   delay: delayFn,
        //   duration: 1000,
        //   easing: 'easeOutExpo'
        // },
        update: (ev) => {
          if (spans.length <= 0) return;
          // spans.forEach(span => {
            // const val = parseFloat(span.style.opacity);
            // updateClip(span, val);
          // });
        }
      })
      .add({
        targets: spans,
        opacity: {
          value: 0,
          delay: delayFnOut,
          duration: 2000,
          easing: 'easeInExpo'
        },
        translateX: {
          value: 15,
          delay: delayFnOut,
          duration: 2000,
          easing: 'easeInExpo'
        },
        begin: () => {
          if (nextItem) {
            setTimeout(() => {
              if (nextItem.preset) api.transitionToPreset(nextItem.preset);
              api.triggerIntroSwap({ index: curIndex, items: texts });
            }, 1750);
          }
        }
      })
      .finished.then(() => {
        index++;
        if (index > texts.length - 1) {
          api.onFadeOutIntro();
        } else {
          next({ delay: 1000 });
        }
      });
  }

  index = 0;
  
  next(params);

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
