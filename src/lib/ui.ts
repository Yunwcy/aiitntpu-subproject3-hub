import type { Priority, TaskStatus } from "@/lib/types";

export const statusLabel: Record<TaskStatus, string> = {
  done: "已完成",
  "in-progress": "進行中",
  todo: "待開始",
  blocked: "卡關中",
};

export const statusChipClass: Record<TaskStatus, string> = {
  done: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  "in-progress": "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  todo: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  blocked: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export const statusBarClass: Record<TaskStatus, string> = {
  done: "bg-brand-500",
  "in-progress": "bg-sky-500",
  todo: "bg-slate-300 dark:bg-slate-600",
  blocked: "bg-rose-500",
};

export const priorityLabel: Record<Priority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export const priorityChipClass: Record<Priority, string> = {
  high: "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900",
  medium:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  low: "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800",
};

export const memberColorClass: Record<string, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
};

export const memberChipClass: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};

// Canonical display order for task categories (a lightweight work-breakdown
// structure) — the Gantt and category views group rows by this order rather
// than alphabetically, so the story reads in a sensible sequence.
export const categoryOrder = [
  "需求訪談",
  "爬蟲",
  "系統架構",
  "GCP 部署",
  "系統除錯維運",
  "多模態系統建置",
  "模型選型",
  "語言品質",
  "效能分析",
  "文件",
  "交接",
];

export function sortCategories(categories: string[]): string[] {
  return [...categories].sort((a, b) => {
    const ia = categoryOrder.indexOf(a);
    const ib = categoryOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
