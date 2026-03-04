import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.join(process.cwd(), 'public');
const imagesDir = path.join(publicDir, 'images');
const priceListDir = path.join(imagesDir, 'price-list');

const outputGalleryFile = path.join(process.cwd(), 'src', 'gallery-items.json');
const outputDescFile = path.join(process.cwd(), 'src', 'project-descriptions.json');
const outputPriceFile = path.join(process.cwd(), 'src', 'price-list.json');

const EXCLUDED_DIRS = ['.DS_Store', 'BIO', 'price-list', 'web logo'];

// 將 RGB 轉換為 Hue (色相)
function rgbToHue(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h;
  if (max === min) h = 0;
  else if (max === r) h = (g - b) / (max - min) + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / (max - min) + 2;
  else if (max === b) h = (r - g) / (max - min) + 4;
  return Math.round(h * 60);
}

// 取得圖片的主色調 Hue
async function getDominantHue(filePath) {
  try {
    const { data } = await sharp(filePath)
      .resize(5, 5, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 3) {
      r += data[i]; g += data[i+1]; b += data[i+2];
    }
    const count = data.length / 3;
    return rgbToHue(r / count, g / count, b / count);
  } catch (e) {
    return 0;
  }
}

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

function getHierarchy(relativePath) {
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
      // 支援多層目錄偵測 subTitle
      if (parts.length > idx + 3) {
        subTitle = parts[idx+2];
      }
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
  return { title, subTitle, category };
}

async function run() {
  try {
    console.log('🎨 Analyzing images and generating gallery data...');
    const allFiles = getFiles(imagesDir);
    const galleryItems = [];
    const descriptions = {};
    const priceListData = [];

    // 1. 處理 Price List
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

    // 2. 處理 描述 與 作品
    for (const filePath of allFiles) {
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const relativePath = path.relative(publicDir, filePath);

      if (ext === '.txt') {
        const content = fs.readFileSync(filePath, 'utf-8');
        const baseName = path.basename(fileName, '.txt').toLowerCase();
        descriptions[baseName] = content;
      } else if (ext !== '.txt' && !relativePath.includes('price-list')) {
        const { title, subTitle, category } = getHierarchy(relativePath);
        
        let hue = 0;
        if (category === 'Personal') {
          hue = await getDominantHue(filePath);
        }

        galleryItems.push({
          id: galleryItems.length + 1,
          title, subTitle, category,
          imageUrl: '/' + relativePath.split(path.sep).join('/'),
          aspectRatio: 'square',
          isCover: fileName.toLowerCase().includes('cover'),
          hue: hue
        });
      }
    }

    fs.writeFileSync(outputGalleryFile, JSON.stringify(galleryItems, null, 2));
    fs.writeFileSync(outputDescFile, JSON.stringify(descriptions, null, 2));
    fs.writeFileSync(outputPriceFile, JSON.stringify(priceListData, null, 2));
    console.log(`✨ Successfully generated ${galleryItems.length} items. Color analysis completed.`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

run();
