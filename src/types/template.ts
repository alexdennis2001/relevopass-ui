export type ProcessTemplateSummary = {
  Id: string;
  Name: string;
  CreatedByUserId: string;
  CreatedAt: string;
};

export type ProcessTemplateSubstep = {
  Id: string;
  ProcessTemplateStepId: string;
  AssigneeUserId: string;
  AssigneeFirstName: string;
  AssigneeLastName: string;
  AssigneeEmail: string;
  Title: string;
  Description: string | null;
  ActionLabel: string;
  DisplayOrder: number;
};

export type ProcessTemplateStep = {
  Id: string;
  ProcessTemplateId: string;
  Position: number;
  AssigneeUserId: string;
  AssigneeFirstName: string;
  AssigneeLastName: string;
  AssigneeEmail: string;
  Title: string;
  Description: string | null;
  ActionLabel: string;
  substeps: ProcessTemplateSubstep[];
};

export type ProcessTemplateDetail = {
  template: ProcessTemplateSummary;
  steps: ProcessTemplateStep[];
};
