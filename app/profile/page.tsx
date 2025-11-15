"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // The middleware already protects this page, so we can expect a user to be logged in.
    // This page just redirects to the user's specific profile page.
    if (!loading && user) {
      router.replace(`/profile/${user.uid}`);
    }
  }, [user, loading, router]);

  // Show a loading state while we wait for the user object and redirect.
  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg">Loading profile...</p>
    </div>
  );
}
