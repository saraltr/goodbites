"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [heroImage, setHeroImage] = useState("");

  // Load a random food image from API
  useEffect(() => {
    async function loadRandomImage() {
      try {
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
        const data = await res.json();
        setHeroImage(
          data?.meals?.[0]?.strMealThumb || "/images/placeholder-food.jpg"
        );
      } catch (err) {
        console.error("Failed to fetch hero image:", err);
        setHeroImage("/images/placeholder-food.jpg");
      }
    }
    loadRandomImage();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafaf8]">

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT TEXT */}
        <div>
          <h1 className="text-5xl font-extrabold text-[#2e7d32] leading-tight">
            Eat Smart.<br />Save Money.<br />Stress-Free Meals.
          </h1>

          <p className="text-gray-700 text-lg mt-6">
            GoodBites helps you plan delicious meals while staying within your budget.
            Discover recipes, track your spending, and enjoy smarter meal planning.
          </p>

          <a
            href="/register"
            className="inline-block mt-8 bg-green-600 hover:bg-green-700 
                       text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Get Started — Sign Up
          </a>
        </div>

        {/* RIGHT IMAGE */}
        <img
          src={heroImage}
          alt="Random meal"
          className="rounded-2xl shadow-lg w-full object-cover max-h-[400px]"
        />
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center">

          <div>
            <h3 className="text-2xl font-bold text-[#2e7d32] mb-3">
              Smart Budgeting
            </h3>
            <p className="text-gray-700">
              Track estimated meal costs automatically.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-[#2e7d32] mb-3">
              Simple Planning
            </h3>
            <p className="text-gray-700">
              Generate weekly menus tailored to your budget.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-[#2e7d32] mb-3">
              Recipe Discovery
            </h3>
            <p className="text-gray-700">
              Explore thousands of meals from around the world.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
