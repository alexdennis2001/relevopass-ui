import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { apiClient } from "../lib/apiClient";
import { useAuth } from "./AuthContext";

type TaskCountContextValue = {
  pendingCount: number;
  refreshPendingCount: () => void;
};

const TaskCountContext = createContext<TaskCountContextValue | null>(null);

export function TaskCountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(() => {
    if (!user) {
      setPendingCount(0);
      return;
    }
    apiClient
      .get<{
        steps: { incompleteSubsteps: unknown[] }[];
        substeps: unknown[];
      }>("/my-tasks")
      .then((res) => {
        // A step blocked on incomplete subprocesses isn't actually
        // actionable yet, so it shouldn't count towards the badge — it
        // still shows in the My Tasks list itself, just not counted here.
        const readySteps = res.data.steps.filter(
          (step) => step.incompleteSubsteps.length === 0
        );
        setPendingCount(readySteps.length + res.data.substeps.length);
      })
      .catch(() => setPendingCount(0));
  }, [user]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  return (
    <TaskCountContext.Provider value={{ pendingCount, refreshPendingCount }}>
      {children}
    </TaskCountContext.Provider>
  );
}

export function useTaskCount() {
  const ctx = useContext(TaskCountContext);
  if (!ctx) {
    throw new Error("useTaskCount must be used within a TaskCountProvider");
  }
  return ctx;
}
