"use client";

import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/utils/FirebaseConfig";

// testing auth state across the app
export default function TestAuth() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth!);

      // 2️⃣ Clear server session cookie
      document.cookie = "__session=; path=/; max-age=0";

      // 3️⃣ Redirect to login page
      window.location.href = "/login";
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

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
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
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
