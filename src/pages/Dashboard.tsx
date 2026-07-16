import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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

      <Typography variant="h6" sx={{ mb: 2 }}>
        My Processes
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {!processes && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {processes && processes.length === 0 && (
        <Typography color="text.secondary">
          You're not involved in any processes yet.
        </Typography>
      )}

      <Stack spacing={2}>
        {processes?.map((process) => (
          <Card key={process.Id} variant="outlined">
            <CardActionArea
              onClick={() => navigate(`/processes/${process.Id}`)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {process.Name}
                    </Typography>
                    {process.Description && (
                      <Typography variant="body2" color="text.secondary">
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
        ))}
      </Stack>
    </Box>
  );
}
