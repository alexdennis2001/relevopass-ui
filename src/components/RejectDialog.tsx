import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

type RejectDialogProps = {
  open: boolean;
  title: string;
  description: string;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (note: string) => void;
};

export function RejectDialog({
  open,
  title,
  description,
  submitting,
  onCancel,
  onConfirm,
}: RejectDialogProps) {
  const [note, setNote] = useState("");

  function handleClose() {
    setNote("");
    onCancel();
  }

  function handleConfirm() {
    const trimmed = note.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setNote("");
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={3}
          label="¿Qué se necesita corregir?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="contained"
          color="error"
          disabled={submitting || !note.trim()}
          onClick={handleConfirm}
        >
          Rechazar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
