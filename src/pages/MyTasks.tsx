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
};

export function MyTasks() {
  const [steps, setSteps] = useState<MyStepTask[] | null>(null);
  const [substeps, setSubsteps] = useState<MySubstepTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    apiClient
      .get<{ steps: MyStepTask[]; substeps: MySubstepTask[] }>("/my-tasks")
      .then((res) => {
        setSteps(res.data.steps);
        setSubsteps(res.data.substeps);
      })
      .catch((err) =>
        setError(getApiErrorMessage(err, "Could not load your tasks"))
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
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not complete step"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRejectStep(stepId: string) {
    setActionError(null);
    setBusyId(stepId);
    try {
      await apiClient.post(`/process-steps/${stepId}/reject`);
      load();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not reject step"));
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
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not complete subprocess"));
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
        My Tasks
      </Typography>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Steps
      </Typography>
      {steps.length === 0 && (
        <Typography color="text.secondary">
          Nothing waiting on your approval right now.
        </Typography>
      )}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {steps.map((step) => {
          const blocked = step.incompleteSubsteps.length > 0;
          return (
            <Card key={step.Id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {step.ProcessName}
                </Typography>
                <Typography variant="body1">
                  Step {step.Position}: {step.Title}
                </Typography>
                {step.Description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {step.Description}
                  </Typography>
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
                      onClick={() => handleRejectStep(step.Id)}
                    >
                      Reject
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
                      Waiting on {step.incompleteSubsteps.length} of{" "}
                      {step.TotalSubsteps} subprocesses to be completed
                      before this can be approved:
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
        Subprocesses
      </Typography>
      {substeps.length === 0 && (
        <Typography color="text.secondary">
          No subprocesses waiting on you right now.
        </Typography>
      )}
      <Stack spacing={2}>
        {substeps.map((substep) => (
          <Card key={substep.Id} variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {substep.ProcessName} · {substep.StepTitle}
              </Typography>
              <Typography variant="body1">{substep.Title}</Typography>
              {substep.Description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {substep.Description}
                </Typography>
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
    </Box>
  );
}
