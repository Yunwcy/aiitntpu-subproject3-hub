"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Task } from "@/lib/types";
import { getTasks } from "@/lib/data-provider";
import { sortTasks } from "@/lib/compute";

const STORAGE_KEY = "revoice-hub:tasks:v1";

export type NewTaskInput = Omit<Task, "id">;

interface TaskStoreValue {
  tasks: Task[];
  isDirty: boolean;
  addTask: (input: NewTaskInput) => void;
  updateTask: (id: string, input: NewTaskInput) => void;
  deleteTask: (id: string) => void;
  resetToDefault: () => void;
}

const TaskStoreContext = createContext<TaskStoreValue | null>(null);

function loadFromStorage(): Task[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Task[];
  } catch {
    return null;
  }
}

function nextId(tasks: Task[]): string {
  let n = tasks.length + 1;
  const existing = new Set(tasks.map((t) => t.id));
  while (existing.has(`local-${n}`)) n += 1;
  return `local-${n}`;
}

export function TaskStoreProvider({ children }: { children: ReactNode }) {
  const defaultTasks = useMemo(() => getTasks(), []);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR/client markup mismatch).
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setTasks(stored);
      setIsDirty(true);
    }
    setHydrated(true);
  }, []);

  // Only persist while there are actual local edits. If we wrote on every
  // change unconditionally, a reset would immediately re-save a frozen
  // snapshot of "default" tasks — silently pinning the browser to whatever
  // the seed data looked like at that moment, even after later updates to
  // the underlying data file. Keeping storage empty whenever !isDirty means
  // "no override" always means "use the latest seed data".
  useEffect(() => {
    if (!hydrated) return;
    if (!isDirty) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, isDirty, hydrated]);

  const addTask = useCallback((input: NewTaskInput) => {
    setTasks((prev) => {
      const id = nextId(prev);
      return sortTasks([...prev, { ...input, id }]);
    });
    setIsDirty(true);
  }, []);

  const updateTask = useCallback((id: string, input: NewTaskInput) => {
    setTasks((prev) => sortTasks(prev.map((t) => (t.id === id ? { ...input, id } : t))));
    setIsDirty(true);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setIsDirty(true);
  }, []);

  const resetToDefault = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setTasks(defaultTasks);
    setIsDirty(false);
  }, [defaultTasks]);

  const value = useMemo(
    () => ({ tasks, isDirty, addTask, updateTask, deleteTask, resetToDefault }),
    [tasks, isDirty, addTask, updateTask, deleteTask, resetToDefault],
  );

  return <TaskStoreContext.Provider value={value}>{children}</TaskStoreContext.Provider>;
}

export function useTaskStore(): TaskStoreValue {
  const ctx = useContext(TaskStoreContext);
  if (!ctx) throw new Error("useTaskStore must be used within a TaskStoreProvider");
  return ctx;
}
