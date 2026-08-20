import type { Task, TeamMember } from "@/lib/types";
import { formatDate, memberChipClass, memberColorClass, statusChipClass, statusLabel } from "@/lib/ui";
import { PencilIcon } from "@/lib/icons";

interface TeamMemberCardProps {
  member: TeamMember;
  tasks: Task[];
  onEdit?: (member: TeamMember) => void;
}

export default function TeamMemberCard({ member, tasks, onEdit }: TeamMemberCardProps) {
  const done = tasks.filter((t) => t.status === "done").length;
  const sorted = [...tasks].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${memberColorClass[member.color]}`}
          >
            {member.initials}
          </span>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{member.name}</h3>
            <p className="text-xs text-slate-400">
              {member.role} ・ {member.origin}
            </p>
          </div>
        </div>
        {onEdit && (
          <button
            onClick={() => onEdit(member)}
            aria-label={`編輯「${member.name}」`}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {member.focus.map((f) => (
          <span key={f} className={`chip ${memberChipClass[member.color]}`}>
            {f}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>負責任務</span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {done} / {tasks.length} 完成
        </span>
      </div>

      <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {sorted.map((task) => (
          <li
            key={task.id}
            className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60"
          >
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-200">{task.title}</p>
              <p className="mt-0.5 text-slate-400">
                {formatDate(task.startDate)} – {formatDate(task.endDate)}
              </p>
            </div>
            <span className={`chip shrink-0 ${statusChipClass[task.status]}`}>
              {statusLabel[task.status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
