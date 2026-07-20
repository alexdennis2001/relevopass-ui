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
import { SaveTemplateDialog } from "../components/SaveTemplateDialog";
import { processStatusLabels, stepStatusLabels } from "../lib/labels";
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
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateMessage, setTemplateMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    apiClient
      .get<ProcessDetailType>(`/processes/${id}`)
      .then((res) => setDetail(res.data))
      .catch((err) =>
        setLoadError(getApiErrorMessage(err, "No se pudo cargar el proceso"))
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
      setActionError(getApiErrorMessage(err, "No se pudo iniciar el proceso"));
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
      setActionError(getApiErrorMessage(err, "No se pudo completar el paso"));
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
      setActionError(getApiErrorMessage(err, "No se pudo rechazar el paso"));
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
      setActionError(getApiErrorMessage(err, "No se pudo completar el subproceso"));
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
      setActionError(getApiErrorMessage(err, "No se pudo rechazar el subproceso"));
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

  async function handleSaveTemplate(name: string) {
    if (!id) return;
    setSavingTemplate(true);
    setActionError(null);
    try {
      await apiClient.post("/process-templates", { processId: id, name });
      setSaveTemplateOpen(false);
      setTemplateMessage(`Se guardó como plantilla "${name}".`);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "No se pudo guardar la plantilla"));
    } finally {
      setSavingTemplate(false);
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
            label={processStatusLabels[process.Status]}
            color={processStatusColor[process.Status]}
          />
          {process.Status === "DRAFT" && user?.role === "ADMIN" && (
            <>
              <Button
                variant="outlined"
                onClick={() => navigate(`/processes/${id}/edit`)}
              >
                Editar Proceso
              </Button>
              <Button variant="contained" onClick={handleStart} disabled={starting}>
                {starting ? "Iniciando..." : "Iniciar Proceso"}
              </Button>
            </>
          )}
          {process.CreatedByUserId === user?.id && user?.role === "ADMIN" && (
            <Button
              variant="outlined"
              onClick={() => setSaveTemplateOpen(true)}
            >
              Guardar como Plantilla
            </Button>
          )}
        </Stack>
      </Box>

      {templateMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setTemplateMessage(null)}
        >
          {templateMessage}
        </Alert>
      )}

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
        Ver historial de eventos
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
                  Paso {step.Position}: {step.Title}
                  {process.CurrentStepId === step.Id && (
                    <Chip
                      label="Actual"
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
                    label={stepStatusLabels[step.Status]}
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
                Asignado: {step.AssigneeFirstName} {step.AssigneeLastName} (
                {step.AssigneeEmail})
              </Typography>

              {step.RejectionNote && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <strong>Rechazado:</strong> {step.RejectionNote}
                </Alert>
              )}

              {step.substeps.length > 0 && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Subprocesos
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
                                  Rechazar
                                </Button>
                              )}
                            <ElapsedDaysChip
                              activatedAt={substep.ActivatedAt}
                              completedAt={substep.CompletedAt}
                            />
                            <Chip
                              label={stepStatusLabels[substep.Status]}
                              size="small"
                              color={stepStatusColor[substep.Status]}
                            />
                          </Stack>
                        </Box>
                        {substep.RejectionNote && (
                          <Alert severity="warning" sx={{ mt: 0.5 }}>
                            <strong>Rechazado:</strong> {substep.RejectionNote}
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
                          Rechazar
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
                        Primero deben completarse todos los subprocesos.
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
          rejectTarget?.type === "step"
            ? "Rechazar paso"
            : "Rechazar subproceso"
        }
        description={
          rejectTarget?.type === "step"
            ? "Esto enviará el proceso de vuelta al paso anterior."
            : "Esto enviará el subproceso de vuelta a su asignado."
        }
        submitting={
          rejectTarget !== null && actioningId === rejectTarget.id
        }
        onCancel={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
      />

      <SaveTemplateDialog
        open={saveTemplateOpen}
        submitting={savingTemplate}
        onCancel={() => setSaveTemplateOpen(false)}
        onConfirm={handleSaveTemplate}
      />
    </Box>
  );
}
