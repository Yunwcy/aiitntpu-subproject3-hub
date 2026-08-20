import type { RequirementLog } from "@/lib/types";
import { formatDate } from "@/lib/ui";

const statusChip: Record<RequirementLog["status"], string> = {
  "已完成訪談": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  "需求確認中": "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "已上線服務": "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
};

export default function RequirementCard({ log }: { log: RequirementLog }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{log.orgName}</h3>
          <p className="text-xs text-slate-400">{log.orgNameEn}</p>
        </div>
        <span className={`chip ${statusChip[log.status]}`}>{log.status}</span>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {formatDate(log.date)} ・ {log.attendees.join("、")}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">痛點</h4>
          <ul className="mt-1.5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {log.painPoints.map((p, i) => (
              <li key={i} className="leading-snug">
                ・{p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">需求</h4>
          <ul className="mt-1.5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {log.requirements.map((r, i) => (
              <li key={i} className="leading-snug">
                ・{r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            後續行動
          </h4>
          <ul className="mt-1.5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {log.actionItems.map((a, i) => (
              <li key={i} className="leading-snug">
                ・{a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
