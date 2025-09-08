"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthToken } from "@convex-dev/auth/react";

export function AuthUserSetup() {
  const authToken = useAuthToken();
  const storeUser = useMutation(api.users.store);
  const [hasSetupUser, setHasSetupUser] = useState(false);

  useEffect(() => {
    const setupUser = async () => {
      // Check if user is authenticated and we haven't already set them up
      if (authToken && !hasSetupUser) {
        try {
          console.log("Setting up authenticated user...");
          await storeUser({});
          console.log("User successfully stored in appUsers table");
          setHasSetupUser(true);
        } catch (error) {
          console.error("User setup error:", error);
          // Don't set hasSetupUser to true if there was an error, so we can retry
        }
      } else if (!authToken) {
        // Reset setup flag when user logs out
        setHasSetupUser(false);
      }
    };

    // Add a small delay to ensure auth context is fully established
    const timer = setTimeout(setupUser, 1000);
    return () => clearTimeout(timer);
  }, [authToken, storeUser, hasSetupUser]);

  return null; // This component doesn't render anything
}
