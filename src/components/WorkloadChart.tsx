import type { WorkloadEntry } from "@/lib/compute";
import { memberColorClass } from "@/lib/ui";

interface WorkloadChartProps {
  workload: WorkloadEntry[];
}

export default function WorkloadChart({ workload }: WorkloadChartProps) {
  const max = Math.max(...workload.map((w) => w.total), 1);

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">團隊工作量分佈</h3>
      <p className="mt-1 text-xs text-slate-400">依負責任務數量統計，用於檢視分工是否均衡。</p>
      <div className="mt-4 space-y-3">
        {workload.map(({ member, total, done }) => (
          <div key={member.id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">{member.name}</span>
              <span className="text-slate-400">
                {done} / {total} 完成
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full ${memberColorClass[member.color]}`}
                style={{ width: `${(total / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
