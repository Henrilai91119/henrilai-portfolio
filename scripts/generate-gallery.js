import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const imagesDir = path.join(publicDir, 'images');
const priceListDir = path.join(imagesDir, 'Price list');

const outputGalleryFile = path.join(process.cwd(), 'src', 'gallery-items.json');
const outputDescFile = path.join(process.cwd(), 'src', 'project-descriptions.json');
const outputPriceFile = path.join(process.cwd(), 'src', 'price-list.json');

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
        if (/\.(jpg|jpeg|png|webp|gif|txt)$/i.test(file) && !file.startsWith('.')) {
          allFiles.push(filePath);
        }
      }
    } catch (e) {}
  });
  return allFiles;
}

try {
  // 1. 處理 Price List 特別邏輯
  const priceListData = [];
  if (fs.existsSync(priceListDir)) {
    const priceFiles = fs.readdirSync(priceListDir);
    const bases = Array.from(new Set(priceFiles.map(f => path.basename(f, path.extname(f)))));
    
    bases.forEach(base => {
      if (base === '.DS_Store') return;
      const txtFile = priceFiles.find(f => path.basename(f, path.extname(f)) === base && f.endsWith('.txt'));
      const imgFile = priceFiles.find(f => path.basename(f, path.extname(f)) === base && /\.(jpg|jpeg|png|webp)$/i.test(f));
      
      if (txtFile) {
        priceListData.push({
          title: base,
          content: fs.readFileSync(path.join(priceListDir, txtFile), 'utf-8'),
          imageUrl: imgFile ? `/images/Price list/${imgFile}` : null
        });
      }
    });
  }

  // 2. 處理 一般作品 與 描述 (維持之前邏輯)
  const allFiles = getFiles(imagesDir);
  const galleryItems = [];
  const descriptions = {};

  allFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const relativePath = path.relative(publicDir, filePath);
    const parts = relativePath.split(path.sep);

    if (ext === '.txt') {
      const content = fs.readFileSync(filePath, 'utf-8');
      const baseName = path.basename(fileName, '.txt').toLowerCase();
      descriptions[baseName] = content;
      if (baseName === 'pngl') {
        descriptions['2023 pngl'] = content;
        descriptions['2025 pngl'] = content;
        descriptions['2024 pnglx拓荒者'] = content;
      }
    } else {
      // 這裡維持作品歸類邏輯 (省略細節以求精簡)
      let title = 'Untitled', subTitle = null, category = 'Personal';
      if (relativePath.includes('moments in time')) {
        category = 'Personal';
        const idx = parts.indexOf('moments in time');
        if (idx !== -1 && parts.length > idx + 1) title = parts[idx+1];
      } else if (relativePath.includes('commissioned')) {
        category = 'Commissioned';
        const idx = parts.indexOf('commissioned');
        if (idx !== -1 && parts.length > idx + 1) {
          title = parts[idx+1];
          if (parts.length > idx + 3) subTitle = parts[idx+2];
        }
      } else if (relativePath.includes('design')) {
        category = 'Design';
        const idx = parts.indexOf('design');
        if (idx !== -1 && parts.length > idx + 1) {
          title = parts[idx+1];
          if (parts.length > idx + 2) {
            const p = parts.slice(idx + 2);
            if (p.length >= 2) subTitle = p[0];
          }
        }
      }
      
      galleryItems.push({
        id: galleryItems.length + 1,
        title, subTitle, category,
        imageUrl: '/' + relativePath.split(path.sep).join('/'),
        aspectRatio: 'square',
        isCover: fileName.toLowerCase().includes('cover')
      });
    }
  });

  fs.writeFileSync(outputGalleryFile, JSON.stringify(galleryItems, null, 2));
  fs.writeFileSync(outputDescFile, JSON.stringify(descriptions, null, 2));
  fs.writeFileSync(outputPriceFile, JSON.stringify(priceListData, null, 2));
  console.log(`✨ Generated ${galleryItems.length} items, ${Object.keys(descriptions).length} project descs, and ${priceListData.length} price items.`);
} catch (error) {
  console.error('❌ Error:', error);
}
