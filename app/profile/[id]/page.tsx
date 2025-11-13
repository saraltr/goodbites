import ProfileInfo from "@/components/ProfileInfo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Good Bites",
  description: "Good Bites user profile page",
};

export default function ProfilePage() {
  return (
    <>
      <ProfileInfo></ProfileInfo>
    </>
  )
}
