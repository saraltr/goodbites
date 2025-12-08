"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/utils/FirebaseConfig";
import { useRouter } from "next/navigation";
import { Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async (): Promise<void> => {
    try {
      // call api route to delete session cookie
      await fetch("/api/auth/logout", { method: "POST" });

      // also sign out client auth
      await auth!.signOut();

      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div className="flex flex-col">
          <span>{user?.displayName}</span>
          <span className="text-gray-500">{user?.email}</span>
        </div>
      ),
    },
    {
      key: "2",
      label: <Link href="/profile/favorites">Favorites</Link>,
    },
    {
      key: "3",
      label: <Link href="/profile/edit">Edit Profile</Link>,
    },
    {
      key: "4",
      label: "Logout",
      onClick: handleLogout,
    },
  ];

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
            <Dropdown menu={{ items }} placement="bottomRight">
              <Avatar className="cursor-pointer bg-green-600">
                {user.displayName ? user.displayName[0].toUpperCase() : ""}
              </Avatar>
            </Dropdown>
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