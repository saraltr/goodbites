"use client";

import { useAuth } from "@/contexts/AuthContext";

// testing auth state across the app
export default function TestAuth() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 text-lg">
        Checking authentication...
      </p>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
      {user ? (
        <>
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Logged in
          </h1>
          <p className="text-gray-700 mb-4">
            Welcome, {user.displayName || user.email}!
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Not logged in
          </h1>
          <p className="text-gray-700 mb-4">
            Please sign in to continue.
          </p>
        </>
      )}
    </div>
  );
}
