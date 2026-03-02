import fs from 'fs';
import path from 'path';

const imagesDir = path.join(process.cwd(), 'public', 'images');
const outputFile = path.join(process.cwd(), 'src', 'gallery-items.json');

const EXCLUDED_DIRS = ['.DS_Store', 'BIO', 'Price list'];

function getFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        getFiles(filePath, allFiles);
      }
    } else {
      if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file) && !file.startsWith('.')) {
        allFiles.push(filePath);
      }
    }
  });
  
  return allFiles;
}

function mapToCategory(relativePath) {
  if (relativePath.includes('moments in time')) return 'Personal';
  if (relativePath.includes('commissioned')) return 'Commissioned';
  if (relativePath.includes('design')) return 'Design';
  if (relativePath.includes('Motion')) return 'Motion';
  return 'Personal';
}

function getTitle(relativePath) {
  const parts = relativePath.split(path.sep);
  // Get the most relevant folder name
  if (parts.length > 2) {
    return parts[parts.length - 2];
  }
  return 'Untitled';
}

try {
  const allImages = getFiles(imagesDir);
  const galleryItems = allImages.map((filePath, index) => {
    const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
    const category = mapToCategory(relativePath);
    const title = getTitle(relativePath);
    
    return {
      id: index + 1,
      title: title,
      category: category,
      imageUrl: '/' + relativePath.split(path.sep).join('/'),
      aspectRatio: 'square' // Default to square, can be adjusted manually later
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(galleryItems, null, 2));
  console.log(`Successfully generated ${galleryItems.length} items to ${outputFile}`);
} catch (error) {
  console.error('Error generating gallery items:', error);
}
