import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
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
import type { ProcessEvent } from "../types/process";

const eventTypeLabels: Record<string, string> = {
  PROCESS_CREATED: "Proceso creado",
  PROCESS_STARTED: "Proceso iniciado",
  STEP_ACTIVATED: "Paso activado",
  STEP_COMPLETED: "Paso completado",
  STEP_REJECTED: "Paso rechazado",
  SUBSTEP_COMPLETED: "Subproceso completado",
  SUBSTEP_REJECTED: "Subproceso rechazado",
  PROCESS_COMPLETED: "Proceso completado",
};

function getRejectionNote(metadata: string | null): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata);
    return typeof parsed.note === "string" ? parsed.note : null;
  } catch {
    return null;
  }
}

export function ProcessEvents() {
  const { id } = useParams<{ id: string }>();
  const [events, setEvents] = useState<ProcessEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!id) return;
    apiClient
      .get<ProcessEvent[]>(`/processes/${id}/events`)
      .then((res) => setEvents(res.data))
      .catch((err) =>
        setError(getApiErrorMessage(err, "No se pudo cargar el historial de eventos"))
      );
  }, [id]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!events) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Historial de Eventos
      </Typography>

      {isMobile && (
        <Card variant="outlined">
          <Stack divider={<Divider />}>
            {events.map((event) => {
              const note = getRejectionNote(event.Metadata);
              return (
                <CardContent key={event.Id} sx={{ py: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {eventTypeLabels[event.EventType] ?? event.EventType}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {new Date(event.CreatedAt).toLocaleString("es-MX")}
                    </Typography>
                  </Box>
                  {note && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      “{note}”
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {event.ActorFirstName} {event.ActorLastName}
                  </Typography>
                </CardContent>
              );
            })}
          </Stack>
        </Card>
      )}

      {!isMobile && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cuándo</TableCell>
                <TableCell>Evento</TableCell>
                <TableCell>Por</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => {
                const note = getRejectionNote(event.Metadata);
                return (
                  <TableRow key={event.Id}>
                    <TableCell>
                      {new Date(event.CreatedAt).toLocaleString("es-MX")}
                    </TableCell>
                    <TableCell>
                      {eventTypeLabels[event.EventType] ?? event.EventType}
                      {note && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          “{note}”
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.ActorFirstName} {event.ActorLastName}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
