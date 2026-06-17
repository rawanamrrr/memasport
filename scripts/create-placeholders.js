const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to create a simple placeholder image
function createPlaceholder(width, height, text, bgColor, textColor) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Split text into multiple lines if needed
  const words = text.split(' ');
  const lineHeight = 50;
  let y = (height - (words.length - 1) * lineHeight) / 2;
  
  words.forEach(word => {
    ctx.fillText(word.toUpperCase(), width / 2, y);
    y += lineHeight;
  });
  
  return canvas.toBuffer();
}

// Define placeholders to create
const placeholders = [
  { 
    name: 'placeholder-sports-outlet.jpg',
    text: 'OUTLET',
    bgColor: '#1a1a1a',
    textColor: '#ff6b35'
  },
  {
    name: 'placeholder-sports-accessories.jpg',
    text: 'ACCESSORIES',
    bgColor: '#1a1a1a',
    textColor: '#4ecdc4'
  },
  {
    name: 'placeholder-sports-apparel.jpg',
    text: 'APPAREL',
    bgColor: '#1a1a1a',
    textColor: '#ffd166'
  },
  {
    name: 'placeholder-sports-equipment.jpg',
    text: 'EQUIPMENT',
    bgColor: '#1a1a1a',
    textColor: '#06d6a0'
  }
];

// Create each placeholder
placeholders.forEach(placeholder => {
  const imageBuffer = createPlaceholder(800, 600, placeholder.text, placeholder.bgColor, placeholder.textColor);
  fs.writeFileSync(path.join(publicDir, placeholder.name), imageBuffer);
  console.log(`Created: ${placeholder.name}`);
});

console.log('All placeholder images have been created!');
