"use client";

import type { ReactNode } from "react";
import { TaskStoreProvider } from "@/lib/task-store";
import { TeamStoreProvider } from "@/lib/team-store";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <TeamStoreProvider>
      <TaskStoreProvider>{children}</TaskStoreProvider>
    </TeamStoreProvider>
  );
}
