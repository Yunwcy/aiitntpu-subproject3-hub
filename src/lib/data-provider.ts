// Static data access layer. Everything reads through these functions
// instead of importing the JSON files directly, so the storage backend
// (flat JSON today) can later be swapped for a database or API without
// touching component code. `getTasks()` here is the seed/default dataset —
// TaskStore (lib/task-store.tsx) loads it once and layers user edits on top
// in localStorage; computation over tasks lives in lib/compute.ts.

import projectRaw from "@/data/project.json";
import teamRaw from "@/data/team.json";
import phasesRaw from "@/data/phases.json";
import tasksRaw from "@/data/tasks.json";
import requirementsRaw from "@/data/requirements.json";
import messageMetricsRaw from "@/data/message-metrics.json";
import type {
  ProjectMeta,
  TeamMember,
  Phase,
  Task,
  RequirementLog,
  MessageMetrics,
} from "@/lib/types";
import { sortTasks } from "@/lib/compute";

const project = projectRaw as ProjectMeta;
const team = teamRaw as TeamMember[];
const phases = phasesRaw as Phase[];
const tasks = tasksRaw as Task[];
const requirements = requirementsRaw as RequirementLog[];
const messageMetrics = messageMetricsRaw as MessageMetrics;

export function getMessageMetrics(): MessageMetrics {
  return messageMetrics;
}

export function getProject(): ProjectMeta {
  return project;
}

export function getTeam(): TeamMember[] {
  return team;
}

export function getTeamMember(id: string): TeamMember | undefined {
  return team.find((m) => m.id === id);
}

export function getPhases(): Phase[] {
  return [...phases].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** The default/seed task list, sorted by start date. */
export function getTasks(): Task[] {
  return sortTasks(tasks);
}

export function getRequirements(): RequirementLog[] {
  return [...requirements].sort((a, b) => a.date.localeCompare(b.date));
}
