import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";
import type { ProcessEvent } from "../types/process";

const eventTypeLabels: Record<string, string> = {
  PROCESS_CREATED: "Process created",
  PROCESS_STARTED: "Process started",
  STEP_ACTIVATED: "Step activated",
  STEP_COMPLETED: "Step completed",
  STEP_REJECTED: "Step rejected",
  SUBSTEP_COMPLETED: "Subprocess completed",
  SUBSTEP_REJECTED: "Subprocess rejected",
  PROCESS_COMPLETED: "Process completed",
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

  useEffect(() => {
    if (!id) return;
    apiClient
      .get<ProcessEvent[]>(`/processes/${id}/events`)
      .then((res) => setEvents(res.data))
      .catch((err) =>
        setError(getApiErrorMessage(err, "Could not load event history"))
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
        Event History
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => {
              const note = getRejectionNote(event.Metadata);
              return (
                <TableRow key={event.Id}>
                  <TableCell>
                    {new Date(event.CreatedAt).toLocaleString()}
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
    </Box>
  );
}
