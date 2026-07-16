export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "USER";
};

export type ProcessStatus = "DRAFT" | "ACTIVE" | "COMPLETED";
export type StepStatus = "WAITING" | "PENDING" | "COMPLETED";

export type Process = {
  Id: string;
  Name: string;
  Description: string | null;
  Status: ProcessStatus;
  CurrentStepId: string | null;
  CreatedByUserId: string;
  CreatedAt: string;
  UpdatedAt: string | null;
  StartedAt: string | null;
  CompletedAt: string | null;
};

export type ProcessSubstep = {
  Id: string;
  ProcessStepId: string;
  AssigneeUserId: string;
  AssigneeFirstName: string;
  AssigneeLastName: string;
  AssigneeEmail: string;
  Title: string;
  Description: string | null;
  ActionLabel: string;
  DisplayOrder: number;
  Status: StepStatus;
  CompletionCount: number;
  ActivatedAt: string | null;
  CompletedAt: string | null;
  CompletedByUserId: string | null;
};

export type ProcessStep = {
  Id: string;
  ProcessId: string;
  Position: number;
  AssigneeUserId: string;
  AssigneeFirstName: string;
  AssigneeLastName: string;
  AssigneeEmail: string;
  Title: string;
  Description: string | null;
  ActionLabel: string;
  Status: StepStatus;
  CompletionCount: number;
  ActivatedAt: string | null;
  CompletedAt: string | null;
  CompletedByUserId: string | null;
  substeps: ProcessSubstep[];
};

export type ProcessDetail = {
  process: Process;
  steps: ProcessStep[];
};

export type ProcessEvent = {
  Id: string;
  ProcessId: string;
  ProcessStepId: string | null;
  ProcessSubstepId: string | null;
  ActorUserId: string;
  ActorFirstName: string;
  ActorLastName: string;
  EventType: string;
  Metadata: string | null;
  CreatedAt: string;
};
