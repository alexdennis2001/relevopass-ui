import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";
import { useAuth } from "../context/AuthContext";
import { emptyStep, StepsEditor } from "../components/StepsEditor";
import type { StepForm } from "../components/StepsEditor";
import type { ProcessDetail, PublicUser } from "../types/process";
import type {
  ProcessTemplateDetail,
  ProcessTemplateSummary,
} from "../types/template";

export function CreateProcess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [templates, setTemplates] = useState<ProcessTemplateSummary[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<StepForm[]>([emptyStep()]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get<PublicUser[]>("/users").then((res) => setUsers(res.data));
    if (user?.role === "ADMIN") {
      apiClient
        .get<ProcessTemplateSummary[]>("/process-templates")
        .then((res) => setTemplates(res.data));
    }
  }, [user?.role]);

  async function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setSteps([emptyStep()]);
      return;
    }
    setError(null);
    setLoadingTemplate(true);
    try {
      const res = await apiClient.get<ProcessTemplateDetail>(
        `/process-templates/${templateId}`
      );
      setSteps(
        res.data.steps.map((step) => ({
          _key: crypto.randomUUID(),
          title: step.Title,
          description: step.Description ?? "",
          assigneeUserId: step.AssigneeUserId,
          substeps: step.substeps.map((substep) => ({
            _key: crypto.randomUUID(),
            title: substep.Title,
            description: substep.Description ?? "",
            assigneeUserId: substep.AssigneeUserId,
          })),
        }))
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo cargar la plantilla"));
    } finally {
      setLoadingTemplate(false);
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiClient.post<ProcessDetail>("/processes", {
        name,
        description: description || undefined,
        steps: steps.map((step) => ({
          title: step.title,
          description: step.description || undefined,
          assigneeUserId: step.assigneeUserId,
          substeps: step.substeps.map((substep) => ({
            title: substep.title,
            description: substep.description || undefined,
            assigneeUserId: substep.assigneeUserId,
          })),
        })),
      });
      navigate(`/processes/${res.data.process.Id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo crear el proceso"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" component="h1" gutterBottom>
        Crear Proceso
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {templates.length > 0 && (
        <TextField
          select
          label="Comenzar desde una plantilla"
          value={selectedTemplateId}
          onChange={(e) => handleTemplateChange(e.target.value)}
          fullWidth
          disabled={loadingTemplate}
          helperText="Rellena los pasos, subpasos y asignados a continuación. El nombre y la descripción todavía deben completarse."
          sx={{ mb: 3 }}
        >
          <MenuItem value="">Ninguna</MenuItem>
          {templates.map((template) => (
            <MenuItem key={template.Id} value={template.Id}>
              {template.Name}
            </MenuItem>
          ))}
        </TextField>
      )}

      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Nombre del proceso"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={2}
        />
      </Stack>

      <StepsEditor steps={steps} onChange={setSteps} users={users} />

      <Box sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
        >
          {submitting ? "Creando..." : "Crear Proceso"}
        </Button>
      </Box>
    </Box>
  );
}
