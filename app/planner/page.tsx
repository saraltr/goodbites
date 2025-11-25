import MealPlanner from "@/components/MealPlanner";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Register | Good Bites",
  description: "Join Good Bites!",
};

export default function PlannerPage() {
  return(
  <main className="min-h-screen bg-gray-50 p-6"><MealPlanner/></main>
  )
}