/**
 * AuthContext - Global authentication state
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("wheelz_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("wheelz_token");
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          setUser(res.data.user);
          setWishlist(res.data.user.wishlist?.map((v) => v._id || v) || []);
          localStorage.setItem("wheelz_user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem("wheelz_token");
          localStorage.removeItem("wheelz_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem("wheelz_token", token);
    localStorage.setItem("wheelz_user", JSON.stringify(userData));
    setUser(userData);
    setWishlist(userData.wishlist || []);
    toast.success(`Welcome back, ${userData.name.split(" ")[0]}! 👋`);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token, user: userData } = res.data;
    localStorage.setItem("wheelz_token", token);
    localStorage.setItem("wheelz_user", JSON.stringify(userData));
    setUser(userData);
    toast.success("Account created! Welcome to Wheelz 🚗");
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("wheelz_token");
    localStorage.removeItem("wheelz_user");
    setUser(null);
    setWishlist([]);
    toast.success("Logged out successfully");
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("wheelz_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleWishlist = useCallback((vehicleId) => {
    setWishlist((prev) => {
      const id = vehicleId.toString();
      return prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
    });
  }, []);

  const isInWishlist = useCallback(
    (vehicleId) => {
      return wishlist.includes(vehicleId?.toString());
    },
    [wishlist],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        wishlist,
        login,
        register,
        logout,
        updateUser,
        toggleWishlist,
        isInWishlist,
        isAdmin: user?.role === "admin",
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
