import type { ProcessStatus, StepStatus } from "../types/process";

export const processStatusLabels: Record<ProcessStatus, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  COMPLETED: "Completado",
};

export const stepStatusLabels: Record<StepStatus, string> = {
  WAITING: "En espera",
  PENDING: "Pendiente",
  COMPLETED: "Completado",
};

export const userRoleLabels: Record<"ADMIN" | "USER", string> = {
  ADMIN: "Administrador",
  USER: "Usuario",
};