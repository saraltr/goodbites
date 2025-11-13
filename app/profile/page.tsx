"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// redirect users to their own profile or to the login page 
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/profile/${user.uid}`);
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  //  redirecting
  return null;
}