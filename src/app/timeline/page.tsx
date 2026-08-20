"use client";

import { useMemo, useState } from "react";
import GanttChart from "@/components/GanttChart";
import TaskTable from "@/components/TaskTable";
import TaskFormModal from "@/components/TaskFormModal";
import FilterChips from "@/components/FilterChips";
import { getPhases, getProject } from "@/lib/data-provider";
import { useTaskStore } from "@/lib/task-store";
import { useTeamStore } from "@/lib/team-store";
import type { Task } from "@/lib/types";
import { categoryOrder, memberColorClass, priorityLabel, statusLabel } from "@/lib/ui";
import { GridIcon, ListIcon, PlusIcon, RefreshIcon } from "@/lib/icons";

type ViewMode = "gantt" | "table";

const STATUS_OPTIONS = ["done", "in-progress", "todo", "blocked"] as const;
const PRIORITY_OPTIONS = ["high", "medium", "low"] as const;

function toggleIn(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** yyyy-mm-dd -> yyyy-mm, for month-granularity range comparisons. */
function toMonth(iso: string): string {
  return iso.slice(0, 7);
}

export default function TimelinePage() {
  const [view, setView] = useState<ViewMode>("gantt");
  const [memberFilter, setMemberFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [rangeStart, setRangeStart] = useState(""); // yyyy-mm
  const [rangeEnd, setRangeEnd] = useState(""); // yyyy-mm
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { tasks: allTasks, isDirty, addTask, updateTask, deleteTask, resetToDefault } =
    useTaskStore();

  const project = useMemo(() => getProject(), []);
  const phases = useMemo(() => getPhases(), []);
  const { team } = useTeamStore();

  const usedCategories = categoryOrder.filter((c) => allTasks.some((t) => t.category === c));
  const searchTerm = search.trim().toLowerCase();

  const fullRange = useMemo(() => {
    const dates = allTasks.flatMap((t) => [t.startDate, t.endDate]);
    if (dates.length === 0) return { min: "", max: "" };
    return { min: toMonth(dates.reduce((a, b) => (a < b ? a : b))), max: toMonth(dates.reduce((a, b) => (a > b ? a : b))) };
  }, [allTasks]);

  const tasks = allTasks.filter((t) => {
    if (memberFilter.length > 0 && !t.assigneeIds.some((id) => memberFilter.includes(id))) return false;
    if (categoryFilter.length > 0 && !categoryFilter.includes(t.category)) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(t.status)) return false;
    if (priorityFilter.length > 0 && !priorityFilter.includes(t.priority)) return false;
    if (rangeStart && toMonth(t.endDate) < rangeStart) return false;
    if (rangeEnd && toMonth(t.startDate) > rangeEnd) return false;
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm)) return false;
    return true;
  });

  const activeFilterCount =
    [memberFilter, categoryFilter, statusFilter, priorityFilter].filter((f) => f.length > 0).length +
    (rangeStart || rangeEnd ? 1 : 0) +
    (searchTerm.length > 0 ? 1 : 0);

  function clearFilters() {
    setMemberFilter([]);
    setCategoryFilter([]);
    setStatusFilter([]);
    setPriorityFilter([]);
    setRangeStart("");
    setRangeEnd("");
    setSearch("");
  }

  function openNew() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function handleSubmit(input: Omit<Task, "id">) {
    if (editingTask) {
      updateTask(editingTask.id, input);
    } else {
      addTask(input);
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (editingTask) deleteTask(editingTask.id);
    setModalOpen(false);
  }

  const dateInputClass =
    "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">時程規劃</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            甘特圖以「負責事項類別」分組，一眼看出每個工作類別由誰負責、進行了多久。表格與甘特圖為同一份任務資料的兩種呈現方式，篩選條件可複選、疊加使用，方便一次比對或聚焦某幾項工作，點擊任一任務即可編輯。
          </p>
        </div>
        <button onClick={openNew} className="btn-primary shrink-0">
          <PlusIcon className="h-4 w-4" />
          新增任務
        </button>
      </div>

      <div className="card space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋任務名稱…"
            className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          />
          <span className="text-xs font-medium text-slate-400">區間</span>
          <input
            type="month"
            value={rangeStart}
            min={fullRange.min}
            max={rangeEnd || fullRange.max}
            onChange={(e) => setRangeStart(e.target.value)}
            className={dateInputClass}
          />
          <span className="text-xs text-slate-400">至</span>
          <input
            type="month"
            value={rangeEnd}
            min={rangeStart || fullRange.min}
            max={fullRange.max}
            onChange={(e) => setRangeEnd(e.target.value)}
            className={dateInputClass}
          />
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              清除篩選（{activeFilterCount}）
            </button>
          )}
        </div>

        <FilterChips
          label="成員"
          selected={memberFilter}
          onToggle={(v) => setMemberFilter((f) => toggleIn(f, v))}
          options={team.map((m) => ({
            value: m.id,
            label: m.name,
            activeClass: `${memberColorClass[m.color]} border-transparent text-white`,
          }))}
        />
        <FilterChips
          label="工作類別"
          selected={categoryFilter}
          onToggle={(v) => setCategoryFilter((f) => toggleIn(f, v))}
          options={usedCategories.map((c) => ({ value: c, label: c }))}
        />
        <FilterChips
          label="狀態"
          selected={statusFilter}
          onToggle={(v) => setStatusFilter((f) => toggleIn(f, v))}
          options={STATUS_OPTIONS.map((s) => ({ value: s, label: statusLabel[s] }))}
        />
        <FilterChips
          label="優先度"
          selected={priorityFilter}
          onToggle={(v) => setPriorityFilter((f) => toggleIn(f, v))}
          options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: priorityLabel[p] }))}
        />

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setView("gantt")}
              aria-label="甘特圖檢視"
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === "gantt"
                  ? "bg-brand-600 text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <GridIcon className="h-4 w-4" />
              甘特圖
            </button>
            <button
              onClick={() => setView("table")}
              aria-label="表格檢視"
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === "table"
                  ? "bg-brand-600 text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <ListIcon className="h-4 w-4" />
              表格
            </button>
          </div>

          <span className="text-xs text-slate-400">
            符合 {tasks.length} / {allTasks.length} 項任務
          </span>

          {isDirty && (
            <button
              onClick={resetToDefault}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="清除你在這個瀏覽器中新增／編輯的內容，還原成預設示範資料"
            >
              <RefreshIcon className="h-3.5 w-3.5" />
              重置為預設資料
            </button>
          )}
        </div>
      </div>

      {view === "gantt" ? (
        <GanttChart
          tasks={tasks}
          team={team}
          snapshotDate={project.snapshotDate}
          onTaskClick={openEdit}
        />
      ) : (
        <TaskTable phases={phases} tasks={tasks} team={team} onEdit={openEdit} />
      )}

      <TaskFormModal
        open={modalOpen}
        phases={phases}
        team={team}
        initial={editingTask}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={editingTask ? handleDelete : undefined}
      />
    </div>
  );
}
