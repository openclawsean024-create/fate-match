# 命定天子/命定天女 — v2.0 地區照片牆功能

## 1. Concept & Vision

「命定天女 / 命定天子」是一款以八字五行命理為核心的配對服務。

v2.0 新增**地區照片牆**功能，讓用戶可以探索不同縣市的命定對象照片，透過 AI 圖片生成技術為每個地區呈現具有命理風格的意象照片牆。

## 2. 設計語言

- **主色**：`#7c3aed`（紫）、`#ec4899`（粉）、`#0f0a1a`（深紫背景）
- **字體**：Inter / system-ui
- **風格**：Dark purple gradient, 圓角卡片, 霓虹風格光芒效果
- **陰影**：`shadow-purple-500/20`，glow效果
- **滾動**：自訂滾動條，`max-h-* overflow-y-auto`
- **圖片**：Picsum Photos（seed-based, 免費無需 API key）

## 3. 功能：地區照片牆

### 地區選擇
- 台灣 6 大都會區分類：
  - **北部**：台北、新北、桃園、新竹
  - **中部**：台中、彰化
  - **南部**：台南、高雄、屏東
  - **東部**：花蓮、台東
  - **離島**：澎湖、金門
- 以縣市晶片按鈕（pill）呈現，選中狀態有紫色亮框

### 照片牆
- 每個地區 6-12 張照片，以 `picsum.photos/seed/{regionName}/400/400` 為 URL 確保一致性
- 3-column masonry-style grid（CSS grid `auto-rows`）
- 點擊照片可放大 Lightbox 全螢幕檢視
- 照片來不及載入時有 skeleton shimmer 效果

### Lightbox
- 全螢幕 overlay，`backdrop-filter: blur`
- 左右箭頭切換上一張/下一張
- 點擊背景或 ESC 關閉

### 地區標題卡
- 選中地區名稱 + 人口數 + 特色描述
- 「命定 `{地區名}` 的ta」標語

## 4. 不做清單

- 不串接 GPT-4o（需 API key 且成本高）
- 不串接 Google Images API
- 不做會員登入功能（地區瀏覽為匿名功能）

## 5. 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Lucide React icons
- Picsum Photos（seed-based URLs, 免費）
