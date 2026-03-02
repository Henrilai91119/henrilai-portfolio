# Henri Lai Portfolio - Project Context & Changelog

## 🚀 專案核心技術棧 (Tech Stack)
- **Framework**: React (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: GitHub + Vercel (Auto-deploy on push)

## 📁 資料夾結構規範
- `public/images/`: 存放所有原始圖片。
- `public/images/moments in time/`: 對應 "Moments in Time" 分頁。
- `public/images/commissioned/`: 對應 "Commissioned" 分頁。
- `public/images/design/`: 對應 "Design" 分頁。
- `scripts/generate-gallery.js`: 自動掃描腳本，將圖片路徑轉化為 `src/gallery-items.json`。

## 🤖 自動化規則 (Foundation Mandates)
1. **圖片封面偵測**: 在資料夾中，若檔案名稱包含 `cover` (不分大小寫)，系統會自動將其識別為專案縮圖（例如: `pottery_cover.jpg`）。
2. **自動掃描**: 執行 `npm run dev` 或 `npm run build` 時會先執行 `npm run generate` 更新作品清單。
3. **年份排序**: 系統自動從路徑中抓取四位數字年份，並依降序 (2026 -> 2023) 排列。

## ✨ 已實作功能紀錄 (Features)
- **Moments in Time**: 
    - 瀑布流排列 (3 欄)。
    - 年份分區標題 (2026, 2025...)。
    - 頂部吸附式年份導覽列 (Sticky Year Nav) 與捲動追蹤 (Scroll Spy)。
- **Commissioned**:
    - 兩層式結構：專案正方形封面清單 -> 點擊進入專案內容。
    - 支援子資料夾 (SubTitle) 過濾導覽 (如 PNGL Part 1/2)。
- **Design**:
    - 頂部選單篩選模式 (Graphic / Outdoor / Vehicle)。
    - 支援二級子專案選單。
    - 預設選中 "Graphic"。
- **客製化排版**:
    - `997` 與 `Gogoro` 專案採用「無縫單欄垂直排列」，且按檔名編號排序。
- **視覺美學**:
    - 全站 1.5 秒慢速優雅顯影動畫。
    - 圖片縮小 30% 並加大留白 (Padding)。
    - 高品質燈箱 (Lightbox) 功能。
    - Full HD 螢幕下字體與 Logo 自動縮放 (使用 rem 單位)。

## 🛠 穩定性與效能優化 (Stability)
- **不可變排序 (Immutable Sort)**: 防止排序時修改原數據導致 React Crash。
- **空值保護**: 對 `imageUrl` 與年份匹配加入嚴謹的 null check。
- **捲動節流 (Throttling)**: 使用 `requestAnimationFrame` 優化 700+ 張圖的捲動效能。
- **Lazy Loading**: 全站圖片延遲載入並配合 0.5s~1.5s 漸顯。

## 📧 聯繫資訊
- **Email**: lai91119@gmail.com
- **Instagram**: https://www.instagram.com/henrilai.photography/
