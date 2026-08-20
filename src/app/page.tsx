"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getMessageMetrics, getPhases, getProject, getRequirements } from "@/lib/data-provider";
import { overallProgress, phaseProgress } from "@/lib/compute";
import { useTaskStore } from "@/lib/task-store";
import StatCard from "@/components/StatCard";
import PhaseProgress from "@/components/PhaseProgress";
import MessageGrowthChart from "@/components/MessageGrowthChart";
import AgentSummaryPanel from "@/components/AgentSummaryPanel";
import { formatDate, statusChipClass, statusLabel } from "@/lib/ui";
import { CheckCircleIcon, ClockIcon, MessageIcon, UsersIcon } from "@/lib/icons";

export default function DashboardPage() {
  const project = useMemo(() => getProject(), []);
  const phases = useMemo(() => getPhases(), []);
  const metrics = useMemo(() => getMessageMetrics(), []);
  const requirements = useMemo(() => getRequirements(), []);
  const { tasks } = useTaskStore();

  const progress = overallProgress(tasks);
  const inProgressTasks = tasks.filter((t) => t.status !== "done");

  return (
    <div className="space-y-8">
      <section>
        <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {project.fundingSource}
        </span>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          {project.name}
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{project.subtitle}</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {project.description}
        </p>
        <p className="mt-3 text-xs text-slate-400">
          資料快照日：{formatDate(project.snapshotDate)}（本頁所有進度與狀態皆以此日期為基準）
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="合作組織"
          value={`${requirements.length}`}
          hint="社福 LINE Bot 上線"
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <StatCard
          label="累積訊息回覆"
          value={metrics.total.toLocaleString()}
          hint="真實使用資料"
          icon={<MessageIcon className="h-5 w-5" />}
        />
        <StatCard
          label="任務完成度"
          value={`${progress.percent}%`}
          hint={`${progress.done} / ${progress.total} 項任務`}
          icon={<CheckCircleIcon className="h-5 w-5" />}
        />
        <StatCard
          label="進行中項目"
          value={`${inProgressTasks.length}`}
          hint={inProgressTasks.length > 0 ? "計畫收尾／交接中" : "全數完成"}
          icon={<ClockIcon className="h-5 w-5" />}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">年度階段進度</h2>
          <Link href="/timeline" className="text-sm font-medium text-brand-600 hover:underline">
            查看完整時程 →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {phases.map((phase) => {
            const p = phaseProgress(tasks, phase.id);
            return <PhaseProgress key={phase.id} phase={phase} {...p} />;
          })}
        </div>
      </section>

      <section>
        <MessageGrowthChart months={metrics.months} totals={metrics.totalsByMonth} total={metrics.total} />
      </section>

      <section>
        <AgentSummaryPanel />
      </section>

      {inProgressTasks.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800 dark:text-white">目前進行中</h2>
          <div className="card divide-y divide-slate-100 dark:divide-slate-800">
            {inProgressTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(task.startDate)} – {formatDate(task.endDate)} ・ {task.category}
                  </p>
                </div>
                <span className={`chip shrink-0 ${statusChipClass[task.status]}`}>
                  {statusLabel[task.status]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
