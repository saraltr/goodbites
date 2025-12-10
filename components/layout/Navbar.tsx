"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/utils/FirebaseConfig";
import { useRouter } from "next/navigation";
import { Avatar, Drawer, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

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
          <Link href="/profile">
          <span>{user?.displayName}</span>
          <br />
          <span className="text-gray-500">{user?.email}</span>
          </Link>
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
        <div className="hidden md:flex flex items-center gap-8 text-black font-medium text-green-600">
          <Link href="/planner">Meal Planner</Link>
          <Link href="/recipes">Recipes</Link>
          <Link href="/about">About</Link>

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
        {/* Mobile menu button */}
        <button
          className="md:hidden text-3xl text-black"
          onClick={() => setOpen(true)}

        >
          ☰
        </button>
      </div>

      <Drawer placement="right" open={open} onClose={() => setOpen(false)} width={280}>
      <div className="flex flex-col gap-6 text-lg">
          <Link href="/planner" onClick={() => setOpen(false)}>
            Meal Planner
          </Link>
          <Link href="/recipes" onClick={() => setOpen(false)}>
            Recipes
          </Link>
          <Link href="/about" onClick={() => setOpen(false)}>
            About
          </Link>

          {user ? (
            <div className="mt-6">
              {/* MOBILE PROFILE HEADER */}
              <div
                className="flex items-center justify-between cursor-pointer bg-gray-100 p-3 rounded-xl"
                onClick={() => setOpenUserMenu(!openUserMenu)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="bg-green-600 text-white">
                    {user.displayName?.[0]?.toUpperCase()}
                  </Avatar>
                  <div className="flex flex-col text-sm">
                    <span className="font-semibold">{user?.displayName}</span>
                    <span className="text-gray-500">{user?.email}</span>
                  </div>
                </div>
                <span className="text-gray-600 text-xl">{openUserMenu ? "▴" : "▾"}</span>
              </div>

              {/* MOBILE COLLAPSIBLE PROFILE MENU */}
              {openUserMenu && (
                <div className="mt-4 ml-2 flex flex-col gap-4 text-base border-l-2 border-gray-300 pl-4">
                  <Link href="/profile" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                  <Link href="/profile/favorites" onClick={() => setOpen(false)}>
                    Favorites
                  </Link>
                  <Link href="/profile/edit" onClick={() => setOpen(false)}>
                    Edit Profile
                  </Link>
                  <button onClick={handleLogout} className="text-left text-red-500">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 w-fit"
            >
              Sign In
            </Link>
          )}
        </div>
      </Drawer>
    </nav>
  );
}