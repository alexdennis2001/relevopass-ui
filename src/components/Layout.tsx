import { useEffect, useState } from "react";
import {
  AppBar,
  Badge,
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
  Snackbar,
  Toolbar,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTaskCount } from "../context/TaskCountContext";
import logoBlanco from "../assets/logo-blanco.png";
import logoVerde from "../assets/logo-verde.png";
import {
  isPushSupported,
  isSubscribedForCurrentUser,
  subscribeToPush,
  unsubscribeFromPush,
} from "../lib/pushNotifications";

const DRAWER_WIDTH = 260;

export function Layout() {
  const { logout, user } = useAuth();
  const { pendingCount } = useTaskCount();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPushSupported() || !user) {
      setPushSubscribed(false);
      return;
    }
    // A browser-level subscription can belong to a *different* account on a
    // shared device — confirm it's actually this user's before showing "on".
    isSubscribedForCurrentUser().then(setPushSubscribed);
  }, [user]);

  async function handleTogglePush() {
    try {
      if (pushSubscribed) {
        await unsubscribeFromPush();
        setPushSubscribed(false);
      } else {
        await subscribeToPush();
        setPushSubscribed(true);
      }
    } catch (err) {
      setPushError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar tu preferencia de notificaciones"
      );
    }
  }

  const navItems = [
    { label: "Dashboard", to: "/", icon: <DashboardIcon />, show: true, badge: 0 },
    {
      label: "Procesos",
      to: "/processes",
      icon: <ListAltIcon />,
      show: user?.role === "ADMIN",
      badge: 0,
    },
    {
      label: "Mis Tareas",
      to: "/my-tasks",
      icon: <AssignmentIcon />,
      show: true,
      badge: pendingCount,
    },
  ].filter((item) => item.show);

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH }} role="presentation">
      <Toolbar>
        <Box
          component="img"
          src={logoVerde}
          alt="Relevo App"
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
            <ListItemIcon>
              <Badge
                badgeContent={item.badge}
                color="error"
                invisible={item.badge === 0}
              >
                {item.icon}
              </Badge>
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        {isPushSupported() && (
          <ListItemButton onClick={handleTogglePush}>
            <ListItemIcon>
              {pushSubscribed ? <NotificationsIcon /> : <NotificationsOffIcon />}
            </ListItemIcon>
            <ListItemText
              primary={
                pushSubscribed
                  ? "Desactivar notificaciones"
                  : "Activar notificaciones"
              }
            />
          </ListItemButton>
        )}
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
          <Box
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <Box
              component="img"
              src={logoBlanco}
              alt="Relevo App"
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
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  invisible={item.badge === 0}
                  sx={{ "& .MuiBadge-badge": { right: -8, top: -2 } }}
                >
                  {item.label}
                </Badge>
              </Button>
            ))}
            {isPushSupported() && (
              <Tooltip
                title={
                  pushSubscribed
                    ? "Desactivar notificaciones"
                    : "Activar notificaciones"
                }
              >
                <IconButton color="inherit" onClick={handleTogglePush}>
                  {pushSubscribed ? (
                    <NotificationsIcon />
                  ) : (
                    <NotificationsOffIcon />
                  )}
                </IconButton>
              </Tooltip>
            )}
            <Button color="inherit" onClick={() => logout()}>
              Cerrar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Snackbar
        open={pushError !== null}
        autoHideDuration={5000}
        onClose={() => setPushError(null)}
        message={pushError}
      />
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
