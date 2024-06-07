const Canvas = require('canvas');
const fs = require('fs');

const generateInfographicImage = (completedSteps) => {
  const canvasWidth = 500; 
  const canvasHeight = 50; 
  const stepWidth = canvasWidth / completedSteps.length;

  const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = 0; i < completedSteps.length; i++) {
    const stepX = i * stepWidth;
    const stepY = canvasHeight / 2;
    context.beginPath();
    context.fillStyle = completedSteps[i] ? 'green' : 'gray';
    context.fillRect(stepX, stepY - 5, stepWidth, 10);
    context.closePath();
  }

  const imagePath = './infographic.png';
  const out = fs.createWriteStream(imagePath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => {
    console.log('Infographic image saved:', imagePath);
  });

  return imagePath;
};

module.exports = generateInfographicImage;
