import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const checkpointLog = path.join(process.cwd(), 'CHECKPOINTS.md');
const timestamp = new Date().toLocaleString('zh-TW', { hour12: false });
const tagDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const tagName = `checkpoint-${tagDate}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

const message = process.argv.slice(2).join(' ') || "Manual Checkpoint";

try {
  console.log(`🚀 Establishing checkpoint: ${tagName}...`);

  // 1. 同步作品清單
  execSync('npm run generate');

  // 2. 提交變更
  execSync('git add .');
  try {
    execSync(`git commit -m "Checkpoint: ${message}"`);
  } catch (e) {
    console.log("ℹ️ No new changes to commit.");
  }

  // 3. 建立標籤
  execSync(`git tag -a ${tagName} -m "${message}"`);
  
  // 4. 推送到雲端
  console.log('📡 Pushing to GitHub...');
  execSync('git push origin main --tags');

  // 5. 記錄日誌
  const logEntry = `## [${tagName}] - ${timestamp}\n- **Message**: ${message}\n- **Status**: Stable\n\n`;
  if (!fs.existsSync(checkpointLog)) {
    fs.writeFileSync(checkpointLog, `# Project Checkpoints\n\n${logEntry}`);
  } else {
    fs.appendFileSync(checkpointLog, logEntry);
  }

  console.log(`✅ Success! Checkpoint ${tagName} is now live on GitHub.`);
} catch (error) {
  console.error('❌ Error creating checkpoint:', error.message);
}
