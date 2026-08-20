"use client";

import { useMemo, useState } from "react";
import GanttChart from "@/components/GanttChart";
import TaskTable from "@/components/TaskTable";
import TaskFormModal from "@/components/TaskFormModal";
import { getPhases, getProject, getTeam } from "@/lib/data-provider";
import { useTaskStore } from "@/lib/task-store";
import type { Priority, Task, TaskStatus } from "@/lib/types";
import { categoryOrder, priorityLabel, statusLabel } from "@/lib/ui";
import { GridIcon, ListIcon, PlusIcon, RefreshIcon } from "@/lib/icons";

type ViewMode = "gantt" | "table";

const statusOptions: TaskStatus[] = ["done", "in-progress", "todo", "blocked"];
const priorityOptions: Priority[] = ["high", "medium", "low"];

export default function TimelinePage() {
  const [view, setView] = useState<ViewMode>("gantt");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { tasks: allTasks, isDirty, addTask, updateTask, deleteTask, resetToDefault } =
    useTaskStore();

  const project = useMemo(() => getProject(), []);
  const phases = useMemo(() => getPhases(), []);
  const team = useMemo(() => getTeam(), []);

  const usedCategories = categoryOrder.filter((c) => allTasks.some((t) => t.category === c));
  const searchTerm = search.trim().toLowerCase();

  const tasks = allTasks.filter((t) => {
    if (phaseFilter !== "all" && t.phaseId !== phaseFilter) return false;
    if (memberFilter !== "all" && !t.assigneeIds.includes(memberFilter)) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm)) return false;
    return true;
  });

  const activeFilterCount = [
    phaseFilter !== "all",
    memberFilter !== "all",
    categoryFilter !== "all",
    statusFilter !== "all",
    priorityFilter !== "all",
    searchTerm.length > 0,
  ].filter(Boolean).length;

  function clearFilters() {
    setPhaseFilter("all");
    setMemberFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPriorityFilter("all");
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

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">時程規劃</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            甘特圖以「負責事項類別」分組，一眼看出每個工作類別由誰負責、進行了多久。表格與甘特圖為同一份任務資料的兩種呈現方式，用下方篩選器縮小範圍，點擊任一任務即可編輯。
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
          <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)} className={selectClass}>
            <option value="all">所有年度階段</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} className={selectClass}>
            <option value="all">所有成員</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">所有工作類別</option>
            {usedCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="all">所有狀態</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">所有優先度</option>
            {priorityOptions.map((p) => (
              <option key={p} value={p}>
                {priorityLabel[p]}
              </option>
            ))}
          </select>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              清除篩選（{activeFilterCount}）
            </button>
          )}
        </div>

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
