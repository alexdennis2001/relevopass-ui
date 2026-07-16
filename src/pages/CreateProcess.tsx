import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";
import { emptyStep, StepsEditor } from "../components/StepsEditor";
import type { StepForm } from "../components/StepsEditor";
import type { ProcessDetail, PublicUser } from "../types/process";

export function CreateProcess() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<StepForm[]>([emptyStep()]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get<PublicUser[]>("/users").then((res) => setUsers(res.data));
  }, []);

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
      setError(getApiErrorMessage(err, "Could not create process"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" component="h1" gutterBottom>
        Create Process
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Process name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Description"
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
          {submitting ? "Creating..." : "Create Process"}
        </Button>
      </Box>
    </Box>
  );
}
