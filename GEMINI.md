# Henri Lai Portfolio - Project Context & Maintenance Guide

## 🚀 專案核心技術棧 (Tech Stack)
- **Framework**: React (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (支援 Dark Mode 與 rem 動態縮放)
- **Animation**: Framer Motion (Page Transitions & Magnetic Interactions)
- **Deployment**: GitHub + Vercel

## 🏗 資料結構與自動化 (Data & Automation)
專案採用「檔案驅動 + 自動化優化」模式：
1. **圖片掃描與優化**: 執行 `npm run generate` 會掃描 `public/images/`，並自動在 `public/thumbnails/` 產生 **600px WebP 縮圖**。
2. **資料驅動**: 產生 `src/gallery-items.json`，支援分層路徑解析 (Category > Project > SubProject)。
3. **封面規則**: 檔案名稱包含 `cover` 會被識別為專案縮圖（列表頁優先使用 Thumbnails）。
4. **文字介紹**: 資料夾內 `.txt` 檔案會依 Key (小寫) 自動匹配並顯示於頁面。

## ✨ 分頁功能與排版邏輯 (Page Logic)
- **Moments in Time**: 
    - **年份切換模式**: 點擊年份僅加載該年度照片，確保極致效能。
    - **無裁切瀑布流**: 還原攝影作品原始比例，搭配 `gap-24` 大留白。
- **Commissioned**:
    - **時間軸排序**: 專案封面依標題年份降序排列 (最新優先)。
- **Design**:
    - **自動選中**: 進入分類時自動選中第一個子分頁 (如 Vehicle > 997)。
- **深色模式 (Dark Mode)**:
    - 預設淺色模式，支援手動切換並透過 `color-scheme` 覆蓋系統外觀限制。
- **磁吸交互 (Magnetic)**:
    - 側邊導覽列具備物理感磁吸效果。

## 🔍 效能優化 (Performance)
- **分離加載**: 列表顯示 Thumbnails (WebP)，Lightbox 顯示原始大圖。
- **頁面過渡**: 使用 `AnimatePresence` 實作流暢的淡入位移切換。
- **預設淺色**: 確保第一印象的一致性。

## 🛠 維護工作流 (Maintenance Workflow)
1. **新增圖片**: 將圖片放入對應資料夾。
2. **更換封面**: 將目標圖片重新命名加入 `cover` 關鍵字。
3. **同步與優化**:
   ```zsh
   npm run generate  # 這會自動產生縮圖並同步 JSON
   git add .
   git commit -m "update contents"
   git push
   ```

## 📅 更新日誌 (Changelog)
- **2024-03-06**: 實作自動化 WebP 縮圖生成與分離加載邏輯。
- **2024-03-06**: 新增深色模式 (Dark Mode) 與系統外觀覆蓋 (color-scheme)。
- **2024-03-06**: 實作側邊欄磁吸效果與頁面滑順過渡動畫。
- **2024-03-06**: 修正 Moments in Time 年份切換邏輯與 2022 顯示問題。
- **2024-03-02**: 初始化專案，完成全站 SEO 與基礎排版。

---

# AI 功能開發指南 (Web-Optimized)

本指南專為 Henri Lai Portfolio (Static/React) 量身打造，聚焦於前端整合與輕量化實作。

## 一、 核心原則 (Core Principles)
1.  **Static First (靜態優先)**: 能用演算法或 JSON 解決的問題，**絕不呼叫 AI**。
2.  **Stateless (無狀態設計)**: AI 功能應設計為「無狀態」，不應依賴伺服器端文件寫入。
3.  **UX Centric**: AI 響應必須支援 **Streaming (串流)**。

## 二、 功能分級矩陣 (Feature Tiering)

| 等級 | 適用場景 | 技術架構 | 範例 |
| :--- | :--- | :--- | :--- |
| **Level 1** | **單次生成** | Vercel Edge Functions | 自動生成圖片 Alt Text、作品多語系翻譯。 |
| **Level 2** | **檢索增強** | Vercel AI SDK + JSON | "Chat with Henri" - 詢問作品集內容。 |
| **Forbidden** | **複雜代理** | LangChain / AutoGPT | **禁止**在此專案實作重型 Agent。 |

## 三、 提示詞與資料工程
1.  **結構化輸出 (JSON Mode)**: AI 輸出必須請求 JSON 格式。
2.  **Context 最小化**: 僅傳遞當前頁面或用戶正在瀏覽的資訊。
3.  **快取策略**: 生成內容應手動存回 Repo，**將動態 AI 轉化為靜態資產**。
