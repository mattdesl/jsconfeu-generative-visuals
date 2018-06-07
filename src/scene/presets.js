const defaultIntroSettings = {
  foreground: '#FFFFFF',
  mode: 'intro',
  capacity: 30,
  initialCapacity: 30,
  zigZagCapacity: 0
};

const generative = {
  mode: 'default',
  background: '#f3ecda',
  foreground: '#304061',
  capacity: 30,
  initialCapacity: 30,
  zigZagCapacity: 1,
  colors: [
    { weight: 100, value: '#e10079' },
    { weight: 100, value: '#6058c5' },
    { weight: 100, value: '#ffc4bc' },
    { weight: 50, value: '#dde4f2' },
    { weight: 50, value: '#051add' },
    { weight: 50, value: '#303f62' }
  ]
  // All colors equal:
  // colors: ['#313F61', '#DF1378', '#0C2AD9', '#FEC3BE', '#DDE4F0', '#7A899C']
};

module.exports = {
  default: {
    ...generative
  },
  ambient: {
    mode: 'ambient',
    capacity: 10,
    initialCapacity: 10,
    zigZagCapacity: 0,
    background: '#313F61',
    foreground: '#ffffff',
    colors: ['#FFFFFF']
  },
  introIdle: {
    ...defaultIntroSettings,
    background: '#000',
    colors: ['#000']
  },
  intro0: {
    ...defaultIntroSettings,
    background: '#303f62',
    colors: [
      { weight: 100, value: '#0C2AD9' },
      { weight: 100, value: '#6058c5' },
      { weight: 100, value: '#DF1378' },
      { weight: 50, value: '#FEC3BE' },
      { weight: 25, value: '#7A899C' },
    ]
  },
  intro1: {
    ...defaultIntroSettings,
    background: '#df1379',
    colors: ['#FFFFFF']
  },
  intro2: {
    ...defaultIntroSettings,
    background: '#605BC2',
    colors: ['#FFFFFF']
  },
  intro3: {
    ...defaultIntroSettings,
    background: '#314061',
    colors: ['#FFFFFF']
  },
  intro4: {
    ...defaultIntroSettings,
    background: '#0D2AD9',
    colors: ['#FFFFFF']
  },
  intro5: {
    ...defaultIntroSettings,
    background: '#605BC2',
    colors: ['#FFFFFF']
  },
  intro6: {
    ...generative,
    mode: 'intro'
  }
};
