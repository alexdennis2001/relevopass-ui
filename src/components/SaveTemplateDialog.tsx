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

type SaveTemplateDialogProps = {
  open: boolean;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (name: string) => void;
};

export function SaveTemplateDialog({
  open,
  submitting,
  onCancel,
  onConfirm,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState("");

  function handleClose() {
    setName("");
    onCancel();
  }

  function handleConfirm() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setName("");
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Guardar como plantilla</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Esto guarda los pasos, subpasos, títulos, descripciones y
          asignados para que puedas reutilizarlos la próxima vez que crees un
          proceso similar.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          label="Nombre de la plantilla"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          disabled={submitting || !name.trim()}
          onClick={handleConfirm}
        >
          {submitting ? "Guardando..." : "Guardar Plantilla"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
