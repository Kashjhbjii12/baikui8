import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PendingDrivers from './pages/PendingDrivers';
import AllDrivers from './pages/AllDrivers';
import DriverDetail from './pages/DriverDetail';
import CommissionPayments from './pages/CommissionPayments';
import Rides from './pages/Rides';
import RideDetail from './pages/RideDetail';
import Users from './pages/Users';
import Appeals from './pages/Appeals';
import HelmetApplications from './pages/HelmetApplications';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/drivers/pending" element={<PendingDrivers />} />
              <Route path="/drivers" element={<AllDrivers />} />
              <Route path="/drivers/:id" element={<DriverDetail />} />
              <Route path="/commission-payments" element={<CommissionPayments />} />
              <Route path="/rides" element={<Rides />} />
              <Route path="/rides/:id" element={<RideDetail />} />
              <Route path="/users" element={<Users />} />
              <Route path="/helmet-applications" element={<HelmetApplications />} />
              <Route path="/appeals" element={<Appeals />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
