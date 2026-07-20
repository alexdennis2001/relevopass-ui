import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthContext";
import { CreateProcess } from "./pages/CreateProcess";
import { Dashboard } from "./pages/Dashboard";
import { EditProcess } from "./pages/EditProcess";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Login } from "./pages/Login";
import { MyTasks } from "./pages/MyTasks";
import { ResetPassword } from "./pages/ResetPassword";
import { ProcessDetail } from "./pages/ProcessDetail";
import { ProcessEvents } from "./pages/ProcessEvents";
import { ProcessList } from "./pages/ProcessList";
import { Register } from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/processes" element={<ProcessList />} />
            <Route path="/processes/new" element={<CreateProcess />} />
            <Route path="/processes/:id" element={<ProcessDetail />} />
            <Route path="/processes/:id/edit" element={<EditProcess />} />
            <Route path="/processes/:id/events" element={<ProcessEvents />} />
            <Route path="/my-tasks" element={<MyTasks />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
