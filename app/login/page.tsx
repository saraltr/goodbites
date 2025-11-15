import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login | Good Bites",
  description: "Login to Good Bites!",
};

export default function LoginPage() {
  return <LoginForm />;
}
