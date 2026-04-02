const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'build', 'icon.svg');
const buildDir = path.join(__dirname, '..', 'build');

async function generate() {
  const svg = fs.readFileSync(svgPath);

  // Generate 256x256 PNG (electron-builder will convert to ICO)
  await sharp(svg).resize(256, 256).png().toFile(path.join(buildDir, 'icon.png'));
  console.log('Generated icon.png (256x256)');

  console.log('Done! electron-builder will auto-convert PNG to ICO for Windows builds.');
}

generate().catch(console.error);
