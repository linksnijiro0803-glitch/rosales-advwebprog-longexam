import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="px-4 py-8 text-sm font-medium text-zinc-600 sm:px-6 lg:px-8">
        Checking permissions...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/products" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
