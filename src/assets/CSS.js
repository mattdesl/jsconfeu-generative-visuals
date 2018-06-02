module.exports = `
  @font-face {
    font-family: 'Domus';
    src: url(assets/font/Domus-Regular.woff);
    font-weight: 500;
  }

  body {
    overflow: hidden;
    background: #303f62;
  }

  .canvas-container {
    background: #303f62;
  }

  html {
    font-family: 'Domus', Helvetica, sans-serif;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  .canvas-text-container {
    position: absolute;
    color: white;
    top: 0.25vmax;
    left: -0.75vmax;
    width: 100%;
    pointer-events: none;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .canvas-text {
    font-size: 1.0vmax;
    text-align: center;
    
    width: 15vw;
    user-select: none;
    position: absolute;
  }


  .canvas-big-text:not(:empty) + .canvas-text {
    top: calc(50% - 1.75vmax);
  }

  .canvas-big-text {
    font-size: 2.5vmax;
    text-align: center;
    width: 27vw;
    user-select: none;
    position: absolute;
    top: calc(50% - 1.0vmax);
  }

  canvas {
    cursor: none;
  }

  .canvas-text p {
    margin: 0;
    line-height: 1.5;
  }

  .text-chunk {
    display: inline-block;
    position: relative;
    margin-right: 0.15vmax;
    margin-left: 0.15vmax;
  }
`;
