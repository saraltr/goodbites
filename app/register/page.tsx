import type { Metadata } from "next";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Register | Good Bites",
  description: "Join Good Bites!",
};

export default function RegisterPage() {
  return <RegisterForm></RegisterForm>;
}
