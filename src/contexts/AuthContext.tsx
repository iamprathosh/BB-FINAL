"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}

// Re-export Convex auth hooks for easy use throughout the app
export { useAuthActions } from "@convex-dev/auth/react";
export { useAuthToken } from "@convex-dev/auth/react";

// Custom hook to get the current authenticated user's complete profile
export function useCurrentUser() {
  // Use the 'current' query to fetch the full user document from the users table
  const user = useQuery(api.users.current);
  return user;
}

export function useConvexAuth() {
  const { signIn, signOut } = useAuthActions();
  const authToken = useAuthToken();
  
  return {
    isAuthenticated: !!authToken,
    isLoading: authToken === undefined,
    login: signIn,
    logout: signOut,
  };
}
