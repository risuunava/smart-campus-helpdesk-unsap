"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User, LoginCredentials } from "@/types";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  error: null,
});

export function AuthProvider({ children, initialUser = null }: { children: React.ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(() => {
    if (initialUser) return initialUser;
    if (typeof window !== "undefined") {
      const cached = Cookies.get("cached_user");
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(() => {
    if (initialUser) return false;
    if (typeof window !== "undefined") {
      return !Cookies.get("auth_token") || !Cookies.get("cached_user");
    }
    return true;
  });
  
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sync dengan perubahan server (router.refresh())
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setIsLoading(false);
    }
  }, [initialUser]);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = api.getToken();
      if (token) {
        const userData = await api.getUser();
        setUser(userData);
        Cookies.set("cached_user", JSON.stringify(userData), { expires: 7, path: "/" });
      } else {
        Cookies.remove("cached_user", { path: "/" });
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      api.setToken(null);
      Cookies.remove("cached_user", { path: "/" });
    } finally {
      setIsLoading(false);
    }
  }

  async function login(credentials: LoginCredentials) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.login(credentials);
      setUser(response.data.user);
      Cookies.set("cached_user", JSON.stringify(response.data.user), { expires: 7, path: "/" });
      
      // Role-based redirect
      const role = response.data.user.role;
      if (role === 'admin' || role === 'master_admin') {
        router.push("/admin");
      } else {
        router.push("/mahasiswa");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      api.setToken(null);
      Cookies.remove("cached_user", { path: "/" });
      router.push("/login");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}