import type { Phase, Task, TeamMember } from "@/lib/types";
import {
  formatDate,
  memberChipClass,
  priorityChipClass,
  priorityLabel,
  statusChipClass,
  statusLabel,
} from "@/lib/ui";
import { PencilIcon } from "@/lib/icons";

interface TaskTableProps {
  phases: Phase[];
  tasks: Task[];
  team: TeamMember[];
  onEdit?: (task: Task) => void;
}

export default function TaskTable({ phases, tasks, team, onEdit }: TaskTableProps) {
  const memberMap = new Map(team.map((m) => [m.id, m]));
  const phaseMap = new Map(phases.map((p) => [p.id, p]));

  return (
    <div className="card overflow-hidden">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <th className="px-4 py-3">階段</th>
              <th className="px-4 py-3">任務</th>
              <th className="px-4 py-3">負責人</th>
              <th className="px-4 py-3">時程</th>
              <th className="px-4 py-3">優先度</th>
              <th className="px-4 py-3">狀態</th>
              {onEdit && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const phase = phaseMap.get(task.phaseId);
              return (
                <tr
                  key={task.id}
                  className="border-b border-slate-100 align-top last:border-b-0 dark:border-slate-800/60"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {phase?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 dark:text-slate-100">
                      {task.title}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">{task.category}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {task.assigneeIds.map((id) => {
                        const m = memberMap.get(id);
                        if (!m) return null;
                        return (
                          <span key={id} className={`chip ${memberChipClass[m.color]}`}>
                            {m.name}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(task.startDate)} – {formatDate(task.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`chip ${priorityChipClass[task.priority]}`}>
                      {priorityLabel[task.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`chip ${statusChipClass[task.status]}`}>
                      {statusLabel[task.status]}
                    </span>
                  </td>
                  {onEdit && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onEdit(task)}
                        aria-label={`編輯「${task.title}」`}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
