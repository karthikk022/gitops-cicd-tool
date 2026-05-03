import { Routes, Route } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import AppDetail from "./pages/AppDetail";
import Rollback from "./pages/Rollback";
import Topology from "./pages/Topology";
import History from "./pages/History";
import Repositories from "./pages/Repositories";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/app/:id" element={<AppDetail />} />
        <Route path="/app/:id/rollback" element={<Rollback />} />
        <Route path="/topology" element={<Topology />} />
        <Route path="/history" element={<History />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<AppRoutes />} />
    </Routes>
  );
}
