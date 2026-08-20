import type { Task, TeamMember } from "@/lib/types";
import { buildMonthSegments, daysBetween } from "@/lib/gantt";
import {
  formatDate,
  memberColorClass,
  sortCategories,
  statusBarClass,
  statusLabel,
} from "@/lib/ui";

interface GanttChartProps {
  tasks: Task[];
  team: TeamMember[];
  snapshotDate: string;
  onTaskClick?: (task: Task) => void;
}

const DAY_WIDTH = 7; // px per day
const LEFT_COL_WIDTH = 280; // px

const LEGEND: { status: Task["status"]; label: string }[] = [
  { status: "done", label: "已完成" },
  { status: "in-progress", label: "進行中" },
  { status: "todo", label: "待開始" },
  { status: "blocked", label: "卡關中" },
];

// Grouped by responsibility / work category (a lightweight WBS) rather than
// by project phase — this makes "who owns what" the primary read, while the
// x-axis still shows exactly when each piece of work happened.
export default function GanttChart({ tasks, team, snapshotDate, onTaskClick }: GanttChartProps) {
  if (tasks.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        目前沒有可顯示的任務。
      </div>
    );
  }

  const allDates = tasks.flatMap((t) => [t.startDate, t.endDate]);
  const minDate = allDates.reduce((a, b) => (a < b ? a : b));
  const maxDate = allDates.reduce((a, b) => (a > b ? a : b));

  const totalDays = daysBetween(minDate, maxDate) + 1;
  const timelineWidth = totalDays * DAY_WIDTH;
  const monthSegments = buildMonthSegments(minDate, maxDate);
  const snapshotOffset = daysBetween(minDate, snapshotDate) * DAY_WIDTH;
  const showSnapshotLine = snapshotOffset >= 0 && snapshotOffset <= timelineWidth;

  const memberMap = new Map(team.map((m) => [m.id, m]));
  const categories = sortCategories([...new Set(tasks.map((t) => t.category))]);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {LEGEND.map((l) => (
            <span key={l.status} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${statusBarClass[l.status]}`} />
              {l.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-px bg-rose-400" />
            資料快照日
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {formatDate(minDate)} – {formatDate(maxDate)}
        </span>
      </div>

      <div className="scrollbar-thin overflow-x-auto">
        <div className="relative" style={{ width: LEFT_COL_WIDTH + timelineWidth }}>
          {showSnapshotLine && (
            <div
              className="pointer-events-none absolute inset-y-0 z-30 w-px bg-rose-400"
              style={{ left: LEFT_COL_WIDTH + snapshotOffset }}
            />
          )}

          {/* Month header */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <div
              className="sticky left-0 z-20 flex shrink-0 items-end bg-white px-4 pb-2 text-xs font-semibold text-slate-400 dark:bg-slate-900"
              style={{ width: LEFT_COL_WIDTH }}
            >
              工作類別 / 任務
            </div>
            <div className="flex" style={{ width: timelineWidth }}>
              {monthSegments.map((seg, i) => (
                <div
                  key={i}
                  className="shrink-0 border-l border-slate-100 px-2 py-2 text-xs font-medium text-slate-400 dark:border-slate-800"
                  style={{ width: seg.days * DAY_WIDTH }}
                >
                  {seg.label}
                </div>
              ))}
            </div>
          </div>

          {/* Rows grouped by responsibility category */}
          {categories.map((category) => {
            const categoryTasks = tasks
              .filter((t) => t.category === category)
              .sort((a, b) => a.startDate.localeCompare(b.startDate));
            if (categoryTasks.length === 0) return null;

            // Who mainly owns this category, for a quick at-a-glance chip.
            const owners = [
              ...new Set(categoryTasks.flatMap((t) => t.assigneeIds)),
            ]
              .map((id) => memberMap.get(id))
              .filter((m): m is TeamMember => Boolean(m));

            return (
              <div key={category}>
                <div className="flex bg-slate-50 dark:bg-slate-800/60">
                  <div
                    className="sticky left-0 z-20 flex shrink-0 items-center justify-between gap-2 bg-slate-50 px-4 py-2 dark:bg-slate-800/60"
                    style={{ width: LEFT_COL_WIDTH }}
                  >
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {category}
                    </span>
                    <div className="flex -space-x-1.5">
                      {owners.map((m) => (
                        <span
                          key={m.id}
                          title={m.name}
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white text-[8px] font-bold text-white dark:border-slate-800 ${memberColorClass[m.color]}`}
                        >
                          {m.initials.slice(0, 1)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0" style={{ width: timelineWidth }} />
                </div>
                {categoryTasks.map((task) => {
                  const offset = daysBetween(minDate, task.startDate) * DAY_WIDTH;
                  const width = Math.max(
                    (daysBetween(task.startDate, task.endDate) + 1) * DAY_WIDTH,
                    14,
                  );
                  return (
                    <div
                      key={task.id}
                      className="flex border-b border-slate-100 last:border-b-0 dark:border-slate-800/60"
                    >
                      <div
                        className="sticky left-0 z-20 flex shrink-0 items-center gap-2 border-r border-slate-100 bg-white px-4 py-2.5 dark:border-slate-800/60 dark:bg-slate-900"
                        style={{ width: LEFT_COL_WIDTH }}
                      >
                        <div className="flex -space-x-1.5">
                          {task.assigneeIds.map((id) => {
                            const m = memberMap.get(id);
                            if (!m) return null;
                            return (
                              <span
                                key={id}
                                title={m.name}
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white dark:border-slate-900 ${memberColorClass[m.color]}`}
                              >
                                {m.initials.slice(0, 1)}
                              </span>
                            );
                          })}
                        </div>
                        <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                          {task.title}
                        </span>
                      </div>
                      <div className="relative shrink-0 py-2.5" style={{ width: timelineWidth }}>
                        <button
                          type="button"
                          onClick={() => onTaskClick?.(task)}
                          title={`${task.title}\n${formatDate(task.startDate)} – ${formatDate(task.endDate)}\n${statusLabel[task.status]}`}
                          className={`absolute top-1/2 h-4 -translate-y-1/2 rounded-full ${statusBarClass[task.status]} opacity-90 transition hover:opacity-100 ${onTaskClick ? "cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-brand-400" : ""}`}
                          style={{ left: offset, width }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
