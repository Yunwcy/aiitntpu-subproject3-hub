# ReVoice 子計畫三・專案管理中心

一個以我在國科會（NSTC）三年期研究計畫「[ReVoice](https://www.facebook.com/aiitntpu/) 子計畫三」擔任主要研究助理的真實工作內容為藍本重建的專案管理系統 —— 時程規劃、團隊分工、需求訪談紀錄，以及一個會即時呼叫 OpenAI 產出進度摘要的 AI Agent 面板。

這不是通用的專案管理範本，而是我實際帶團隊做過的事：接手一套已上線但架構鬆散的系統、把它重構成 RAG 架構、正式部署上雲、主導需求訪談把合作組織從 3 家擴展到 7 家、分派任務給 3 位夥伴、追蹤進度直到完成交接。這個系統把那整個過程的排程、分工與追蹤方式重新做成一個可互動的工具。

## 功能

- **總覽儀表板** — 合作組織數、累積訊息回覆量（真實使用資料）、任務完成度等關鍵指標；年度階段進度卡片；真實的每月訊息量成長折線圖
- **時程規劃** — 同一份任務資料的甘特圖／表格兩種呈現方式。甘特圖以「負責事項類別」（需求訪談、爬蟲、GCP 部署⋯）分組，而非單純按時間分組，一眼看出每個工作類別由誰負責
- **新增／編輯任務** — 完整表單，欄位皆為下拉選單或日期選擇器（不是自由輸入文字），從源頭避免格式不一致導致統計失準；資料存在瀏覽器 `localStorage`，可隨時一鍵重置回預設示範資料
- **團隊面板** — 4 人小組的角色分工與工作量分佈
- **需求訪談紀錄** — 7 家合作組織的訪談摘要（痛點／需求／後續行動）
- **AI Agent 智能進度摘要** — 伺服器端即時呼叫 OpenAI，依目前的階段、任務、團隊資料產出進度摘要、風險提醒與下一步建議（見下方「AI 整合說明」）

## 技術棧

- [Next.js 14](https://nextjs.org/)（App Router）+ TypeScript + Tailwind CSS
- 資料層抽成 `src/lib/data-provider.ts`（靜態資料）與 `src/lib/task-store.tsx`（可編輯的任務狀態，Context + `localStorage`），計算邏輯集中在 `src/lib/compute.ts`，方便未來替換成真正的資料庫
- `openai` 官方 SDK 搭配 [Zod 結構化輸出](https://platform.openai.com/docs/guides/structured-outputs)（`zodResponseFormat` + `chat.completions.parse`），確保 AI 回覆一定是可解析的 JSON，而不是自由文字

## 開始使用

```bash
npm install
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000)。

## AI 整合說明

儀表板上的「AI Agent 智能進度摘要」會在伺服器端呼叫 OpenAI API（`src/app/api/ai-agent-summary/route.ts`），把目前的階段、任務、團隊資料整理成 prompt，並用 `response_format: zodResponseFormat(...)` 搭配 Zod schema 強制模型回傳結構化 JSON（進度摘要／風險提醒／下一步建議），預設模型為 `gpt-4o-mini`（可用 `OPENAI_MODEL` 環境變數調整）。

這個 API 金鑰是我自己申請的，公開展示用途，所以：

- 金鑰只存在伺服器端環境變數 `OPENAI_API_KEY`，不會出現在前端或 repo 裡
- 設有簡單的每日呼叫次數上限（依 IP 計算，`src/lib/rate-limit.ts`），避免被過量呼叫產生費用；這是記憶體內計數，伺服器重啟或多執行個體部署時不會共享，正式產品可換成 Vercel KV / Upstash Redis 等外部儲存
- 沒有設定 `OPENAI_API_KEY` 的環境（例如你 clone 下來但沒填自己的金鑰）仍可正常瀏覽整個網站，該面板會改顯示一份預錄的範例輸出

要在本機啟用即時呼叫，複製 `.env.local.example` 為 `.env.local` 並填入你自己的金鑰：

```bash
cp .env.local.example .env.local
```

## 專案結構

```
src/
  app/                     # Next.js App Router 頁面與 API Route
  components/              # UI 元件（甘特圖、表格、表單、AI 面板…）
  data/                    # 靜態示範資料（依真實工作內容整理，已去識別化）
  lib/
    types.ts               # 共用型別
    data-provider.ts       # 靜態資料存取層
    compute.ts             # 純函式：進度、工作量、逾期／即將到期等計算
    task-store.tsx          # 任務資料的 Context + localStorage 讀寫
    gantt.ts / ui.ts / icons.tsx
```

## 關於資料

`src/data/` 裡的內容是根據我實際的計畫工作內容整理而成的示範資料：任務時程、團隊分工、需求訪談紀錄皆對應真實發生過的工作，僅將外部人員以匿名方式呈現（例如夥伴皆使用化名）。每月訊息回覆量圖表則直接採用真實的 LINE Bot 使用紀錄。`src/data/project.json` 的 `startDate` 對應我實際加入計畫的時間點，而非計畫本身三年期的起點。

---

以作品集展示為目的建置，非官方計畫系統。
