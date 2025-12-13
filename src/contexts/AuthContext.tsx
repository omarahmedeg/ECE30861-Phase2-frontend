import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, getAuthToken, setAuthToken, clearAuthToken } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
  login: (
    username: string,
    password: string,
    isAdmin?: boolean
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      // Try to fetch user info from backend
      api
        .getCurrentUser()
        .then((user) => {
          setUsername(user.name);
          setIsAdmin(user.isAdmin);
          localStorage.setItem("username", user.name);
          localStorage.setItem("isAdmin", user.isAdmin.toString());
        })
        .catch(() => {
          // Fallback to localStorage if API call fails
          const storedUsername = localStorage.getItem("username");
          const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
          setUsername(storedUsername);
          setIsAdmin(storedIsAdmin);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (
    username: string,
    password: string,
    isAdmin: boolean = false
  ) => {
    const token = await api.authenticate(username, password, isAdmin);
    setAuthToken(token);
    setIsAuthenticated(true);
    setIsAdmin(isAdmin);
    setUsername(username);
    localStorage.setItem("username", username);
    localStorage.setItem("isAdmin", isAdmin.toString());
  };

  const logout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUsername(null);
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAdmin, username, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
