import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  role?: "admin" | "user";
}

const ProtectedRoute = ({ children, role }: Props) => {

  // Check both user and admin from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const admin = JSON.parse(localStorage.getItem("admin") || "null");

  // Pick whichever is present
  const account = user || admin;

  // Not logged in at all
  if (!account) {
    return <Navigate to="/login" />;
  }

  // Role mismatch
  if (role && account.role !== role) {
    return <Navigate to="/" />;
  }

  // Allowed
  return children;
};

export default ProtectedRoute;