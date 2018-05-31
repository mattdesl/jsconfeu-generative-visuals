module.exports = `
  @font-face {
    font-family: 'Domus';
    src: url(assets/font/Domus-Regular.woff);
    font-weight: 500;
  }

  html {
    font-family: 'Domus', Helvetica, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  .canvas-text-container {
    position: absolute;
    color: white;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .canvas-text {
    font-size: 1.75vmax;
    text-align: center;
    width: 27vw;
    user-select: none;
    position: absolute;
  }

  .canvas-big-text:not(:empty) + .canvas-text {
    top: calc(50% - 2.5vmax);
  }

  .canvas-big-text {
    font-size: 3.75vmax;
    text-align: center;
    width: 27vw;
    user-select: none;
    position: absolute;
    top: calc(50% - 1.0vmax);
  }

  .canvas-text p {
    margin: 0;
    line-height: 1.5;
  }

  .text-chunk {
    display: inline-block;
    position: relative;
    margin-right: 3px;
    margin-left: 3px;
  }
`;
