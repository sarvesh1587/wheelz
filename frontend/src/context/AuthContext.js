import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("wheelz_token");
    const savedUser = localStorage.getItem("wheelz_user");

    console.log("🔍 Checking auth - Token exists:", !!token);
    console.log("🔍 Checking auth - Saved user exists:", !!savedUser);

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log("✅ User restored from localStorage:", userData.email);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("wheelz_token");
        localStorage.removeItem("wheelz_user");
      }
    }
    setLoading(false);
  };

  const login = (token, userData) => {
    console.log("🔐 Login called with:", { token: !!token, userData });
    localStorage.setItem("wheelz_token", token);
    localStorage.setItem("wheelz_user", JSON.stringify(userData));
    setUser(userData);
    console.log("✅ User logged in:", userData.email);
  };

  const logout = () => {
    console.log("🚪 Logout called");
    localStorage.removeItem("wheelz_token");
    localStorage.removeItem("wheelz_user");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor";

  const isInWishlist = (vehicleId) => {
    return user?.wishlist?.includes(vehicleId) || false;
  };

  const toggleWishlist = (vehicleId) => {
    if (!user) return;

    const updatedWishlist = user.wishlist?.includes(vehicleId)
      ? user.wishlist.filter((id) => id !== vehicleId)
      : [...(user.wishlist || []), vehicleId];

    const updatedUser = { ...user, wishlist: updatedWishlist };
    setUser(updatedUser);
    localStorage.setItem("wheelz_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        isVendor,
        isInWishlist,
        toggleWishlist,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
