"use client";

import type { ReactNode } from "react";
import { TaskStoreProvider } from "@/lib/task-store";

export default function Providers({ children }: { children: ReactNode }) {
  return <TaskStoreProvider>{children}</TaskStoreProvider>;
}
