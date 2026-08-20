"use client";

import { useEffect, useState } from "react";
import type { NewTaskInput } from "@/lib/task-store";
import type { Phase, Priority, Task, TaskStatus, TeamMember } from "@/lib/types";
import { categoryOrder, priorityLabel, statusLabel } from "@/lib/ui";
import { CloseIcon, TrashIcon } from "@/lib/icons";

interface TaskFormModalProps {
  open: boolean;
  phases: Phase[];
  team: TeamMember[];
  initial?: Task | null;
  onClose: () => void;
  onSubmit: (input: NewTaskInput) => void;
  onDelete?: () => void;
}

interface FormState {
  title: string;
  description: string;
  category: string;
  phaseId: string;
  assigneeIds: string[];
  startDate: string;
  endDate: string;
  priority: Priority;
  status: TaskStatus;
}

function emptyForm(phases: Phase[]): FormState {
  return {
    title: "",
    description: "",
    category: "",
    phaseId: phases[0]?.id ?? "",
    assigneeIds: [],
    startDate: "",
    endDate: "",
    priority: "medium",
    status: "todo",
  };
}

function toForm(task: Task): FormState {
  return {
    title: task.title,
    description: task.description,
    category: task.category,
    phaseId: task.phaseId,
    assigneeIds: task.assigneeIds,
    startDate: task.startDate,
    endDate: task.endDate,
    priority: task.priority,
    status: task.status,
  };
}

const statusOptions: TaskStatus[] = ["todo", "in-progress", "done", "blocked"];
const priorityOptions: Priority[] = ["high", "medium", "low"];

export default function TaskFormModal({
  open,
  phases,
  team,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: TaskFormModalProps) {
  const [form, setForm] = useState<FormState>(() => (initial ? toForm(initial) : emptyForm(phases)));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initial ? toForm(initial) : emptyForm(phases));
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  if (!open) return null;

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) next.title = "請輸入任務名稱";
    if (!form.category) next.category = "請選擇工作類別";
    if (!form.phaseId) next.phaseId = "請選擇年度階段";
    if (form.assigneeIds.length === 0) next.assigneeIds = "至少選擇一位負責人";
    if (!form.startDate) next.startDate = "請選擇開始日期";
    if (!form.endDate) next.endDate = "請選擇結束日期";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = "結束日期不能早於開始日期";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      phaseId: form.phaseId,
      assigneeIds: form.assigneeIds,
      startDate: form.startDate,
      endDate: form.endDate,
      priority: form.priority,
      status: form.status,
    });
  }

  function toggleAssignee(id: string) {
    setForm((f) => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(id)
        ? f.assigneeIds.filter((a) => a !== id)
        : [...f.assigneeIds, id],
    }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {initial ? "編輯任務" : "新增任務"}
          </h2>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">任務名稱 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              placeholder="例如：桃園輔具中心需求訪談"
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">說明</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              placeholder="簡短描述這項任務的內容"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">工作類別 *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="">請選擇</option>
                {categoryOrder.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-rose-600">{errors.category}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">年度階段 *</label>
              <select
                value={form.phaseId}
                onChange={(e) => setForm((f) => ({ ...f, phaseId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.phaseId && <p className="mt-1 text-xs text-rose-600">{errors.phaseId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">開始日期 *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-rose-600">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">結束日期 *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              {errors.endDate && <p className="mt-1 text-xs text-rose-600">{errors.endDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">優先度</label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value as Priority }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {priorityLabel[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">狀態</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              負責人 *（可複選）
            </label>
            <div className="flex flex-wrap gap-2">
              {team.map((m) => {
                const checked = form.assigneeIds.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleAssignee(m.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      checked
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
            {errors.assigneeIds && (
              <p className="mt-1 text-xs text-rose-600">{errors.assigneeIds}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <TrashIcon className="h-4 w-4" />
                  刪除
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary" onClick={onClose}>
                取消
              </button>
              <button type="submit" className="btn-primary">
                {initial ? "儲存變更" : "新增任務"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
