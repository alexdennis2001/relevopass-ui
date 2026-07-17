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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";
import { useAuth } from "../context/AuthContext";
import { ElapsedDaysChip } from "../components/ElapsedDaysChip";
import { RejectDialog } from "../components/RejectDialog";
import type {
  ProcessDetail as ProcessDetailType,
  ProcessStatus,
  StepStatus,
} from "../types/process";

type RejectTarget = { type: "step" | "substep"; id: string };

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [detail, setDetail] = useState<ProcessDetailType | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    apiClient
      .get<ProcessDetailType>(`/processes/${id}`)
      .then((res) => setDetail(res.data))
      .catch((err) =>
        setLoadError(getApiErrorMessage(err, "Could not load process"))
      );
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStart() {
    if (!id) return;
    setActionError(null);
    setStarting(true);
    try {
      const res = await apiClient.post<ProcessDetailType>(
        `/processes/${id}/start`
      );
      setDetail(res.data);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not start process"));
    } finally {
      setStarting(false);
    }
  }

  async function handleCompleteStep(stepId: string) {
    setActionError(null);
    setActioningId(stepId);
    try {
      const res = await apiClient.post<ProcessDetailType>(
        `/process-steps/${stepId}/complete`
      );
      setDetail(res.data);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not complete step"));
    } finally {
      setActioningId(null);
    }
  }

  async function handleRejectStep(stepId: string, note: string) {
    setActionError(null);
    setActioningId(stepId);
    try {
      const res = await apiClient.post<ProcessDetailType>(
        `/process-steps/${stepId}/reject`,
        { note }
      );
      setDetail(res.data);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not reject step"));
    } finally {
      setActioningId(null);
    }
  }

  async function handleCompleteSubstep(substepId: string) {
    setActionError(null);
    setActioningId(substepId);
    try {
      const res = await apiClient.post<ProcessDetailType>(
        `/process-substeps/${substepId}/complete`
      );
      setDetail(res.data);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not complete subprocess"));
    } finally {
      setActioningId(null);
    }
  }

  async function handleRejectSubstep(substepId: string, note: string) {
    setActionError(null);
    setActioningId(substepId);
    try {
      const res = await apiClient.post<ProcessDetailType>(
        `/process-substeps/${substepId}/reject`,
        { note }
      );
      setDetail(res.data);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not reject subprocess"));
    } finally {
      setActioningId(null);
    }
  }

  async function handleConfirmReject(note: string) {
    if (!rejectTarget) return;
    setRejectTarget(null);
    if (rejectTarget.type === "step") {
      await handleRejectStep(rejectTarget.id, note);
    } else {
      await handleRejectSubstep(rejectTarget.id, note);
    }
  }

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
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
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "flex-start" },
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" component="h1">
            {process.Name}
          </Typography>
          {process.Description && (
            <Typography variant="body2" color="text.secondary">
              {process.Description}
            </Typography>
          )}
        </Box>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
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

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      <Stepper
        activeStep={activeStepIndex}
        orientation={isMobile ? "vertical" : "horizontal"}
        alternativeLabel={!isMobile}
        sx={{ mb: 3 }}
      >
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
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
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
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ alignItems: "center", flexWrap: "wrap" }}
                >
                  <ElapsedDaysChip
                    activatedAt={step.ActivatedAt}
                    completedAt={step.CompletedAt}
                  />
                  <Chip
                    label={step.Status}
                    size="small"
                    color={stepStatusColor[step.Status]}
                  />
                </Stack>
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

              {step.RejectionNote && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <strong>Rejected:</strong> {step.RejectionNote}
                </Alert>
              )}

              {step.substeps.length > 0 && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Subprocesses
                  </Typography>
                  <Stack spacing={1}>
                    {step.substeps.map((substep) => (
                      <Box key={substep.Id} sx={{ pl: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2">
                            {substep.Title} — {substep.AssigneeFirstName}{" "}
                            {substep.AssigneeLastName}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            sx={{ alignItems: "center", flexWrap: "wrap" }}
                          >
                            {substep.Status === "PENDING" &&
                              substep.AssigneeUserId === user?.id && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  disabled={actioningId === substep.Id}
                                  onClick={() =>
                                    handleCompleteSubstep(substep.Id)
                                  }
                                >
                                  {substep.ActionLabel}
                                </Button>
                              )}
                            {substep.Status === "COMPLETED" &&
                              step.AssigneeUserId === user?.id &&
                              process.CurrentStepId === step.Id && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  disabled={actioningId === substep.Id}
                                  onClick={() =>
                                    setRejectTarget({
                                      type: "substep",
                                      id: substep.Id,
                                    })
                                  }
                                >
                                  Reject
                                </Button>
                              )}
                            <ElapsedDaysChip
                              activatedAt={substep.ActivatedAt}
                              completedAt={substep.CompletedAt}
                            />
                            <Chip
                              label={substep.Status}
                              size="small"
                              color={stepStatusColor[substep.Status]}
                            />
                          </Stack>
                        </Box>
                        {substep.RejectionNote && (
                          <Alert severity="warning" sx={{ mt: 0.5 }}>
                            <strong>Rejected:</strong> {substep.RejectionNote}
                          </Alert>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </>
              )}

              {process.Status === "ACTIVE" &&
                process.CurrentStepId === step.Id &&
                step.AssigneeUserId === user?.id && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      sx={{ flexWrap: "wrap" }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        disabled={
                          actioningId === step.Id ||
                          step.substeps.some(
                            (sub) => sub.Status !== "COMPLETED"
                          )
                        }
                        onClick={() => handleCompleteStep(step.Id)}
                      >
                        {step.ActionLabel}
                      </Button>
                      {step.Position > 1 && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          disabled={actioningId === step.Id}
                          onClick={() =>
                            setRejectTarget({ type: "step", id: step.Id })
                          }
                        >
                          Reject
                        </Button>
                      )}
                    </Stack>
                    {step.substeps.some(
                      (sub) => sub.Status !== "COMPLETED"
                    ) && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        All subprocesses must be completed first.
                      </Typography>
                    )}
                  </>
                )}
            </CardContent>
          </Card>
        ))}
      </Stack>

      <RejectDialog
        open={rejectTarget !== null}
        title={
          rejectTarget?.type === "step" ? "Reject step" : "Reject subprocess"
        }
        description={
          rejectTarget?.type === "step"
            ? "This will send the process back to the previous step. Let the previous assignee know what needs to be fixed."
            : "This will send the subprocess back to its assignee. Let them know what needs to be fixed."
        }
        submitting={
          rejectTarget !== null && actioningId === rejectTarget.id
        }
        onCancel={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
      />
    </Box>
  );
}
