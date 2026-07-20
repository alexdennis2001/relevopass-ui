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
import { processStatusLabels } from "../lib/labels";
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
        setError(getApiErrorMessage(err, "No se pudieron cargar los procesos"))
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
          Procesos
        </Typography>
        <Button variant="contained" component={RouterLink} to="/processes/new">
          Crear Proceso
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {!processes && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {processes && processes.length === 0 && (
        <Typography color="text.secondary">Todavía no hay procesos.</Typography>
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
                      label={processStatusLabels[process.Status]}
                      color={statusColor[process.Status]}
                      size="small"
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {new Date(process.CreatedAt).toLocaleString("es-MX")}
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
                <TableCell>Nombre</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creado</TableCell>
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
                      label={processStatusLabels[process.Status]}
                      color={statusColor[process.Status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(process.CreatedAt).toLocaleString("es-MX")}
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
