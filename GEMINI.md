# Henri Lai Portfolio - Project Context & Maintenance Guide

## 🚀 專案核心技術棧 (Tech Stack)
- **Framework**: React (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (使用 rem 單位支援動態縮放)
- **Animation**: Framer Motion (捲動觸發動畫)
- **Deployment**: GitHub + Vercel (Auto-deploy on push)

## 🏗 資料結構與自動化 (Data & Automation)
專案採用「檔案驅動」模式，無需手動修改代碼即可更新內容：
1. **圖片掃描**: 執行 `npm run generate` 會掃描 `public/images/` 並產生 `src/gallery-items.json`。
2. **封面規則**: 檔案名稱包含 `cover` (如 `pottery_cover.jpg`) 會自動被識別為專案縮圖。
3. **文字介紹**: 資料夾內若有與資料夾同名的 `.txt` 檔案，內容會自動顯示在該頁面頂部。
4. **年份排序**: 系統自動從路徑抓取四位數字年份，並依降序 (最新優先) 排列。

## ✨ 分頁功能與排版邏輯 (Page Logic)
- **Moments in Time**: 
    - 3 欄瀑布流排版。
    - 年份分區標題 + 頂部吸附式年份導覽 (Sticky Year Nav)。
- **Commissioned**:
    - 兩層結構：專案封面清單 -> 點擊進入詳情。
    - 支援子目錄 (SubTitle) 篩選。
- **Design**:
    - 頂部選單篩選模式 (Graphic / Outdoor / Vehicle)。
    - 預設選中 "Graphic"。
- **客製化排版 (Seamless Layout)**:
    - `997`, `Gogoro`, `Wanderer` 專案採用「無縫單欄垂直排列」。
    - 寬度限制為 `max-w-2xl` (約螢幕 50%)，增加高級感。
- **Price List**:
    - 交錯式圖文排列。
    - 自動讀取 `public/images/price-list/` 下的對應 `.txt` 與圖片。

## 🎨 設計規範 (Design System)
- **字體縮放**: Full HD (1400px-2000px) 根字體設為 14px；2K/4K 恢復 16px。
- **動態效果**: 1.5 秒慢速漸顯浮現 + 20px 垂直位移。
- **留白規範**: 圖片縮小 30% 配合較大的 Padding，營造藝廊感。

## 🔍 SEO 與健康檢查
- 已配置 `index.html` 中的 Meta Tags, Open Graph, Favicon。
- 圖片已全面實作 `Lazy Loading` 與 `fetchpriority` 優化。
- 實作「不可變副本排序」防止 React Runtime Crash。

## 🛠 維護工作流 (Maintenance Workflow)
1. **新增圖片**: 將圖片放入對應資料夾。
2. **更換封面**: 將目標圖片重新命名加入 `cover` 關鍵字。
3. **新增文字**: 建立同名 `.txt` 檔案。
4. **同步指令**:
   ```zsh
   npm run generate
   git add .
   git commit -m "update contents"
   git push
   ```

## 📅 更新日誌 (Changelog)
- **2024-03-02**: 初始化 React 專案，從 Wix 遷移。
- **2024-03-02**: 實作自動掃描腳本與正方形封面。
- **2024-03-02**: 新增 Moments in Time 年份導覽與 Design 篩選選單。
- **2024-03-02**: 實作 997/Gogoro/Wanderer 無縫垂直排列。
- **2024-03-02**: 完成 Price List 圖文併排邏輯。
- **2024-03-02**: 執行全站 SEO 優化與穩定性修復（解決 Crash 問題）。
