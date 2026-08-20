"use client";

import { useState } from "react";
import TeamMemberCard from "@/components/TeamMemberCard";
import WorkloadChart from "@/components/WorkloadChart";
import MemberFormModal from "@/components/MemberFormModal";
import { tasksByAssignee, workloadByMember } from "@/lib/compute";
import { useTaskStore } from "@/lib/task-store";
import { useTeamStore } from "@/lib/team-store";
import type { TeamMember } from "@/lib/types";
import { PlusIcon, RefreshIcon } from "@/lib/icons";

export default function TeamPage() {
  const { team, isDirty, addMember, updateMember, deleteMember, resetToDefault } = useTeamStore();
  const { tasks } = useTaskStore();
  const workload = workloadByMember(tasks, team);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  function openNew() {
    setEditingMember(null);
    setModalOpen(true);
  }

  function openEdit(member: TeamMember) {
    setEditingMember(member);
    setModalOpen(true);
  }

  function handleSubmit(input: Omit<TeamMember, "id">) {
    if (editingMember) {
      updateMember(editingMember.id, input);
    } else {
      addMember(input);
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (editingMember) deleteMember(editingMember.id);
    setModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">團隊面板</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            4 人小組，我是負責人並統籌所有面向；其餘 3 位夥伴各自負責明確的責任範圍。人員異動時可直接在這裡新增／編輯／移除成員。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {isDirty && (
            <button
              onClick={resetToDefault}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="清除你在這個瀏覽器中新增／編輯的成員，還原成預設示範資料"
            >
              <RefreshIcon className="h-3.5 w-3.5" />
              重置為預設資料
            </button>
          )}
          <button onClick={openNew} className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            新增成員
          </button>
        </div>
      </div>

      <WorkloadChart workload={workload} />

      <div className="grid gap-4 md:grid-cols-2">
        {team.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            tasks={tasksByAssignee(tasks, member.id)}
            onEdit={openEdit}
          />
        ))}
      </div>

      <MemberFormModal
        open={modalOpen}
        team={team}
        initial={editingMember}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={editingMember ? handleDelete : undefined}
      />
    </div>
  );
}
