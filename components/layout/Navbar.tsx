"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/utils/FirebaseConfig";

export default function Navbar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth!);
    document.cookie = "__session=; path=/; max-age=0";
    window.location.href = "/";
  };

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* LOGO */}
        <Link href="/" className="text-3xl font-extrabold text-green-600">
          GoodBites
        </Link>

        {/* NAV LINKS */}
        <div className="flex items-center gap-8 text-gray-800 font-medium">
          <Link href="/planner">Meal Planner</Link>
          <Link href="/recipes">Recipes</Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              Log Out
            </button>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
