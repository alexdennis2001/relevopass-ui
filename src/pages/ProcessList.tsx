import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";
import type { Process } from "../types/process";

const statusColor: Record<Process["Status"], "default" | "info" | "success"> = {
  DRAFT: "default",
  ACTIVE: "info",
  COMPLETED: "success",
};

export function ProcessList() {
  const [processes, setProcesses] = useState<Process[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    apiClient
      .get<Process[]>("/processes")
      .then((res) => setProcesses(res.data))
      .catch((err) =>
        setError(getApiErrorMessage(err, "Could not load processes"))
      );
  }, []);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1">
          Processes
        </Typography>
        <Button variant="contained" component={RouterLink} to="/processes/new">
          Create Process
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {!processes && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {processes && processes.length === 0 && (
        <Typography color="text.secondary">No processes yet.</Typography>
      )}

      {processes && processes.length > 0 && isMobile && (
        <Stack spacing={1.5}>
          {processes.map((process) => (
            <Card key={process.Id} variant="outlined">
              <CardActionArea
                onClick={() => navigate(`/processes/${process.Id}`)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ minWidth: 0 }}>
                      {process.Name}
                    </Typography>
                    <Chip
                      label={process.Status}
                      color={statusColor[process.Status]}
                      size="small"
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {new Date(process.CreatedAt).toLocaleString()}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}

      {processes && processes.length > 0 && !isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processes.map((process) => (
                <TableRow
                  key={process.Id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/processes/${process.Id}`)}
                >
                  <TableCell>{process.Name}</TableCell>
                  <TableCell>
                    <Chip
                      label={process.Status}
                      color={statusColor[process.Status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(process.CreatedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
