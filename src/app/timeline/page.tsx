"use client";

import { useMemo, useState } from "react";
import GanttChart from "@/components/GanttChart";
import TaskTable from "@/components/TaskTable";
import TaskFormModal from "@/components/TaskFormModal";
import { getPhases, getProject, getTeam } from "@/lib/data-provider";
import { useTaskStore } from "@/lib/task-store";
import type { Task } from "@/lib/types";
import { GridIcon, ListIcon, PlusIcon, RefreshIcon } from "@/lib/icons";

type ViewMode = "gantt" | "table";

export default function TimelinePage() {
  const [view, setView] = useState<ViewMode>("gantt");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { tasks: allTasks, isDirty, addTask, updateTask, deleteTask, resetToDefault } =
    useTaskStore();

  const project = useMemo(() => getProject(), []);
  const phases = useMemo(() => getPhases(), []);
  const team = useMemo(() => getTeam(), []);

  const tasks = allTasks.filter((t) => {
    if (phaseFilter !== "all" && t.phaseId !== phaseFilter) return false;
    if (memberFilter !== "all" && !t.assigneeIds.includes(memberFilter)) return false;
    return true;
  });

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">時程規劃</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            甘特圖以「負責事項類別」分組，一眼看出每個工作類別由誰負責、進行了多久。表格與甘特圖為同一份任務資料的兩種呈現方式，點擊任一任務即可編輯。
          </p>
        </div>
        <button onClick={openNew} className="btn-primary shrink-0">
          <PlusIcon className="h-4 w-4" />
          新增任務
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="all">所有年度階段</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="all">所有成員</option>
          {team.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

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

        <span className="text-xs text-slate-400">共 {tasks.length} 項任務</span>

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
