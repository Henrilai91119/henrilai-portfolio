import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const imagesDir = path.join(publicDir, 'images');
const priceListDir = path.join(imagesDir, 'price-list');

const outputGalleryFile = path.join(process.cwd(), 'src', 'gallery-items.json');
const outputDescFile = path.join(process.cwd(), 'src', 'project-descriptions.json');
const outputPriceFile = path.join(process.cwd(), 'src', 'price-list.json');

const EXCLUDED_DIRS = ['.DS_Store', 'BIO', 'price-list', 'web logo'];

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
          imageUrl: imgFile ? `/images/price-list/${imgFile}` : null
        });
      }
    });
  }

  // 2. 處理 一般作品 與 描述
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
      
      // 核心修正：只有在 Design > Outdoor 資料夾下的 PNGL.txt 才會被套用
      // 排除 Commissioned 分類自動抓取
      if (relativePath.includes('design') && relativePath.includes('outdoor')) {
        descriptions[baseName] = content;
        if (baseName === 'pngl') {
          // 僅針對 outdoor 裡面的 PNGL 項目生效
          descriptions['pngl'] = content;
        }
      } else {
        // 如果是資料夾內的 TXT，只給該資料夾用
        descriptions[baseName] = content;
      }
    } else if (ext !== '.txt' && !relativePath.includes('price-list')) {
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
  console.log(`✨ Generated ${galleryItems.length} items and ${Object.keys(descriptions).length} descs.`);
} catch (error) {
  console.error('❌ Error:', error);
}
