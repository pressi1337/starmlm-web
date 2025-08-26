// @ts-nocheck
import { createContext, useContext, useState ,useEffect} from "react";
import type { ReactNode } from "react";
import axiosInstance from "@/utils/CustomAxios";
import { API_AUTH_USER } from "@/utils/http/apiPaths";

// Create context with initial undefined (will throw if used outside provider)
const AuthContext = createContext(undefined);

// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );

  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get(API_AUTH_USER);
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout(); // Logout on error
    }
  };
  // Load user session on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setAccessToken(storedToken);
      fetchUser();
    }
  }, []);
  const login = (userData, access_token) => {
    setUser(userData);
    setAccessToken(access_token);

    localStorage.setItem("user", JSON.stringify(userData)); // Store user data as a string
    localStorage.setItem("accessToken", access_token); // Store access token
  };

  // Function to handle logout
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    // Clear user data and tokens from local storage
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };
  // Value object to provide to the context
  const value: AuthContextType = {
    user,
    accessToken,
    login,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
