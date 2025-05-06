const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG definitions for the icons
const icon16 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <path fill="#4285F4" d="M8 1L2 4v5c0 4 3 6 6 7 3-1 6-3 6-7V4L8 1z"/>
  <path fill="#FFFFFF" d="M8 2.5L3 5v4c0 3 2.5 4.5 5 5 2.5-0.5 5-2 5-5V5L8 2.5z"/>
  <circle fill="#FF0000" cx="8" cy="8" r="3.2"/>
  <circle fill="#FFFFFF" cx="8" cy="8" r="2.2"/>
  <circle fill="#34A853" cx="8" cy="8" r="1.2"/>
</svg>`;

const icon48 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <path fill="#4285F4" d="M24 3L6 12v15c0 15 10 22 18 24 8-2 18-9 18-24V12L24 3z"/>
  <path fill="#FFFFFF" d="M24 7.5L9 15v11c0 12 8 16 15 18 7-2 15-6 15-18V15L24 7.5z"/>
  <circle fill="#FF0000" cx="24" cy="24" r="10"/>
  <circle fill="#FFFFFF" cx="24" cy="24" r="7"/>
  <circle fill="#34A853" cx="24" cy="24" r="4"/>
  <line stroke="#FFFFFF" stroke-width="2" x1="13" y1="24" x2="18" y2="24"/>
  <line stroke="#FFFFFF" stroke-width="2" x1="30" y1="24" x2="35" y2="24"/>
  <line stroke="#FFFFFF" stroke-width="2" x1="24" y1="13" x2="24" y2="18"/>
  <line stroke="#FFFFFF" stroke-width="2" x1="24" y1="30" x2="24" y2="35"/>
</svg>`;

const icon128 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <path fill="#4285F4" d="M64 8L16 32v40c0 40 28 58 48 64 20-6 48-24 48-64V32L64 8z"/>
  <path fill="#FFFFFF" d="M64 20L24 40v30c0 32 20 42 40 44 20-2 40-12 40-44V40L64 20z"/>
  <circle fill="#FF0000" cx="64" cy="64" r="26"/>
  <circle fill="#FFFFFF" cx="64" cy="64" r="18"/>
  <circle fill="#34A853" cx="64" cy="64" r="10"/>
  <line stroke="#FFFFFF" stroke-width="4" x1="34" y1="64" x2="49" y2="64"/>
  <line stroke="#FFFFFF" stroke-width="4" x1="79" y1="64" x2="94" y2="64"/>
  <line stroke="#FFFFFF" stroke-width="4" x1="64" y1="34" x2="64" y2="49"/>
  <line stroke="#FFFFFF" stroke-width="4" x1="64" y1="79" x2="64" y2="94"/>
</svg>`;

// Function to convert SVG to PNG
async function svgToPng(svgString, size, outputPath) {
  try {
    await sharp(Buffer.from(svgString))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Created ${outputPath}`);
  } catch (error) {
    console.error(`Error creating ${outputPath}:`, error);
  }
}

// Create all icons
async function generateIcons() {
  await svgToPng(icon16, 16, path.join(__dirname, 'icon16.png'));
  await svgToPng(icon48, 48, path.join(__dirname, 'icon48.png'));
  await svgToPng(icon128, 128, path.join(__dirname, 'icon128.png'));
  console.log('All icons generated successfully!');
}

generateIcons(); 