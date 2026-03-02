import fs from 'fs';
import path from 'path';

const imagesDir = path.join(process.cwd(), 'public', 'images');
const outputFile = path.join(process.cwd(), 'src', 'gallery-items.json');

// 排除系統檔案與特定功能資料夾
const EXCLUDED_DIRS = ['.DS_Store', 'BIO', 'Price list', 'web logo'];

function getFiles(dir, allFiles = []) {
  if (!fs.existsSync(dir)) return allFiles;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    try {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(file) && !file.startsWith('.')) {
          getFiles(filePath, allFiles);
        }
      } else {
        // 只抓取常見圖片格式，排除隱藏檔
        if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file) && !file.startsWith('.')) {
          allFiles.push(filePath);
        }
      }
    } catch (e) {
      console.warn(`Skipping inaccessible file: ${filePath}`);
    }
  });
  
  return allFiles;
}

function mapToCategory(relativePath) {
  const lowerPath = relativePath.toLowerCase();
  if (lowerPath.includes('moments in time')) return 'Personal';
  if (lowerPath.includes('commissioned')) return 'Commissioned';
  if (lowerPath.includes('design')) return 'Design';
  if (lowerPath.includes('motion')) return 'Motion';
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
  } else if (category === 'Design') {
    const designIdx = parts.indexOf('design');
    if (designIdx !== -1 && parts.length > designIdx + 1) {
      title = parts[designIdx + 1];
      if (parts.length > designIdx + 2) {
        const projectParts = parts.slice(designIdx + 2);
        if (projectParts.length >= 2) subTitle = projectParts[0]; 
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
  console.log('Cleaning up gallery data...');
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
      isCover: fileName.toLowerCase().includes('cover')
    };
  });

  // 確保輸出目錄存在
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(outputFile, JSON.stringify(galleryItems, null, 2));
  console.log(`✨ Successfully generated ${galleryItems.length} items.`);
} catch (error) {
  console.error('❌ Error during gallery generation:', error.message);
}
