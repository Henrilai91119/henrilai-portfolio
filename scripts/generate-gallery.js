import fs from 'fs';
import path from 'path';

const imagesDir = path.join(process.cwd(), 'public', 'images');
const outputGalleryFile = path.join(process.cwd(), 'src', 'gallery-items.json');
const outputDescFile = path.join(process.cwd(), 'src', 'project-descriptions.json');

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
  const allFiles = getFiles(imagesDir);
  const galleryItems = [];
  const descriptions = {};

  allFiles.forEach((filePath, index) => {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
    const parts = relativePath.split(path.sep);

    if (ext === '.txt') {
      const content = fs.readFileSync(filePath, 'utf-8');
      const baseName = path.basename(fileName, '.txt').toLowerCase();
      descriptions[baseName] = content;
      
      // 特殊處理: PNGL 對應到多個專案
      if (baseName === 'pngl') {
        descriptions['2023 pngl'] = content;
        descriptions['2025 pngl'] = content;
        descriptions['2024 pnglx拓荒者'] = content;
      }
      // 其他可能的對映
      if (baseName === 'dcm') descriptions['dmc'] = content; // 修正拼字差異
    } else {
      // 這裡維持原本的層次邏輯... (略過介紹，直接寫入 gallery-items)
    }
  });

  // 第二次遍歷: 產生 gallery items (維持原本邏輯)
  const finalGalleryItems = allFiles.filter(f => !f.endsWith('.txt')).map((filePath, index) => {
    // ... (維持與之前相同的 getHierarchy 邏輯)
    const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
    const parts = relativePath.split(path.sep);
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

    return {
      id: index + 1,
      title,
      subTitle,
      category,
      imageUrl: '/' + relativePath.split(path.sep).join('/'),
      aspectRatio: 'square',
      isCover: path.basename(filePath).toLowerCase().includes('cover')
    };
  });

  fs.writeFileSync(outputGalleryFile, JSON.stringify(finalGalleryItems, null, 2));
  fs.writeFileSync(outputDescFile, JSON.stringify(descriptions, null, 2));
  console.log(`✨ Generated ${finalGalleryItems.length} items and ${Object.keys(descriptions).length} descriptions.`);
} catch (error) {
  console.error('❌ Error:', error);
}
