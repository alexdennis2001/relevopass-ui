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
      <DialogTitle>Save as template</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          This saves the steps, subprocesses, titles, descriptions, and
          assignees so you can reuse them the next time you create a similar
          process.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          label="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          disabled={submitting || !name.trim()}
          onClick={handleConfirm}
        >
          {submitting ? "Saving..." : "Save Template"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
