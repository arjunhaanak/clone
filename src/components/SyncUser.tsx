"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export default function SyncUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  const createUser = useMutation(api.users.createUser);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !synced) {
      const sync = async () => {
        try {
          const result = await createUser({
            name: user.fullName || user.username || "Anonymous",
            email: user.primaryEmailAddress?.emailAddress || "",
            image: user.imageUrl || "",
          });
          if (result) {
            console.log("User synced successfully");
            setSynced(true);
          }
        } catch (e) {
          console.error("User sync error:", e);
        }
      };
      
      sync();
    }
  }, [isLoaded, isSignedIn, user, createUser, synced]);

  return null;
}
