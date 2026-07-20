import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { apiClient } from "../lib/apiClient";
import { getApiErrorMessage } from "../lib/apiError";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await apiClient.post<{ message: string }>(
        "/auth/forgot-password",
        { email }
      );
      setMessage(res.data.message);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "No se pudo procesar la solicitud")
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
            Recuperar contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <TextField
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={submitting}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Enviar enlace"}
            </Button>
            <Typography variant="body2" align="center">
              <Link component={RouterLink} to="/login">
                Volver a iniciar sesión
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
