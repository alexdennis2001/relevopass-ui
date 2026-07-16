import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { logout, user } = useAuth();

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RelevoPass
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Dashboard
          </Button>
          {user?.role === "ADMIN" && (
            <Button color="inherit" component={RouterLink} to="/processes">
              Processes
            </Button>
          )}
          <Button color="inherit" component={RouterLink} to="/my-tasks">
            My Tasks
          </Button>
          <Button color="inherit" onClick={() => logout()}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
