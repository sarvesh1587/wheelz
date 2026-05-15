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

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("wheelz_token");
        localStorage.removeItem("wheelz_user");
      }
    }
    setLoading(false);
  };

  const login = (token, userData) => {
    localStorage.setItem("wheelz_token", token);
    localStorage.setItem("wheelz_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
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
