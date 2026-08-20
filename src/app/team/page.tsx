"use client";

import { useMemo } from "react";
import TeamMemberCard from "@/components/TeamMemberCard";
import WorkloadChart from "@/components/WorkloadChart";
import { getTeam } from "@/lib/data-provider";
import { tasksByAssignee, workloadByMember } from "@/lib/compute";
import { useTaskStore } from "@/lib/task-store";

export default function TeamPage() {
  const team = useMemo(() => getTeam(), []);
  const { tasks } = useTaskStore();
  const workload = workloadByMember(tasks, team);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">團隊面板</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          4 人小組，我是負責人並統籌所有面向；其餘 3 位夥伴各自負責明確的責任範圍。
        </p>
      </div>

      <WorkloadChart workload={workload} />

      <div className="grid gap-4 md:grid-cols-2">
        {team.map((member) => (
          <TeamMemberCard key={member.id} member={member} tasks={tasksByAssignee(tasks, member.id)} />
        ))}
      </div>
    </div>
  );
}
