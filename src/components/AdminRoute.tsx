import { Navigate, useLocation } from "react-router-dom";
import { getToken, getUser } from "@/lib/api";
import { isAdminEmail } from "@/lib/admin";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  if (!getToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = getUser();
  if (!user || !isAdminEmail(user.email)) {
    return <Navigate to="/dashboard-v2" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
