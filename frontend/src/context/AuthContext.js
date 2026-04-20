// /**
//  * AuthContext - Global authentication state
//  */

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
// } from "react";
// import { authAPI } from "../services/api";
// import toast from "react-hot-toast";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     try {
//       const stored = localStorage.getItem("wheelz_user");
//       return stored ? JSON.parse(stored) : null;
//     } catch {
//       return null;
//     }
//   });
//   const [loading, setLoading] = useState(true);
//   const [wishlist, setWishlist] = useState([]);

//   useEffect(() => {
//     const token = localStorage.getItem("wheelz_token");
//     if (token) {
//       authAPI
//         .getMe()
//         .then((res) => {
//           setUser(res.data.user);
//           setWishlist(res.data.user.wishlist?.map((v) => v._id || v) || []);
//           localStorage.setItem("wheelz_user", JSON.stringify(res.data.user));
//         })
//         .catch(() => {
//           localStorage.removeItem("wheelz_token");
//           localStorage.removeItem("wheelz_user");
//           setUser(null);
//         })
//         .finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const login = useCallback(async (email, password) => {
//     try {
//       const res = await authAPI.login({ email, password });
//       const { token, user: userData } = res.data;

//       // Safety check - ensure userData exists
//       if (!userData) {
//         throw new Error("No user data received");
//       }

//       localStorage.setItem("wheelz_token", token);
//       localStorage.setItem("wheelz_user", JSON.stringify(userData));
//       setUser(userData);
//       setWishlist(userData.wishlist || []);

//       // Safe name display
//       const firstName = userData.name?.split(" ")[0] || "User";
//       toast.success(`Welcome back, ${firstName}! 👋`);
//       return userData;
//     } catch (error) {
//       console.error("Login error:", error);
//       toast.error(error.response?.data?.message || "Login failed");
//       throw error;
//     }
//   }, []);

//   const register = useCallback(async (data) => {
//     try {
//       const res = await authAPI.register(data);
//       const { token, user: userData } = res.data;

//       if (!userData) {
//         throw new Error("No user data received");
//       }

//       localStorage.setItem("wheelz_token", token);
//       localStorage.setItem("wheelz_user", JSON.stringify(userData));
//       setUser(userData);
//       toast.success("Account created! Welcome to Wheelz 🚗");
//       return userData;
//     } catch (error) {
//       console.error("Registration error:", error);
//       toast.error(error.response?.data?.message || "Registration failed");
//       throw error;
//     }
//   }, []);

//   const logout = useCallback(() => {
//     localStorage.removeItem("wheelz_token");
//     localStorage.removeItem("wheelz_user");
//     setUser(null);
//     setWishlist([]);
//     toast.success("Logged out successfully");
//   }, []);

//   const updateUser = useCallback((updates) => {
//     setUser((prev) => {
//       if (!prev) return null;
//       const updated = { ...prev, ...updates };
//       localStorage.setItem("wheelz_user", JSON.stringify(updated));
//       return updated;
//     });
//   }, []);

//   const toggleWishlist = useCallback((vehicleId) => {
//     setWishlist((prev) => {
//       const id = vehicleId.toString();
//       return prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
//     });
//   }, []);

//   const isInWishlist = useCallback(
//     (vehicleId) => {
//       return wishlist.includes(vehicleId?.toString());
//     },
//     [wishlist],
//   );

//   // Add a loading state to prevent rendering before auth is ready
//   if (loading) {
//     // You can return a loading spinner here if needed
//     return children; // or return <LoadingSpinner />;
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         wishlist,
//         login,
//         register,
//         logout,
//         updateUser,
//         toggleWishlist,
//         isInWishlist,
//         isAdmin: user?.role === "admin",
//         isAuthenticated: !!user,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// };
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

  // 🔄 Load user on app start
  useEffect(() => {
    const token = localStorage.getItem("wheelz_token");

    if (!token) {
      setLoading(false);
      return;
    }

    authAPI
      .getMe()
      .then((res) => {
        const userData = res.data.user;
        setUser(userData);
        setWishlist(userData?.wishlist?.map((v) => v._id || v) || []);
        localStorage.setItem("wheelz_user", JSON.stringify(userData));
      })
      .catch(() => {
        localStorage.removeItem("wheelz_token");
        localStorage.removeItem("wheelz_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔐 Login
  // const login = useCallback(async (email, password) => {
  //   try {
  //     const res = await authAPI.login({ email, password });
  //     const { token, user: userData } = res.data;

  //     if (!userData) throw new Error("No user data received");

  //     localStorage.setItem("wheelz_token", token);
  //     localStorage.setItem("wheelz_user", JSON.stringify(userData));

  //     setUser(userData);
  //     setWishlist(userData.wishlist || []);

  //     const firstName = userData.name?.split(" ")[0] || "User";
  //     toast.success(`Welcome back, ${firstName}! 👋`);

  //     return userData;
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     toast.error(error.response?.data?.message || "Login failed");
  //     throw error;
  //   }
  // }, []);
  const login = useCallback(async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user: userData } = res.data;

      if (!userData) {
        throw new Error("No user data received");
      }

      localStorage.setItem("wheelz_token", token);
      localStorage.setItem("wheelz_user", JSON.stringify(userData));
      setUser(userData);
      setWishlist(userData.wishlist || []);

      const firstName = userData.name?.split(" ")[0] || "User";
      toast.success(`Welcome back, ${firstName}! 👋`);

      // ✅ ADD THIS - Redirect admin to /admin
      if (userData.role === "admin") {
        window.location.href = "/admin";
      }

      return userData;
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  }, []);

  // 📝 Register
  const register = useCallback(async (data) => {
    try {
      const res = await authAPI.register(data);
      const { token, user: userData } = res.data;

      if (!userData) throw new Error("No user data received");

      localStorage.setItem("wheelz_token", token);
      localStorage.setItem("wheelz_user", JSON.stringify(userData));

      setUser(userData);
      toast.success("Account created! Welcome to Wheelz 🚗");

      return userData;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  }, []);

  // 🚪 Logout
  const logout = useCallback(() => {
    localStorage.removeItem("wheelz_token");
    localStorage.removeItem("wheelz_user");
    setUser(null);
    setWishlist([]);
    toast.success("Logged out successfully");
  }, []);

  // 👤 Update user
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem("wheelz_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ❤️ Wishlist
  const toggleWishlist = useCallback((vehicleId) => {
    setWishlist((prev) => {
      const id = vehicleId.toString();
      return prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
    });
  }, []);

  const isInWishlist = useCallback(
    (vehicleId) => wishlist.includes(vehicleId?.toString()),
    [wishlist],
  );

  // ✅ ALWAYS wrap children (THIS FIXES YOUR ERROR)
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

// 🔌 Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
