import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";
import { StepsEditor } from "../components/StepsEditor";
import type { StepForm, SubstepForm } from "../components/StepsEditor";
import type {
  ProcessDetail as ProcessDetailType,
  ProcessStep,
  PublicUser,
} from "../types/process";

function toSubstepForm(substep: ProcessStep["substeps"][number]): SubstepForm {
  return {
    _key: substep.Id,
    id: substep.Id,
    title: substep.Title,
    description: substep.Description ?? "",
    assigneeUserId: substep.AssigneeUserId,
  };
}

function toStepForm(step: ProcessStep): StepForm {
  return {
    _key: step.Id,
    id: step.Id,
    title: step.Title,
    description: step.Description ?? "",
    assigneeUserId: step.AssigneeUserId,
    substeps: step.substeps.map(toSubstepForm),
  };
}

export function EditProcess() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [steps, setSteps] = useState<StepForm[] | null>(null);
  const [status, setStatus] = useState<ProcessDetailType["process"]["Status"] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient
      .get<ProcessDetailType>(`/processes/${id}`)
      .then((res) => {
        setStatus(res.data.process.Status);
        setSteps(res.data.steps.map(toStepForm));
      })
      .catch((err) =>
        setLoadError(getApiErrorMessage(err, "No se pudo cargar el proceso"))
      );
    apiClient.get<PublicUser[]>("/users").then((res) => setUsers(res.data));
  }, [id]);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!id || !steps) return;
    setError(null);
    setSubmitting(true);
    try {
      await apiClient.put(`/processes/${id}/steps`, {
        steps: steps.map((step) => ({
          id: step.id,
          title: step.title,
          description: step.description || undefined,
          assigneeUserId: step.assigneeUserId,
          substeps: step.substeps.map((substep) => ({
            id: substep.id,
            title: substep.title,
            description: substep.description || undefined,
            assigneeUserId: substep.assigneeUserId,
          })),
        })),
      });
      navigate(`/processes/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron guardar los cambios"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  if (!steps || !status) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status !== "DRAFT") {
    return (
      <Alert severity="error">Solo se puede editar un proceso en borrador.</Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" component="h1" gutterBottom>
        Editar Pasos del Proceso
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <StepsEditor steps={steps} onChange={setSteps} users={users} />

      <Box sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
        >
          {submitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </Box>
    </Box>
  );
}
