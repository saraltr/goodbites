import type { Metadata } from "next";
import MealPlanner from "@/components/MealPlanner";

export const metadata: Metadata = {
  title: "Home | Good Bites",
  description: "Plan your meals smartly and stay within your budget!",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <MealPlanner></MealPlanner>
    </main>
  );
}
