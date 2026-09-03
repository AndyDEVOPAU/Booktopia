import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Loading from "./common/Loading";

// Same shape as ProtectedRoute, plus a role check. Two separate redirects
// on purpose: not-logged-in goes to /login (they might come back after
// signing in), but logged-in-and-not-admin goes to / — sending a regular
// customer to the login page they're already past would be confusing.
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
