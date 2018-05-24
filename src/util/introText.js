module.exports = function () {
  var basicTimeline = anime.timeline();
  basicTimeline
    .add({
      targets: '#basicTimeline .square.el',
      translateX: 250,
      easing: 'easeOutExpo'
    })
    .add({
      targets: '#basicTimeline .circle.el',
      translateX: 250,
      easing: 'easeOutExpo'
    })
    .add({
      targets: '#basicTimeline .triangle.el',
      translateX: 250,
      easing: 'easeOutExpo'
    });
};
