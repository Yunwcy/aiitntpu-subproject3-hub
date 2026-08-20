"use client";

import { useEffect, useState } from "react";
import type { NewMemberInput } from "@/lib/team-store";
import { nextMemberColor } from "@/lib/team-store";
import type { TeamMember } from "@/lib/types";
import { memberColorClass, memberColorOptions } from "@/lib/ui";
import { CloseIcon, TrashIcon } from "@/lib/icons";

interface MemberFormModalProps {
  open: boolean;
  team: TeamMember[];
  initial?: TeamMember | null;
  onClose: () => void;
  onSubmit: (input: NewMemberInput) => void;
  onDelete?: () => void;
}

interface FormState {
  name: string;
  role: string;
  origin: string;
  initials: string;
  focus: string; // comma-separated in the form, split into an array on submit
  color: string;
}

function emptyForm(team: TeamMember[]): FormState {
  return { name: "", role: "", origin: "", initials: "", focus: "", color: nextMemberColor(team) };
}

function toForm(member: TeamMember): FormState {
  return {
    name: member.name,
    role: member.role,
    origin: member.origin,
    initials: member.initials,
    focus: member.focus.join("、"),
    color: member.color,
  };
}

function autoInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  // ASCII name -> first two letters uppercased; CJK name -> first character.
  return /^[A-Za-z]/.test(trimmed)
    ? trimmed.slice(0, 2).toUpperCase()
    : trimmed.slice(0, 1);
}

export default function MemberFormModal({
  open,
  team,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: MemberFormModalProps) {
  const [form, setForm] = useState<FormState>(() => (initial ? toForm(initial) : emptyForm(team)));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initial ? toForm(initial) : emptyForm(team));
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  if (!open) return null;

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "請輸入姓名";
    if (!form.role.trim()) next.role = "請輸入角色／職稱";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      role: form.role.trim(),
      origin: form.origin.trim(),
      initials: (form.initials.trim() || autoInitials(form.name)).slice(0, 2),
      focus: form.focus
        .split(/[,、，]/)
        .map((f) => f.trim())
        .filter(Boolean),
      color: form.color,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {initial ? "編輯成員" : "新增成員"}
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
            <label className="mb-1 block text-xs font-semibold text-slate-500">姓名 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              placeholder="例如：Grace"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">角色／職稱 *</label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              placeholder="例如：後端工程師"
            />
            {errors.role && <p className="mt-1 text-xs text-rose-600">{errors.role}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">背景／來源</label>
              <input
                type="text"
                value={form.origin}
                onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                placeholder="例如：台灣"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                縮寫（頭像用，選填）
              </label>
              <input
                type="text"
                value={form.initials}
                onChange={(e) => setForm((f) => ({ ...f, initials: e.target.value }))}
                maxLength={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                placeholder={autoInitials(form.name) || "自動產生"}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              負責範圍（用頓號或逗號分隔多項）
            </label>
            <input
              type="text"
              value={form.focus}
              onChange={(e) => setForm((f) => ({ ...f, focus: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              placeholder="例如：後端開發、GCP 部署"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">代表色</label>
            <div className="flex flex-wrap gap-2">
              {memberColorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  aria-label={c}
                  aria-pressed={form.color === c}
                  className={`h-7 w-7 rounded-full ${memberColorClass[c]} transition ${
                    form.color === c
                      ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
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
                  移除
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary" onClick={onClose}>
                取消
              </button>
              <button type="submit" className="btn-primary">
                {initial ? "儲存變更" : "新增成員"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
