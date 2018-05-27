const defaultIntroSettings = {
  foreground: '#FFFFFF',
  mode: 'intro',
  capacity: 25,
  initialCapacity: 25,
  zigZagCapacity: 0
};

module.exports = {
  default: {
    mode: 'default',
    background: '#FBF9F3',
    foreground: '#304061',
    capacity: 35,
    initialCapacity: 35,
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
  introIdle: {
    ...defaultIntroSettings,
    background: '#000',
    colors: ['#000']
  },
  intro0: {
    ...defaultIntroSettings,
    background: '#313F61',
    colors: ['#DF1378', '#0C2AD9', '#FEC3BE', '#DDE4F0', '#7A899C']
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
