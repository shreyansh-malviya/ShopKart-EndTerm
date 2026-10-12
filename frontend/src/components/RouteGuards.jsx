import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingState } from "./StateViews";

// Only lets logged-in users through. Login state is confirmed by GET /customers/me.
export const ProtectedRoute = () => {
  const { isLoggedIn, checking } = useAuth();
  const location = useLocation();

  if (checking) return <LoadingState message="Checking your session..." />;
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
};

// Login/Register pages: a logged-in user is sent to /home (or the page they came from)
export const PublicOnlyRoute = () => {
  const { isLoggedIn, checking } = useAuth();
  const location = useLocation();

  if (checking) return <LoadingState message="Checking your session..." />;
  if (isLoggedIn) return <Navigate to={location.state?.from?.pathname ?? "/home"} replace />;
  return <Outlet />;
};
