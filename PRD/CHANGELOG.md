# fate-match · PRD 變更日誌

> 對應 SPEC v3.0.x — 9 章結構（產品概述 / 使用者場景 / 功能需求 / NFR / 技術架構 / DoD / 部署契約 / Out of Scope / 變更日誌）

---

## v3.0.2 — 2026-09-06 · Fleet Patch (Sean 10-repo-fleet)

> v3.0.2 完成於 2026-09-06 by Sean 10-repo-fleet

### 補完（Patch 對齊 SPEC v3.0 契約 §1–§19）
- ✅ **套用 SPEC v3.0 契約**：補齊 9 章標準化結構章節
- ✅ **CHANGELOG.md 建立**：本檔
- ✅ **SPEC.md header 升級 v2.2.1 → v3.0.2**：patch 註記

### 開發基礎建設
- 🔧 `package.json` — 加 `test` / `test:watch` / `test:coverage` scripts（vitest 4.1.10 既有 devDeps，src/utils/*.test.ts 既有 80 個 unit tests）

### CI/CD
- ➕ `.github/workflows/ci.yml` — 4-job GHA（lint / test / build / deploy-to-Vercel）

### 驗證結果
| 項目 | 結果 |
|---|---|
| `npm run build` | ✅ Vite build 綠（dist/ 產出：index.html + favicon.svg + icons.svg + robots.txt）|
| `npm run lint` | ✅ 0 error（ESLint 9 + typescript-eslint + react-hooks + react-refresh）|
| `npm run typecheck` | ✅ 0 error（tsc --noEmit -p tsconfig.app.json）|
| `npm test` | ✅ 80/80 passed（src/utils/{bazi,photoGenerator,storage}.test.ts）|

---

## v2.2.1 — 2026-07-19 · Sweet Spot 全面轉向 (Sophia CPO + Alan CTO)

### 重大決策
- 🎯 **放棄雙邊配對市場**（Pairs / Match 已建立網路效應）
- 🎯 **切入極窄甜蜜點**：單人心理測驗 × 圖卡分享
- 🎯 **避免 MBTI 八字紅海**：聚焦「命定天子/命定天女」個人心理小遊戲

### 規格重點（摘要）
- 1 dashboard（dashboard.html · static + Tailwind CDN）
- 6 React 元件（MyDataForm / PartnerList / MatchEngine / MatchResultCard / HistoryPanel / RegionPhotos）
- 3 工具模組（bazi / photoGenerator / storage · 80 個 unit tests）
- 3 Vercel API endpoints（generate-partner-image / generate-prompt / search-background）
- Vite 8 + React 19 + TypeScript 6 + Tailwind 4 + Vitest 4 + ESLint 9

### 路線圖
- v0.1（landing + 互動 demo）
- v0.2（Production-Ready 14 項 SOP：build / tsc / lint / coverage 80 tests / a11y 95 / Lighthouse 95+ / Vercel deploy）
- v0.2 final（Lighthouse a11y 66→95、SEO 91→100、util coverage 94.7% > 90% 門檻）
