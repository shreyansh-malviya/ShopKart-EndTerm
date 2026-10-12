import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { authApi } from "../services/api";

const AuthContext = createContext(null);

// The logged-in customer always comes from GET /customers/me.
// We never store user data or the token in localStorage: the JWT lives in an HttpOnly cookie.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    } finally {
      setChecking(false);
    }
  }, []);

  // On first load, ask the server whether the cookie is still valid
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // If any protected request comes back 401 (cookie expired/cleared), drop the session
  // so ProtectedRoute sends the user to /login.
  useEffect(() => {
    const id = api.interceptors.response.use(undefined, (error) => {
      const url = error?.config?.url ?? "";
      if (error?.response?.status === 401 && !url.startsWith("/customers/login")) {
        setUser(null);
      }
      return Promise.reject(error);
    });
    return () => api.interceptors.response.eject(id);
  }, []);

  const login = useCallback(
    async (credentials) => {
      await authApi.login(credentials);
      // Confirm the cookie works by loading the profile from the protected route
      const me = await refreshUser();
      if (!me) throw new Error("Logged in, but the session cookie was not accepted by the browser.");
      return me;
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, checking, isLoggedIn: Boolean(user), login, logout, refreshUser }),
    [user, checking, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
