"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updateProfile,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { db, auth } from "@/utils/FirebaseConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import Modal from "@/components/Modal";
import { FirestoreUser } from "@/lib/types";

export default function ProfileInfo() {
  // get user id from url params
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  // handle dynamic route id (in case of array form)
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // local state for user profile data and ui behavior
  const [profileUser, setProfileUser] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [reauthMessage, setReauthMessage] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // fetch user profile data from firestore when component loads
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const docRef = doc(db!, "users", id);
        const userSnap = await getDoc(docRef);

        // if user document exists, update local state
        if (userSnap.exists()) {
          const userData = userSnap.data() as FirestoreUser;
          setProfileUser(userData);
          setNewUsername(userData.username);
          setNewEmail(userData.email);
        }
      } catch (error) {
        console.error("error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // handle logout and redirect to home
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

  // handle saving updated profile info
  const handleSave = async (): Promise<void> => {
    if (!id || !currentUser) return;
    setSaving(true);

    try {
      // update username and email in firestore
      const userRef = doc(db!, "users", id);
      await updateDoc(userRef, {
        username: newUsername,
        email: newEmail,
      });

      // update firebase auth display name
      try {
        await updateProfile(currentUser, { displayName: newUsername });
      } catch (error) {
        const e = error as FirebaseError;
        // check if user needs to reauthenticate before updating profile
        if (
          (e.code === "auth/requires-recent-login" ||
            e.code === "auth/user-token-expired") &&
          newEmail !== currentUser.email
        ) {
          setReauthMessage(true);
          setTimeout(() => {
            router.push("/login");
          }, 5000);
          return;
        } else {
          throw error;
        }
      }

      // update firebase auth email if changed
      if (newEmail !== currentUser.email) {
        try {
          await verifyBeforeUpdateEmail(currentUser, newEmail);
          setModalMessage(
            `A verification link has been sent to ${newEmail}. Please verify it to finalize the email change.`
          );
          setModalOpen(true);
        } catch (error) {
          const e = error as FirebaseError;
          if (e.code === "auth/requires-recent-login") {
            setReauthMessage(true);
            setTimeout(() => {
              router.push("/login");
            }, 5000);
            return;
          } else {
            setModalMessage("Failed to initiate email change. Please try again.");
            setModalOpen(true);
          }
        }
      }

      // update local state after saving
      setProfileUser({
        ...profileUser!,
        username: newUsername,
        email: newEmail,
      });
      setEditMode(false);
    } catch (error) {
      // handle save error
      setModalMessage(`Error while updating your profile: ${error}. Please try again.`);
      setModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  // show loading or missing user messages
if (loading)
  return (
    <p className="text-center mt-10 text-gray-600 text-lg">
      Loading...
    </p>
  );

if (!profileUser && !loading)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-md max-w-md w-full text-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-4xl font-bold mb-4">
            !
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            User not found
          </h2>
          <p className="text-gray-600 mb-6">
            The profile you’re looking for doesn’t exist or may have been removed.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition"
          >
            Go back home
          </button>
        </div>
      </div>
    </div>
  );



  // check if current user owns this profile
  const isOwner = currentUser?.uid === id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-3xl mx-auto">
        {/* show reauth message only if the user must log in again */}
        {reauthMessage && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center">
            You need to reauthenticate with your new email. Redirecting to login page...
          </div>
        )}

        {/* main profile card */}
        <div
          className="
            bg-white p-6 sm:p-8 rounded-3xl shadow 
            flex flex-col md:flex-row items-center md:items-start text-center md:text-left
            gap-6 md:gap-10
          "
        >
          {/* user avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-green-600 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold text-white">
              {profileUser!.username.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* profile info section */}
          <div className="w-full">
            {editMode ? (
              <>
                {/* username input */}
                <label
                  htmlFor="username"
                  id="username"
                  className="block text-left font-medium mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="border rounded-lg p-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  name="username"
                  id="username"
                />

                {/* email input */}
                <label
                  htmlFor="email"
                  id="email"
                  className="block text-left font-medium mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="border rounded-lg p-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  name="email"
                  id="email"
                />

                {/* save and cancel buttons */}
                <div className="flex gap-3 justify-center md:justify-start">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="bg-gray-300 text-black py-2 px-6 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* display profile info */}
                <h2 className="text-2xl sm:text-3xl font-bold text-green-700">
                  {profileUser!.username}
                </h2>
                <p className="text-gray-700 mt-1 break-words">{profileUser!.email}</p>
                <p className="text-gray-500 text-sm mt-2">
                  joined:{" "}
                  {profileUser!.createdAt?.toDate().toLocaleDateString() ?? "unknown"}
                </p>

                {/* show edit and logout buttons if user owns profile */}
                {isOwner && (
                  <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* modal */}
      <Modal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
