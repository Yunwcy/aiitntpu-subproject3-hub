"use client";

import { useEffect, useState } from "react";
import { AlertIcon, SparkleIcon } from "@/lib/icons";

interface RiskAlert {
  title: string;
  detail: string;
  relatedTaskTitle?: string;
}

interface SummaryData {
  progressSummary: string;
  riskAlerts: RiskAlert[];
  nextSteps: string[];
}

interface StatusResponse {
  configured: boolean;
  remaining: number;
  limit: number;
}

const EXAMPLE_SUMMARY: SummaryData = {
  progressSummary:
    "截至資料快照日，第二年與第三年規劃的工作項目已全數完成，7 家合作組織皆已上線服務；目前僅剩計畫交接項目仍在進行中，整體專案已進入收尾階段。",
  riskAlerts: [
    {
      title: "交接窗口較短",
      detail:
        "計畫交接與延續移交排定 2026/08–2026/09，時間相對緊湊，建議提前準備好系統文件與帳號權限清單，避免交接期間服務中斷。",
      relatedTaskTitle: "計畫交接與延續移交",
    },
  ],
  nextSteps: [
    "優先完成系統維運文件與帳號權限清冊，供接手團隊使用",
    "安排至少一次交接會議，現場示範知識庫更新與 Prompt 調整流程",
    "整理 7 家合作組織的知識庫維護紀錄，作為未來擴充參考",
  ],
};

export default function AgentSummaryPanel() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SummaryData | null>(null);
  const [showExample, setShowExample] = useState(false);

  useEffect(() => {
    fetch("/api/ai-agent-summary")
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setShowExample(false);
    try {
      const res = await fetch("/api/ai-agent-summary", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "發生未知錯誤");
        return;
      }
      setData(json.data);
      setStatus((prev) => (prev ? { ...prev, remaining: json.remaining ?? prev.remaining } : prev));
    } catch {
      setError("網路連線異常，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  const display = data ?? (showExample ? EXAMPLE_SUMMARY : null);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
            <SparkleIcon className="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              AI Agent 智能進度摘要
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              伺服器端即時呼叫 OpenAI，依目前專案資料產出進度摘要、風險提醒與下一步建議。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading || (status ? !status.configured || status.remaining <= 0 : false)}
          >
            {loading ? "產生中…" : "產生即時 AI 摘要"}
          </button>
          {!data && (
            <button className="btn-secondary" onClick={() => setShowExample((s) => !s)}>
              {showExample ? "隱藏範例" : "查看範例輸出"}
            </button>
          )}
        </div>
      </div>

      {status && (
        <p className="mt-2 text-xs text-slate-400">
          {status.configured
            ? `今日剩餘可用次數：${status.remaining} / ${status.limit}（這是我自己出的 API 額度，公開展示用途，設有每日上限）`
            : "此環境尚未設定 OPENAI_API_KEY，暫時無法呼叫即時 AI 摘要 — 可以先看下方範例輸出。"}
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {display && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          {showExample && !data && (
            <span className="chip bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              範例輸出（非即時產生）
            </span>
          )}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              進度摘要
            </h4>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
              {display.progressSummary}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              風險提醒
            </h4>
            {display.riskAlerts.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                目前沒有偵測到明顯風險。
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {display.riskAlerts.map((r, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
                  >
                    <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <span className="font-semibold">{r.title}</span>
                      <p className="mt-0.5 text-xs opacity-90">{r.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              下一步建議
            </h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-200">
              {display.nextSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
