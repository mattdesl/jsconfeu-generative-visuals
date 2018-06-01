const webAudioPlayer = require('web-audio-player');
const analyserAverage = require('analyser-frequency-average');
const noop = () => {};
const smoothstep = require('smoothstep');
const CircularBuffer = require('circular-buffer');
const ease = require('eases/quad-in-out');
const clamp = require('clamp');

const audioAverageCount = 15;
const frequencyBins = [
  { start: 70, end: 150 },
  { start: 4000, end: 6000 },
  { start: 6000, end: 10000 }
];

const BEAT_LEAD_TIME = 0.15;
const BEAT_TIMES = [
  { time: 3.916 },
  { time: 7.721 },
  { time: 11.582 },
  { time: 15.442 },
  { time: 19.248 },
  { time: 23.108 },
  { time: 26.913 },
  { time: 30.774 },
  { time: 34.634 },
  { time: 38.440, major: true },
];


module.exports = function () {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const src = 'assets/audio/intro-short.mp3';
  const player = webAudioPlayer(src, {
    context,
    buffer: false
  });
  const analyser = context.createAnalyser();
  const biquadFilter = context.createBiquadFilter();
  biquadFilter.type = 'lowpass';
  // biquadFilter.Q.setValueAtTime(10, context.currentTime);
  biquadFilter.frequency.setValueAtTime(500, context.currentTime);
  // biquadFilter.gain.setValueAtTime(1, context.currentTime)

  biquadFilter.connect(analyser);
  // biquadFilter.connect(context.destination);

  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(200, context.currentTime);
  lowpass.connect(context.destination);

  player.node.connect(lowpass);
  player.node.connect(biquadFilter);

  const freqs = new Uint8Array(analyser.fftSize);
  const bins = frequencyBins;
  const velFactor = 0.05;
  const velFriction = 0.5;
  const signalsVel = bins.map(() => 0);
  const signalsRaw = bins.map(() => 0);
  const signalsAveraged = bins.map(() => 0);
  const averages = bins.map(() => new CircularBuffer(audioAverageCount));

  player.BEAT_TIMES = BEAT_TIMES;
  player.BEAT_LEAD_TIME = BEAT_LEAD_TIME;

  player.fadeIn = () => {
    lowpass.frequency.setTargetAtTime(100, context.currentTime, 0.5);
    lowpass.frequency.setTargetAtTime(100, context.currentTime + 0.5, 0.5);
    lowpass.frequency.exponentialRampToValueAtTime(20000, context.currentTime + 3);
  };

  player.fadeOut = (cb = noop) => {
    // lowpass.frequency.setTargetAtTime(100, context.currentTime, 0.5);
    // lowpass.frequency.setTargetAtTime(100, context.currentTime + 0.5, 0.5);
    lowpass.frequency.exponentialRampToValueAtTime(100, context.currentTime + 10);
    player.node.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 10);
    setTimeout(() => {
      cb();
    }, 5000);
  };

  player.updateFrequencies = () => {
    analyser.getByteTimeDomainData(freqs);

    bins.forEach((bin, i) => {
      let signal = analyserAverage(analyser, freqs, bin.start, bin.end);
      signal = smoothstep(0.2, 0.7, signal);

      signalsVel[i] += signal * velFactor;
      signalsVel[i] = clamp(signalsVel[i], 0, 1);
      signalsVel[i] *= velFriction;
      averages[i].enq(signal);
      signalsRaw[i] = signal;
    });

    averages.forEach((avg, i) => {
      const len = avg.size();
      let sum = 0;
      for (let i = 0; i < len; i++) {
        sum += avg.get(i);
      }
      sum /= len;
      // signalsAveraged[i] = (sum);
      signalsAveraged[i] = ease(sum);
    });

    // console.log(signalsVel[0])
    return signalsAveraged;
  };
  return player;
};
