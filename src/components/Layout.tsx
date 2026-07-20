import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoBlanco from "../assets/logo-blanco.png";
import logoVerde from "../assets/logo-verde.png";

const DRAWER_WIDTH = 260;

export function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", to: "/", icon: <DashboardIcon />, show: true },
    {
      label: "Procesos",
      to: "/processes",
      icon: <ListAltIcon />,
      show: user?.role === "ADMIN",
    },
    { label: "Mis Tareas", to: "/my-tasks", icon: <AssignmentIcon />, show: true },
  ].filter((item) => item.show);

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH }} role="presentation">
      <Toolbar>
        <Box
          component="img"
          src={logoVerde}
          alt="RelevoPass"
          sx={{ height: 40, width: "auto" }}
        />
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={() => setDrawerOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        <ListItemButton
          onClick={() => {
            setDrawerOpen(false);
            logout();
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            aria-label="Abrir menú de navegación"
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src={logoBlanco}
              alt="RelevoPass"
              sx={{ height: { xs: 28, md: 32 }, width: "auto" }}
            />
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.to}
                color="inherit"
                component={RouterLink}
                to={item.to}
              >
                {item.label}
              </Button>
            ))}
            <Button color="inherit" onClick={() => logout()}>
              Cerrar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {drawerContent}
      </Drawer>
      <Container
        maxWidth="md"
        sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}
