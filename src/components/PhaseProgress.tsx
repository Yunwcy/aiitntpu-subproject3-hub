import type { Phase } from "@/lib/types";
import { formatDate } from "@/lib/ui";

const statusDot: Record<Phase["status"], string> = {
  done: "bg-brand-500",
  "in-progress": "bg-sky-500",
  upcoming: "bg-slate-300 dark:bg-slate-600",
};

const statusText: Record<Phase["status"], string> = {
  done: "已完成",
  "in-progress": "進行中",
  upcoming: "尚未開始",
};

interface PhaseProgressProps {
  phase: Phase;
  done: number;
  total: number;
  percent: number;
}

export default function PhaseProgress({ phase, done, total, percent }: PhaseProgressProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${statusDot[phase.status]}`} />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{phase.name}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
          </p>
        </div>
        <span className="whitespace-nowrap text-xs font-medium text-slate-400">
          {statusText[phase.status]}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{phase.description}</p>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {done} / {total} 項任務完成
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-300">{percent}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
