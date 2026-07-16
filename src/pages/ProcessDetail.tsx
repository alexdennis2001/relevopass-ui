import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";
import { useAuth } from "../context/AuthContext";
import type {
  ProcessDetail as ProcessDetailType,
  ProcessStatus,
  StepStatus,
} from "../types/process";

const processStatusColor: Record<
  ProcessStatus,
  "default" | "info" | "success"
> = {
  DRAFT: "default",
  ACTIVE: "info",
  COMPLETED: "success",
};

const stepStatusColor: Record<StepStatus, "default" | "warning" | "success"> = {
  WAITING: "default",
  PENDING: "warning",
  COMPLETED: "success",
};

export function ProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [detail, setDetail] = useState<ProcessDetailType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    apiClient
      .get<ProcessDetailType>(`/processes/${id}`)
      .then((res) => setDetail(res.data))
      .catch((err) =>
        setError(getApiErrorMessage(err, "Could not load process"))
      );
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStart() {
    if (!id) return;
    setStarting(true);
    try {
      const res = await apiClient.post<ProcessDetailType>(
        `/processes/${id}/start`
      );
      setDetail(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not start process"));
    } finally {
      setStarting(false);
    }
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!detail) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { process, steps } = detail;
  const activeStepIndex = steps.findIndex(
    (step) => step.Id === process.CurrentStepId
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" component="h1">
            {process.Name}
          </Typography>
          {process.Description && (
            <Typography variant="body2" color="text.secondary">
              {process.Description}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Chip
            label={process.Status}
            color={processStatusColor[process.Status]}
          />
          {process.Status === "DRAFT" && user?.role === "ADMIN" && (
            <>
              <Button
                variant="outlined"
                onClick={() => navigate(`/processes/${id}/edit`)}
              >
                Edit Process
              </Button>
              <Button variant="contained" onClick={handleStart} disabled={starting}>
                {starting ? "Starting..." : "Start Process"}
              </Button>
            </>
          )}
        </Stack>
      </Box>

      <Stepper activeStep={activeStepIndex} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((step) => (
          <Step key={step.Id} completed={step.Status === "COMPLETED"}>
            <StepLabel
              optional={
                <Typography variant="caption">
                  {step.AssigneeFirstName} {step.AssigneeLastName}
                </Typography>
              }
            >
              {step.Title}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Link
        component={RouterLink}
        to={`/processes/${id}/events`}
        sx={{ display: "inline-block", mb: 2 }}
      >
        View event history
      </Link>

      <Stack spacing={2}>
        {steps.map((step) => (
          <Card
            key={step.Id}
            variant="outlined"
            sx={{
              borderColor:
                process.CurrentStepId === step.Id ? "primary.main" : undefined,
              borderWidth: process.CurrentStepId === step.Id ? 2 : undefined,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1">
                  Step {step.Position}: {step.Title}
                  {process.CurrentStepId === step.Id && (
                    <Chip
                      label="Current"
                      size="small"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
                <Chip
                  label={step.Status}
                  size="small"
                  color={stepStatusColor[step.Status]}
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
              <Typography variant="body2" sx={{ mt: 1 }}>
                Assignee: {step.AssigneeFirstName} {step.AssigneeLastName} (
                {step.AssigneeEmail})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Action: {step.ActionLabel} · Completed {step.CompletionCount}x
              </Typography>

              {step.substeps.length > 0 && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Subprocesses
                  </Typography>
                  <Stack spacing={1}>
                    {step.substeps.map((substep) => (
                      <Box
                        key={substep.Id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pl: 1,
                        }}
                      >
                        <Typography variant="body2">
                          {substep.Title} — {substep.AssigneeFirstName}{" "}
                          {substep.AssigneeLastName}
                        </Typography>
                        <Chip
                          label={substep.Status}
                          size="small"
                          color={stepStatusColor[substep.Status]}
                        />
                      </Box>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
