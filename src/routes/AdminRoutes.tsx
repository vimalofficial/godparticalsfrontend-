import { Route } from "react-router-dom";

import AdminDashboard from "../pages/admin/dashboard/root";

import ProtectedRoute from "../components/ProtectedRoute";

import AdminLogin from "../pages/admin/root";
import AdminItem from "../pages/admin/dashboard/item/root";

const AdminRoutes = () => {
  return (
    <>

      {/* Admin Login */}
      <Route
        path="/adminlogin"
        element={<AdminLogin />}
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
       <Route
        path="/admin/items"
        element={
          <ProtectedRoute role="admin">
            <AdminItem />
          </ProtectedRoute>
        }
      />


    </>
  );
};

export default AdminRoutes;