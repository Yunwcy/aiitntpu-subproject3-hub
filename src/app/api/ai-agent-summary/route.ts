import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { checkRateLimit, peekRateLimit } from "@/lib/rate-limit";
import { getProject, getPhases, getTasks, getTeam } from "@/lib/data-provider";

export const runtime = "nodejs";

// Daily calls allowed per client IP. This is a public portfolio demo running
// on the author's own API key — keep this low. See README for rationale.
const DAILY_LIMIT = 8;

const SummarySchema = z.object({
  progressSummary: z
    .string()
    .describe("2-3 句中文摘要，說明專案目前整體進度與階段狀態"),
  riskAlerts: z
    .array(
      z.object({
        title: z.string().describe("風險項目的簡短標題"),
        detail: z.string().describe("風險說明，包含具體任務或原因"),
        relatedTaskTitle: z.string().optional().describe("相關任務名稱（若有）"),
      }),
    )
    .describe("值得注意的風險清單；若目前沒有明顯風險，回傳空陣列"),
  nextSteps: z
    .array(z.string())
    .describe("2-4 條具體、可執行的下一步建議"),
});

function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(req: NextRequest) {
  const configured = Boolean(process.env.ANTHROPIC_API_KEY);
  const { remaining } = peekRateLimit(getClientKey(req), DAILY_LIMIT);
  return NextResponse.json({ configured, remaining, limit: DAILY_LIMIT });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "server_not_configured",
        message: "尚未設定 ANTHROPIC_API_KEY，這個環境還無法呼叫即時 AI 摘要。",
      },
      { status: 503 },
    );
  }

  const clientKey = getClientKey(req);
  const { allowed, remaining, resetAt } = checkRateLimit(clientKey, DAILY_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: `今日 AI 摘要試用次數已達上限（每日 ${DAILY_LIMIT} 次），請明天再試，或參考下方的預錄範例輸出。`,
        resetAt,
      },
      { status: 429 },
    );
  }

  const project = getProject();
  const phases = getPhases();
  const tasks = getTasks();
  const team = getTeam();

  const contextPayload = {
    project: {
      name: project.name,
      snapshotDate: project.snapshotDate,
      startDate: project.startDate,
      endDate: project.endDate,
    },
    phases: phases.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      phaseId: t.phaseId,
      assignees: t.assigneeIds,
      status: t.status,
      priority: t.priority,
      startDate: t.startDate,
      endDate: t.endDate,
      dependsOn: t.dependsOn ?? [],
    })),
    team: team.map((m) => ({ id: m.id, name: m.name, role: m.role })),
  };

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 3000,
      output_config: {
        effort: "medium",
        format: zodOutputFormat(SummarySchema),
      },
      system:
        "你是一個研究專案管理助理，會根據專案的階段、任務狀態與團隊分工資料，產出精簡、專業的中文進度摘要。" +
        "請以 project.snapshotDate 作為「今天」的基準日期，用任務的 startDate / endDate / status 判斷是否已逾期、即將到期，或某成員任務量偏重。" +
        "riskAlerts 只列出真正值得留意的項目；如果目前沒有明顯風險，回傳空陣列，不要硬湊。" +
        "nextSteps 要具體可執行，避免空泛的場面話，語氣像是在跟專案負責人簡報。",
      messages: [
        {
          role: "user",
          content: `以下是目前專案資料（JSON）：\n${JSON.stringify(contextPayload)}\n\n請根據以上資料產出進度摘要、風險提醒與下一步建議。`,
        },
      ],
    });

    if (!response.parsed_output) {
      return NextResponse.json(
        { error: "parse_failed", message: "AI 回覆格式解析失敗，請稍後再試。" },
        { status: 502 },
      );
    }

    return NextResponse.json({ data: response.parsed_output, remaining, resetAt });
  } catch (err) {
    console.error("ai-agent-summary error:", err);
    const message =
      err instanceof Anthropic.APIError
        ? `AI 服務發生錯誤（${err.status}）：${err.message}`
        : "AI 服務暫時無法使用，請稍後再試。";
    return NextResponse.json({ error: "upstream_error", message }, { status: 502 });
  }
}
