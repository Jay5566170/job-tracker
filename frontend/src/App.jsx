import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import AddJob from "./pages/AddJob";
import JobDetails from "./pages/JobDetails";

import Resumes from "./pages/Resumes";
import Matches from "./pages/Matches";
import NotFound from "./pages/NotFound";
import { API_CONFIG_ERROR } from "./services/api";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      {API_CONFIG_ERROR && (
        <div role="alert" style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 20px' }}>
          {API_CONFIG_ERROR}
        </div>
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/add" element={<AddJob />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/matches" element={<Matches />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;