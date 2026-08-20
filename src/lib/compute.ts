// Pure computation helpers over a `Task[]` array. Kept separate from
// data-provider.ts so the same logic can run over the static seed data
// (server components) or over the live, user-editable task list held in
// TaskStore (client components) — neither owns a fixed data source.

import type { Task, TeamMember } from "@/lib/types";

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function tasksByPhase(tasks: Task[], phaseId: string): Task[] {
  return sortTasks(tasks.filter((t) => t.phaseId === phaseId));
}

export function tasksByAssignee(tasks: Task[], memberId: string): Task[] {
  return sortTasks(tasks.filter((t) => t.assigneeIds.includes(memberId)));
}

export interface ProgressStat {
  done: number;
  total: number;
  percent: number;
}

export function overallProgress(tasks: Task[]): ProgressStat {
  const done = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function phaseProgress(tasks: Task[], phaseId: string): ProgressStat {
  return overallProgress(tasksByPhase(tasks, phaseId));
}

export interface WorkloadEntry {
  member: TeamMember;
  total: number;
  active: number; // in-progress + todo
  done: number;
  blocked: number;
}

export function workloadByMember(tasks: Task[], team: TeamMember[]): WorkloadEntry[] {
  return team.map((member) => {
    const memberTasks = tasksByAssignee(tasks, member.id);
    return {
      member,
      total: memberTasks.length,
      active: memberTasks.filter((t) => t.status === "in-progress" || t.status === "todo").length,
      done: memberTasks.filter((t) => t.status === "done").length,
      blocked: memberTasks.filter((t) => t.status === "blocked").length,
    };
  });
}

// Tasks whose end date is on/after the snapshot date but within `withinDays`,
// and not yet done — used to surface "coming up soon" risk items.
export function upcomingDeadlines(tasks: Task[], snapshotDate: string, withinDays = 30): Task[] {
  const snapshot = new Date(snapshotDate);
  const horizon = new Date(snapshot);
  horizon.setDate(horizon.getDate() + withinDays);

  return sortTasks(
    tasks.filter((t) => {
      if (t.status === "done") return false;
      const end = new Date(t.endDate);
      return end >= snapshot && end <= horizon;
    }),
  );
}

// Tasks whose end date has already passed the snapshot date but are not done —
// i.e. behind schedule as of the snapshot.
export function overdueTasks(tasks: Task[], snapshotDate: string): Task[] {
  const snapshot = new Date(snapshotDate);
  return sortTasks(tasks.filter((t) => t.status !== "done" && new Date(t.endDate) < snapshot));
}
