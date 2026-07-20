import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "No se pudo restablecer la contraseña")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Restablecer contraseña
          </Typography>

          {!token && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Este enlace no es válido. Solicita uno nuevo desde la página de
              recuperación de contraseña.
            </Alert>
          )}

          {token && success && (
            <>
              <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                Tu contraseña ha sido restablecida correctamente.
              </Alert>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                fullWidth
                size="large"
              >
                Iniciar sesión
              </Button>
            </>
          )}

          {token && !success && (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Nueva contraseña"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                fullWidth
                autoFocus
                helperText="Al menos 8 caracteres"
                disabled={submitting}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Confirmar contraseña"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                disabled={submitting}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
              >
                {submitting ? "Restableciendo..." : "Restablecer contraseña"}
              </Button>
              <Typography variant="body2" align="center">
                <Link component={RouterLink} to="/login">
                  Volver a iniciar sesión
                </Link>
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
