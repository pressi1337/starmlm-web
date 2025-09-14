import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import axiosInstance from "@/utils/CustomAxios";
import { API_AUTH_USER } from "@/utils/http/apiPaths";

interface User {
  id: string;
  username: string;
  role: number;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (userData: User, access_token: string) => void;
  logout: () => void;
}

// Create context with initial undefined (will throw if used outside provider)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Load user session on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(API_AUTH_USER);
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // Only logout if it's an authentication error (401/403)
        // For network errors or server errors, keep the user logged in with cached data
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log("Authentication failed, logging out user");
          logout();
        } else {
          console.log("Network/server error, keeping user logged in with cached data");
          // Keep the user data from localStorage, don't logout for network issues
        }
      } finally {
        setIsLoading(false);
      }
    };

    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setAccessToken(storedToken);
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []);
  const login = (userData: User, access_token: string) => {
    setUser(userData);
    setAccessToken(access_token);
    setIsLoading(false);

    localStorage.setItem("user", JSON.stringify(userData)); // Store user data as a string
    localStorage.setItem("accessToken", access_token); // Store access token
  };

  // Function to handle logout
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setIsLoading(false);
    // Clear user data and tokens from local storage
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };
  // Value object to provide to the context
  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    login,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
