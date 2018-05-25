const defaultIntroSettings = {
  foreground: '#FFFFFF',
  mode: 'intro',
  capacity: 10,
  initialCapacity: 10,
  zigZagCapacity: 0
};

module.exports = {
  default: {
    mode: 'generative',
    background: '#FBF9F3',
    foreground: '#304061',
    capacity: 30,
    initialCapacity: 30,
    zigZagCapacity: 5,
    colors: ['#313F61', '#DF1378', '#0C2AD9', '#FEC3BE', '#DDE4F0', '#7A899C']
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
  intro0: {
    ...defaultIntroSettings,
    background: '#313F61',
    colors: ['#DF1378', '#0C2AD9', '#FEC3BE', '#DDE4F0', '#7A899C']
  },
  intro1: {
    ...defaultIntroSettings,
    capacity: 15,
    initialCapacity: 15,
    background: '#df1379',
    colors: ['#FFFFFF']
  },
  intro2: {
    ...defaultIntroSettings,
    capacity: 20,
    initialCapacity: 20,
    background: '#605BC2',
    colors: ['#FFFFFF']
  },
  intro3: {
    ...defaultIntroSettings,
    capacity: 20,
    initialCapacity: 20,
    background: '#314061',
    colors: ['#FFFFFF']
  },
  intro4: {
    ...defaultIntroSettings,
    capacity: 20,
    initialCapacity: 20,
    background: '#0D2AD9',
    colors: ['#FFFFFF']
  },
  intro5: {
    ...defaultIntroSettings,
    capacity: 25,
    initialCapacity: 25,
    background: '#605BC2',
    colors: ['#FFFFFF']
  },
  intro6: {
    ...defaultIntroSettings,
    capacity: 30,
    initialCapacity: 30,
    background: '#DF1379',
    colors: ['#FFFFFF']
  }
};
