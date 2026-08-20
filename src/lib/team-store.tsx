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
import type { TeamMember } from "@/lib/types";
import { getTeam } from "@/lib/data-provider";
import { memberColorOptions } from "@/lib/ui";

const STORAGE_KEY = "revoice-hub:team:v1";

export type NewMemberInput = Omit<TeamMember, "id">;

interface TeamStoreValue {
  team: TeamMember[];
  isDirty: boolean;
  addMember: (input: NewMemberInput) => void;
  updateMember: (id: string, input: NewMemberInput) => void;
  deleteMember: (id: string) => void;
  resetToDefault: () => void;
}

const TeamStoreContext = createContext<TeamStoreValue | null>(null);

function loadFromStorage(): TeamMember[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as TeamMember[];
  } catch {
    return null;
  }
}

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "member";
}

function nextId(team: TeamMember[], name: string): string {
  const base = slugify(name);
  const existing = new Set(team.map((m) => m.id));
  if (!existing.has(base)) return base;
  let n = 2;
  while (existing.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** Picks the first palette color not already in use, cycling once everyone's taken. */
export function nextMemberColor(team: TeamMember[]): string {
  const used = new Set(team.map((m) => m.color));
  return memberColorOptions.find((c) => !used.has(c)) ?? memberColorOptions[team.length % memberColorOptions.length]!;
}

export function TeamStoreProvider({ children }: { children: ReactNode }) {
  const defaultTeam = useMemo(() => getTeam(), []);
  const [team, setTeam] = useState<TeamMember[]>(defaultTeam);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setTeam(stored);
      setIsDirty(true);
    }
    setHydrated(true);
  }, []);

  // Same "only persist while dirty" rule as TaskStore — see task-store.tsx
  // for why unconditional writes would pin the browser to a stale snapshot.
  useEffect(() => {
    if (!hydrated) return;
    if (!isDirty) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
  }, [team, isDirty, hydrated]);

  const addMember = useCallback((input: NewMemberInput) => {
    setTeam((prev) => [...prev, { ...input, id: nextId(prev, input.name) }]);
    setIsDirty(true);
  }, []);

  const updateMember = useCallback((id: string, input: NewMemberInput) => {
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...input, id } : m)));
    setIsDirty(true);
  }, []);

  const deleteMember = useCallback((id: string) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
    setIsDirty(true);
  }, []);

  const resetToDefault = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setTeam(defaultTeam);
    setIsDirty(false);
  }, [defaultTeam]);

  const value = useMemo(
    () => ({ team, isDirty, addMember, updateMember, deleteMember, resetToDefault }),
    [team, isDirty, addMember, updateMember, deleteMember, resetToDefault],
  );

  return <TeamStoreContext.Provider value={value}>{children}</TeamStoreContext.Provider>;
}

export function useTeamStore(): TeamStoreValue {
  const ctx = useContext(TeamStoreContext);
  if (!ctx) throw new Error("useTeamStore must be used within a TeamStoreProvider");
  return ctx;
}
