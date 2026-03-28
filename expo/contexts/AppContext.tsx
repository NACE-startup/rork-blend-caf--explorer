import { useEffect, useState, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { trpc } from "@/lib/trpc";
import { setAuthToken, removeAuthToken, getAuthToken } from "@/lib/auth-storage";

import { User } from "@/types";

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, isBusiness?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refetchUser: () => void;
}

export const [AppProvider, useApp] = createContextHook<AppState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: false,
    retry: false,
  });

  const loadUser = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const userData = await meQuery.refetch();
        if (userData.data) {
          setUser({
            ...userData.data,
            bio: userData.data.bio ?? undefined,
          } as User);
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  }, [meQuery]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const refetchUser = useCallback(() => {
    loadUser();
  }, [loadUser]);

  const loginMutation = trpc.auth.login.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await loginMutation.mutateAsync({ email, password });
      await setAuthToken(result.token);
      setUser({
        ...result.user,
        bio: result.user.bio ?? undefined,
      } as User);
    } catch (err: any) {
      const errorMessage = err?.message || "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loginMutation]);

  const signup = useCallback(async (name: string, email: string, password: string, isBusiness = false) => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await signupMutation.mutateAsync({ name, email, password, isBusiness });
      await setAuthToken(result.token);
      setUser({
        ...result.user,
        bio: result.user.bio ?? undefined,
      } as User);
    } catch (err: any) {
      const errorMessage = err?.message || "Signup failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [signupMutation]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await removeAuthToken();
      setUser(null);
    }
  }, [logoutMutation]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      signup,
      logout,
      isLoading,
      error,
      refetchUser,
    }),
    [
      user,
      login,
      signup,
      logout,
      isLoading,
      error,
      refetchUser,
    ]
  );
});
