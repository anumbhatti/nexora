import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================
  // Restore Login After Page Refresh
  // ========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("nexora_user");

    const token =
      localStorage.getItem("nexora_token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Failed to restore user:",
          error
        );

        localStorage.removeItem("nexora_user");
        localStorage.removeItem("nexora_token");
      }
    }

    setLoading(false);
  }, []);

  // ========================================
  // Login
  // ========================================

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
  email,
  password,
});

    const { token, user } = response.data;

    localStorage.setItem(
      "nexora_token",
      token
    );

    localStorage.setItem(
      "nexora_user",
      JSON.stringify(user)
    );

    setUser(user);

    return response.data;
  };

  // ========================================
  // Update Current User
  // ========================================

  const updateUser = (updatedUser) => {
    setUser(updatedUser);

    localStorage.setItem(
      "nexora_user",
      JSON.stringify(updatedUser)
    );
  };

  // ========================================
  // Logout
  // ========================================

  const logout = () => {
    localStorage.removeItem("nexora_token");
    localStorage.removeItem("nexora_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};