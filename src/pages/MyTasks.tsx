import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";
import { ElapsedDaysChip } from "../components/ElapsedDaysChip";
import { RejectDialog } from "../components/RejectDialog";
import { useTaskCount } from "../context/TaskCountContext";

type IncompleteSubstepInfo = {
  Title: string;
  AssigneeFirstName: string;
  AssigneeLastName: string;
};

type MyStepTask = {
  Id: string;
  ProcessId: string;
  ProcessName: string;
  Position: number;
  Title: string;
  Description: string | null;
  ActionLabel: string;
  CompletionCount: number;
  ActivatedAt: string | null;
  CompletedAt: string | null;
  RejectionNote: string | null;
  TotalSubsteps: number;
  incompleteSubsteps: IncompleteSubstepInfo[];
};

type MySubstepTask = {
  Id: string;
  ProcessStepId: string;
  ProcessId: string;
  ProcessName: string;
  StepTitle: string;
  Title: string;
  Description: string | null;
  ActionLabel: string;
  CompletionCount: number;
  ActivatedAt: string | null;
  CompletedAt: string | null;
  RejectionNote: string | null;
};

export function MyTasks() {
  const { refreshPendingCount } = useTaskCount();
  const [steps, setSteps] = useState<MyStepTask[] | null>(null);
  const [substeps, setSubsteps] = useState<MySubstepTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectStepId, setRejectStepId] = useState<string | null>(null);

  const load = useCallback(() => {
    apiClient
      .get<{ steps: MyStepTask[]; substeps: MySubstepTask[] }>("/my-tasks")
      .then((res) => {
        setSteps(res.data.steps);
        setSubsteps(res.data.substeps);
      })
      .catch((err) =>
        setError(getApiErrorMessage(err, "No se pudieron cargar tus tareas"))
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCompleteStep(stepId: string) {
    setActionError(null);
    setBusyId(stepId);
    try {
      await apiClient.post(`/process-steps/${stepId}/complete`);
      load();
      refreshPendingCount();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo completar el paso"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRejectStep(stepId: string, note: string) {
    setActionError(null);
    setBusyId(stepId);
    try {
      await apiClient.post(`/process-steps/${stepId}/reject`, { note });
      load();
      refreshPendingCount();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo rechazar el paso"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleCompleteSubstep(substepId: string) {
    setActionError(null);
    setBusyId(substepId);
    try {
      await apiClient.post(`/process-substeps/${substepId}/complete`);
      load();
      refreshPendingCount();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo completar el subpaso"));
    } finally {
      setBusyId(null);
    }
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!steps || !substeps) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Mis Tareas
      </Typography>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Pasos
      </Typography>
      {steps.length === 0 && (
        <Typography color="text.secondary">
          No hay nada esperando tu aprobación en este momento.
        </Typography>
      )}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {steps.map((step) => {
          const blocked = step.incompleteSubsteps.length > 0;
          return (
            <Card key={step.Id} variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {step.ProcessName}
                    </Typography>
                    <Typography variant="body1">
                      Paso {step.Position}: {step.Title}
                    </Typography>
                  </Box>
                  <ElapsedDaysChip
                    activatedAt={step.ActivatedAt}
                    completedAt={step.CompletedAt}
                  />
                </Box>
                {step.Description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {step.Description}
                  </Typography>
                )}
                {step.RejectionNote && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <strong>Rechazado:</strong> {step.RejectionNote}
                  </Alert>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={busyId === step.Id || blocked}
                    onClick={() => handleCompleteStep(step.Id)}
                  >
                    {step.ActionLabel}
                  </Button>
                  {step.Position > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled={busyId === step.Id}
                      onClick={() => setRejectStepId(step.Id)}
                    >
                      Rechazar
                    </Button>
                  )}
                </Stack>
                {blocked && (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      Esperando {step.incompleteSubsteps.length} de{" "}
                      {step.TotalSubsteps} subpasos por completar antes de
                      poder aprobar esto:
                    </Typography>
                    <Stack sx={{ pl: 1 }}>
                      {step.incompleteSubsteps.map((sub, i) => (
                        <Typography
                          key={i}
                          variant="caption"
                          color="text.secondary"
                        >
                          • {sub.Title} — {sub.AssigneeFirstName}{" "}
                          {sub.AssigneeLastName}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Subpasos
      </Typography>
      {substeps.length === 0 && (
        <Typography color="text.secondary">
          No hay subpasos esperándote en este momento.
        </Typography>
      )}
      <Stack spacing={2}>
        {substeps.map((substep) => (
          <Card key={substep.Id} variant="outlined">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {substep.ProcessName} · {substep.StepTitle}
                  </Typography>
                  <Typography variant="body1">{substep.Title}</Typography>
                </Box>
                <ElapsedDaysChip
                  activatedAt={substep.ActivatedAt}
                  completedAt={substep.CompletedAt}
                />
              </Box>
              {substep.Description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {substep.Description}
                </Typography>
              )}
              {substep.RejectionNote && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <strong>Rechazado:</strong> {substep.RejectionNote}
                </Alert>
              )}
              <Button
                variant="contained"
                size="small"
                sx={{ mt: 2 }}
                disabled={busyId === substep.Id}
                onClick={() => handleCompleteSubstep(substep.Id)}
              >
                {substep.ActionLabel}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <RejectDialog
        open={rejectStepId !== null}
        title="Rechazar paso"
        description="Esto enviará el proceso de vuelta al paso anterior."
        submitting={false}
        onCancel={() => setRejectStepId(null)}
        onConfirm={(note) => {
          const stepId = rejectStepId;
          setRejectStepId(null);
          if (stepId) handleRejectStep(stepId, note);
        }}
      />
    </Box>
  );
}
