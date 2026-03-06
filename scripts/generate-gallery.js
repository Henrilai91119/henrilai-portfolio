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

// 取得圖片的主色調 Hue (用於 Moments in Time 排序)
async function getDominantHue(filePath) {
  try {
    const { data } = await sharp(filePath)
      .resize(10, 10, { fit: 'cover' })
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

/**
 * 解析路徑層級 (修正版)
 * 結構: public/images/[Category]/[ProjectTitle]/[SubProjectTitle]/image.jpg
 */
function getHierarchy(relativePath) {
  const parts = relativePath.split(path.sep);
  // parts[0] 是 'images'
  // parts[1] 是 分類目錄 (moments in time, commissioned, design)
  
  let categoryRaw = parts[1] || '';
  let title = 'Untitled';
  let subTitle = null;
  let category = 'Personal';

  if (categoryRaw.toLowerCase() === 'moments in time') {
    category = 'Personal';
    title = parts[2] || 'Untitled'; // 通常是年份 2024
  } else if (categoryRaw.toLowerCase() === 'commissioned') {
    category = 'Commissioned';
    title = parts[2] || 'Untitled';
    // 偵測是否還有子目錄
    if (parts.length > 4) {
      subTitle = parts[3];
    }
  } else if (categoryRaw.toLowerCase() === 'design') {
    category = 'Design';
    title = parts[2] || 'Untitled';
    if (parts.length > 4) {
      subTitle = parts[3];
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
        const key = path.basename(fileName, '.txt').toLowerCase().trim();
        descriptions[key] = content;
      } else if (!relativePath.includes('price-list')) {
        const { title, subTitle, category } = getHierarchy(relativePath);
        
        let hue = 0;
        if (category === 'Personal') {
          hue = await getDominantHue(filePath);
        }

        galleryItems.push({
          id: galleryItems.length + 1,
          title, subTitle, category,
          imageUrl: '/' + relativePath.split(path.sep).join('/'),
          isCover: fileName.toLowerCase().includes('cover'),
          hue: hue
        });
      }
    }

    fs.writeFileSync(outputGalleryFile, JSON.stringify(galleryItems, null, 2));
    fs.writeFileSync(outputDescFile, JSON.stringify(descriptions, null, 2));
    fs.writeFileSync(outputPriceFile, JSON.stringify(priceListData, null, 2));
    
    console.log(`✨ Successfully generated ${galleryItems.length} items.`);
    console.log(`📝 Processed ${Object.keys(descriptions).length} project descriptions.`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

run();
