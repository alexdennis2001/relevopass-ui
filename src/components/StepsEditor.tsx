import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from "@mui/icons-material/Delete";
import type { PublicUser } from "../types/process";

export type SubstepForm = {
  _key: string;
  id?: string;
  title: string;
  description: string;
  assigneeUserId: string;
};

export type StepForm = {
  _key: string;
  id?: string;
  title: string;
  description: string;
  assigneeUserId: string;
  substeps: SubstepForm[];
};

export const emptySubstep = (): SubstepForm => ({
  _key: crypto.randomUUID(),
  title: "",
  description: "",
  assigneeUserId: "",
});

export const emptyStep = (): StepForm => ({
  _key: crypto.randomUUID(),
  title: "",
  description: "",
  assigneeUserId: "",
  substeps: [],
});

function swap<T>(items: T[], indexA: number, indexB: number): T[] {
  const copy = [...items];
  [copy[indexA], copy[indexB]] = [copy[indexB], copy[indexA]];
  return copy;
}

type StepsEditorProps = {
  steps: StepForm[];
  onChange: (steps: StepForm[]) => void;
  users: PublicUser[];
  startNumberAt?: number;
};

export function StepsEditor({
  steps,
  onChange,
  users,
  startNumberAt = 1,
}: StepsEditorProps) {
  function updateStep(index: number, patch: Partial<StepForm>) {
    onChange(
      steps.map((step, i) => (i === index ? { ...step, ...patch } : step))
    );
  }

  function addStep() {
    onChange([...steps, emptyStep()]);
  }

  function removeStep(index: number) {
    onChange(steps.filter((_, i) => i !== index));
  }

  function moveStepUp(index: number) {
    if (index === 0) return;
    onChange(swap(steps, index, index - 1));
  }

  function moveStepDown(index: number) {
    if (index === steps.length - 1) return;
    onChange(swap(steps, index, index + 1));
  }

  function updateSubstep(
    stepIndex: number,
    substepIndex: number,
    patch: Partial<SubstepForm>
  ) {
    onChange(
      steps.map((step, i) =>
        i !== stepIndex
          ? step
          : {
              ...step,
              substeps: step.substeps.map((substep, j) =>
                j === substepIndex ? { ...substep, ...patch } : substep
              ),
            }
      )
    );
  }

  function addSubstep(stepIndex: number) {
    onChange(
      steps.map((step, i) =>
        i === stepIndex
          ? { ...step, substeps: [...step.substeps, emptySubstep()] }
          : step
      )
    );
  }

  function removeSubstep(stepIndex: number, substepIndex: number) {
    onChange(
      steps.map((step, i) =>
        i === stepIndex
          ? {
              ...step,
              substeps: step.substeps.filter((_, j) => j !== substepIndex),
            }
          : step
      )
    );
  }

  return (
    <Stack spacing={2}>
      {steps.map((step, stepIndex) => (
        <Card key={step._key} variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle1">
                Paso {startNumberAt + stepIndex}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  type="button"
                  size="small"
                  onClick={() => moveStepUp(stepIndex)}
                  disabled={stepIndex === 0}
                  aria-label="Subir paso"
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  type="button"
                  size="small"
                  onClick={() => moveStepDown(stepIndex)}
                  disabled={stepIndex === steps.length - 1}
                  aria-label="Bajar paso"
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
                {steps.length > 1 && (
                  <IconButton
                    type="button"
                    size="small"
                    onClick={() => removeStep(stepIndex)}
                    aria-label="Eliminar paso"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Box>

            <Stack spacing={2}>
              <TextField
                label="Título"
                value={step.title}
                onChange={(e) =>
                  updateStep(stepIndex, { title: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Descripción"
                value={step.description}
                onChange={(e) =>
                  updateStep(stepIndex, { description: e.target.value })
                }
                fullWidth
              />
              <TextField
                select
                label="Asignado"
                value={step.assigneeUserId}
                onChange={(e) =>
                  updateStep(stepIndex, { assigneeUserId: e.target.value })
                }
                required
                fullWidth
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" sx={{ mb: 1 }}>
              Subprocesos
            </Typography>

            <Stack spacing={2}>
              {step.substeps.map((substep, substepIndex) => (
                <Box
                  key={substep._key}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                    alignItems: { xs: "stretch", sm: "flex-start" },
                  }}
                >
                  <TextField
                    label="Título"
                    size="small"
                    value={substep.title}
                    onChange={(e) =>
                      updateSubstep(stepIndex, substepIndex, {
                        title: e.target.value,
                      })
                    }
                    required
                    sx={{ flex: 1 }}
                  />
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <TextField
                      select
                      label="Asignado"
                      size="small"
                      value={substep.assigneeUserId}
                      onChange={(e) =>
                        updateSubstep(stepIndex, substepIndex, {
                          assigneeUserId: e.target.value,
                        })
                      }
                      required
                      sx={{ flex: 1 }}
                    >
                      {users.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}
                        </MenuItem>
                      ))}
                    </TextField>
                    <IconButton
                      type="button"
                      size="small"
                      onClick={() => removeSubstep(stepIndex, substepIndex)}
                      aria-label="Eliminar subproceso"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>

            <Button
              type="button"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => addSubstep(stepIndex)}
              sx={{ mt: 1 }}
            >
              Agregar subproceso
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button type="button" startIcon={<AddIcon />} onClick={addStep}>
        Agregar paso
      </Button>
    </Stack>
  );
}
