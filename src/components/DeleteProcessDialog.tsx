import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type DeleteProcessDialogProps = {
  open: boolean;
  processName: string;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteProcessDialog({
  open,
  processName,
  submitting,
  onCancel,
  onConfirm,
}: DeleteProcessDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Eliminar proceso</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas eliminar el proceso{" "}
          <strong>"{processName}"</strong>? Se eliminarán permanentemente el
          proceso, todos sus pasos, subpasos y su historial de eventos. Esta
          acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="contained"
          color="error"
          disabled={submitting}
          onClick={onConfirm}
        >
          {submitting ? "Eliminando..." : "Eliminar proceso"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
