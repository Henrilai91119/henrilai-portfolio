import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.join(process.cwd(), 'public');
const imagesDir = path.join(publicDir, 'images');
const thumbnailsDir = path.join(publicDir, 'thumbnails');
const priceListDir = path.join(imagesDir, 'price-list');

const outputGalleryFile = path.join(process.cwd(), 'src', 'gallery-items.json');
const outputDescFile = path.join(process.cwd(), 'src', 'project-descriptions.json');
const outputPriceFile = path.join(process.cwd(), 'src', 'price-list.json');

const EXCLUDED_DIRS = ['.DS_Store', 'BIO', 'price-list', 'web logo'];

// 確保縮圖目錄存在
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

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

// 取得圖片主色調與生成縮圖
async function processImage(filePath, relativePath) {
  try {
    const thumbPath = path.join(thumbnailsDir, relativePath.replace(/\.[^/.]+$/, ".webp"));
    const thumbDir = path.dirname(thumbPath);
    
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }

    // 1. 生成 WebP 縮圖 (寬度 600px, 品質 80)
    // 如果縮圖已存在則跳過，加快執行速度
    if (!fs.existsSync(thumbPath)) {
      await sharp(filePath)
        .resize(600, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(thumbPath);
    }

    // 2. 取得色相 (使用縮圖取樣更快)
    const { data } = await sharp(thumbPath)
      .resize(10, 10)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 3) {
      r += data[i]; g += data[i+1]; b += data[i+2];
    }
    const count = data.length / 3;
    const hue = rgbToHue(r / count, g / count, b / count);

    return { 
      hue, 
      thumbnailUrl: '/thumbnails/' + relativePath.replace(/\.[^/.]+$/, ".webp").split(path.sep).join('/') 
    };
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e.message);
    return { hue: 0, thumbnailUrl: null };
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
  let categoryRaw = parts[1] || '';
  let title = 'Untitled', subTitle = null, category = 'Personal';

  if (categoryRaw.toLowerCase() === 'moments in time') {
    category = 'Personal';
    title = parts[2] || 'Untitled';
  } else if (categoryRaw.toLowerCase() === 'commissioned') {
    category = 'Commissioned';
    title = parts[2] || 'Untitled';
    if (parts.length > 4) subTitle = parts[3];
  } else if (categoryRaw.toLowerCase() === 'design') {
    category = 'Design';
    title = parts[2] || 'Untitled';
    if (parts.length > 4) subTitle = parts[3];
  }

  return { title, subTitle, category };
}

async function run() {
  try {
    console.log('🎨 Generating thumbnails and gallery data...');
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

    // 2. 處理作品
    for (const filePath of allFiles) {
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const relativePath = path.relative(publicDir, filePath);
      const imagesRelativePath = path.relative(imagesDir, filePath);

      if (ext === '.txt') {
        descriptions[path.basename(fileName, '.txt').toLowerCase().trim()] = fs.readFileSync(filePath, 'utf-8');
      } else if (!relativePath.includes('price-list')) {
        const { title, subTitle, category } = getHierarchy(relativePath);
        
        // 生成縮圖並獲取色相
        const { hue, thumbnailUrl } = await processImage(filePath, imagesRelativePath);

        galleryItems.push({
          id: galleryItems.length + 1,
          title, subTitle, category,
          imageUrl: '/' + relativePath.split(path.sep).join('/'),
          thumbnailUrl: thumbnailUrl || '/' + relativePath.split(path.sep).join('/'), // Fallback to original
          isCover: fileName.toLowerCase().includes('cover'),
          hue: hue
        });
      }
    }

    fs.writeFileSync(outputGalleryFile, JSON.stringify(galleryItems, null, 2));
    fs.writeFileSync(outputDescFile, JSON.stringify(descriptions, null, 2));
    fs.writeFileSync(outputPriceFile, JSON.stringify(priceListData, null, 2));
    
    console.log(`✨ Successfully processed ${galleryItems.length} items with thumbnails.`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

run();
