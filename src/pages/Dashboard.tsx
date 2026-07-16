import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";
import { useAuth } from "../context/AuthContext";
import type { Process, ProcessStatus } from "../types/process";

const statusColor: Record<ProcessStatus, "default" | "info" | "success"> = {
  DRAFT: "default",
  ACTIVE: "info",
  COMPLETED: "success",
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<Process[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Process[]>("/processes/mine")
      .then((res) => setProcesses(res.data))
      .catch((err) =>
        setError(getApiErrorMessage(err, "Could not load your processes"))
      );
  }, []);

  if (!user) {
    return null;
  }

  const activeProcesses = processes?.filter((p) => p.Status !== "COMPLETED");
  const completedProcesses = processes?.filter(
    (p) => p.Status === "COMPLETED"
  );

  function renderProcessCard(process: Process) {
    return (
      <Card
        key={process.Id}
        variant="outlined"
        sx={{ width: 280, flex: "0 0 auto" }}
      >
        <CardActionArea onClick={() => navigate(`/processes/${process.Id}`)}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap>
                  {process.Name}
                </Typography>
                {process.Description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {process.Description}
                  </Typography>
                )}
              </Box>
              <Chip
                label={process.Status}
                color={statusColor[process.Status]}
                size="small"
              />
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {user.firstName[0]}
              {user.lastName[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Chip
              label={user.role}
              color={user.role === "ADMIN" ? "secondary" : "default"}
              sx={{ ml: "auto" }}
            />
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}

      {!processes && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {processes && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            My Processes
          </Typography>

          {activeProcesses && activeProcesses.length === 0 && (
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              You're not involved in any active processes yet.
            </Typography>
          )}

          {activeProcesses && activeProcesses.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                mb: 3,
              }}
            >
              {activeProcesses.map(renderProcessCard)}
            </Box>
          )}

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Completed Processes ({completedProcesses?.length ?? 0})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {completedProcesses && completedProcesses.length === 0 && (
                <Typography color="text.secondary">
                  No completed processes yet.
                </Typography>
              )}
              {completedProcesses && completedProcesses.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  {completedProcesses.map(renderProcessCard)}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Box>
  );
}
