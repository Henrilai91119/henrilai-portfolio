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

---

# AI 功能開發指南 (Web-Optimized)

本指南專為 Henri Lai Portfolio (Static/React) 量身打造，聚焦於前端整合與輕量化實作，剔除不適用於 Vercel Serverless 環境的複雜架構。

## 一、 核心原則 (Core Principles)
1.  **Static First (靜態優先)**: 能用 RegEx、排序演算法或既有 JSON 資料解決的問題，**絕不呼叫 AI**。
2.  **Stateless (無狀態設計)**: 鑑於 Vercel 環境特性，AI 功能應設計為「無狀態」或依賴 Client-side Context，不應依賴伺服器端文件寫入。
3.  **UX Centric**: AI 響應必須支援 **Streaming (串流)** 顯示，避免網頁長時間 Loading 空白。

## 二、 功能分級矩陣 (Feature Tiering)

| 等級 | 適用場景 | 技術架構 | 範例 |
| :--- | :--- | :--- | :--- |
| **Level 1** | **單次生成 (One-shot)** | Vercel Edge Functions + OpenAI/Gemini API | 自動生成圖片 Alt Text、作品多語系翻譯。 |
| **Level 2** | **檢索增強 (Simple RAG)** | Vercel AI SDK (`useChat`) + JSON Data | "Chat with Henri" - 讓訪客詢問作品集內容 (基於 `gallery-items.json`)。 |
| **Forbidden** | **複雜代理 (Agents)** | LangChain / AutoGPT | **禁止**在此專案實作需要檔案系統讀寫、長期記憶或複雜工具編排的重型 Agent。 |

## 三、 提示詞與資料工程 (Prompt & Data)
1.  **結構化輸出 (JSON Mode)**:
    *   AI 輸出**必須**請求 JSON 格式，以便前端 React Component 直接渲染，避免 Regex 解析文字。
2.  **Context 最小化**:
    *   **不要**將整個網站資料 (`gallery-items.json`) 一次性倒給 AI。
    *   **策略**: 僅傳遞當前頁面 (Page Context) 或用戶正在瀏覽的圖片資訊。
3.  **快取策略 (Caching)**:
    *   對於非即時性內容（如：作品介紹生成），生成一次後應手動存回 `.json` 或 `.txt` 檔 commit 進 Repo，**將動態 AI 轉化為靜態資產**。

## 四、 開發注意事項
*   **API Keys**: 嚴禁將 API Key 暴露於前端代碼 (`VITE_` 開頭變數需謹慎)。應透過 Serverless Function (API Routes) 轉發請求。
*   **Error Handling**: 必須預設 AI 服務會失敗。當 API Error 時，UI 應優雅降級 (Fallback) 顯示預設靜態文字，而非報錯。
