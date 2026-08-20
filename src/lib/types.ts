// Core domain types for the project hub.
// This models a real research-project operation: phases, tasks, a team,
// and a running log of partner-organization requirement interviews.

export type TaskStatus = "done" | "in-progress" | "todo" | "blocked";
export type Priority = "high" | "medium" | "low";

export interface TeamMember {
  id: string;
  name: string;
  origin: string; // flavor text, e.g. "台灣" / "德國"
  role: string; // short role title
  focus: string[]; // responsibility tags shown as chips
  initials: string;
  color: string; // tailwind color token used for avatar + chip accents
}

export interface Phase {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  status: "done" | "in-progress" | "upcoming";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  phaseId: string;
  assigneeIds: string[];
  startDate: string;
  endDate: string;
  status: TaskStatus;
  priority: Priority;
  category: string;
  dependsOn?: string[];
}

export interface RequirementLog {
  id: string;
  orgName: string;
  orgNameEn: string;
  date: string;
  attendees: string[];
  painPoints: string[];
  requirements: string[];
  actionItems: string[];
  status: "已完成訪談" | "需求確認中" | "已上線服務";
}

export interface OrgMessageMetric {
  name: string;
  monthly: number[];
  total: number;
  firstLiveMonth: string;
}

export interface MessageMetrics {
  months: string[];
  totalsByMonth: number[];
  total: number;
  orgs: OrgMessageMetric[];
}

export interface ProjectMeta {
  name: string;
  nameEn: string;
  subtitle: string;
  fundingSource: string;
  startDate: string;
  endDate: string;
  snapshotDate: string; // the "as of" date this demo's data is frozen at
  description: string;
}
