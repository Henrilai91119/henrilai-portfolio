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

function getHierarchy(relativePath) {
  const parts = relativePath.split(path.sep);
  const category = mapToCategory(relativePath);
  
  let title = 'Untitled';
  let subTitle = null;

  if (category === 'Commissioned') {
    const commissionedIdx = parts.indexOf('commissioned');
    if (commissionedIdx !== -1 && parts.length > commissionedIdx + 1) {
      title = parts[commissionedIdx + 1];
      if (parts.length > commissionedIdx + 3) {
        subTitle = parts[commissionedIdx + 2];
      }
    }
  } else if (category === 'Personal') {
    const momentsIdx = parts.indexOf('moments in time');
    if (momentsIdx !== -1 && parts.length > momentsIdx + 1) {
      title = parts[momentsIdx + 1];
    }
  } else {
    const idx = parts.length - 2;
    if (idx >= 0) title = parts[idx];
  }

  return { title, subTitle };
}

try {
  const allImages = getFiles(imagesDir);
  const galleryItems = allImages.map((filePath, index) => {
    const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
    const category = mapToCategory(relativePath);
    const { title, subTitle } = getHierarchy(relativePath);
    const fileName = path.basename(filePath);
    
    return {
      id: index + 1,
      title: title,
      subTitle: subTitle,
      category: category,
      imageUrl: '/' + relativePath.split(path.sep).join('/'),
      aspectRatio: 'square',
      // 自動偵測：如果檔名包含 'cover'，標記為封面
      isCover: fileName.toLowerCase().includes('cover')
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(galleryItems, null, 2));
  console.log(`Successfully generated ${galleryItems.length} items to ${outputFile}`);
} catch (error) {
  console.error('Error generating gallery items:', error);
}
