"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-green-700 text-center">
          About Good Bites
        </h1>

        <section className="space-y-4 text-gray-800 leading-relaxed">
          <p>
            <strong>Good Bites</strong> is designed to help you plan meals smarter, eat healthier, and stay on budget, all while addressing a critical global issue: <strong>food waste</strong>.
          </p>
          <p>
            🌍 An estimated <strong><Link href="https://www.wri.org/insights/how-much-food-does-the-world-waste" target="_blank" className="text-green-600 underline hover:text-green-700">one-third of all food produced worldwide</Link></strong> is wasted, mostly at the household level. Spoiled ingredients and over-purchasing contribute to waste, extra costs, and greenhouse gas emissions.
          </p>
        </section>

        <section className="space-y-4 text-gray-800">
          <h2 className="text-2xl font-semibold text-green-700">Our platform integrates:</h2>
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
            <li>
                🍽️ Real recipe data from <Link href="https://www.themealdb.com/" target="_blank" className="text-green-600 underline hover:text-green-700">TheMealDB API</Link>, and we have enhanced them with <strong>calories and cost information</strong>. They follow official <Link href="https://quartermaster.army.mil/jccoe/publications/recipes/section_a/a026.pdf" target="_blank" className="text-green-600 underline hover:text-green-700">calorie guidelines</Link> to help you plan balanced, healthy meals.
            </li>

            <li>
                🥗 Dietary guidance from the <Link href="https://www.myplate.gov/myplate-plan/results/english/14-99/2000" target="_blank" className="text-green-600 underline hover:text-green-700">MyPlate Plan</Link> and <Link href="https://nutritionsource.hsph.harvard.edu/healthy-eating-plate/" target="_blank" className="text-green-600 underline hover:text-green-700">Harvard Healthy Eating Plate</Link>.
                </li>
            <li>
                💵 Food cost data from <Link href="https://www.fns.usda.gov/cnpp/usda-food-plans-cost-food-reports" target="_blank" className="text-green-600 underline hover:text-green-700">USDA Food Plans</Link>.
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-gray-800">
          <h2 className="text-2xl font-semibold text-green-700">Features:</h2>
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
            <li>📋 <strong>Meal Planner:</strong> Generate personalized menus based on seasonality, ingredient reuse, and budget. <br />
              <ul className="list-disc list-inside ml-6 space-y-1 text-gray-700">
                <li>🌿 Seasonal & Remaining Meals: Includes seasonal meals first, remaining meals are selected randomly, avoiding duplicates. <Link href="https://bonmatin.ca/en/nutrition-well-being/seasonal-foods-good-for-your-body-and-your-budget" target="_blank" className="text-green-600 underline hover:text-green-700">(Learn more about seasonal ingredients)</Link></li>
                <li>🧀 Ingredient Reuse: Tracks ingredients across meals to reduce waste and save money.</li>
                <li>🔄 Repeat Meals: Repeats may occur at lower cost to reuse ingredients and fill your menu.</li>
                <li>🍰 Desserts: Added only if budget allows, respecting daily/weekly limits and preferring seasonal options.</li>
                <li>💵 Budget & Costs: Meals added only if they fit your remaining budget. Costs are based on portions.</li>
                <li>📊 Balanced Plan: Prioritizes nutrition, seasonality, and budget using real U.S. supermarket prices.</li>
              </ul>
            </li>
            <li>👤 <strong>User Accounts:</strong>  Register to create your own profile, save your favorite recipes, and store generated meal plans for later. Export your plans as PDFs or images.</li>
            <li>🔍 <strong>Recipes Page:</strong> Search by title or ingredient, and filter by dietary preferences or recipe type.</li>
             <li>⭐ <strong>Recipe Reviews:</strong> Users can rate recipes with stars, add reviews, and edit or delete their own reviews.</li>
          </ul>
        </section>

        <section className="space-y-4 text-gray-800 leading-relaxed">
          <h2 className="text-2xl font-semibold text-green-700">Why It Works</h2>
           <p>
            📚 Research shows that households that plan meals, use leftovers creatively, and focus on seasonal foods waste significantly less and save money. With <strong>Good Bites</strong> , you can put these strategies into practice, reduce waste in your kitchen, improve your nutrition, and save money. Check seasonal produce guides like <Link href="https://www.freshfarm.org/whats-in-season" target="_blank" className="text-green-600 underline hover:text-green-700">FRESHFARM&apos;s guide</Link> to plan your meals more effectively!
          </p>
          <p>
            🙏 Inspired by stewardship principles, <strong> Good Bites </strong>reflects the belief that resources are a blessing meant to sustain life and not be wasted. Smart meal planning helps you live sustainably, save money, and manage your home better!
          </p>
        </section>

        <section>
            <p className="text-center mt-8 space-y-4">
                <span className="block text-lg font-medium text-gray-800">
                    Ready to start planning your meals and saving money?
                </span>
                <div className="flex flex-col md:flex-row justify-center gap-4 mt-2">
                    <Link
                    href="/planner"
                    className="inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-green-700 transition"
                    >
                    🍽️ Generate a Meal Plan
                    </Link>
                    <Link
                    href="/recipes"
                    className="inline-block bg-green-100 text-green-700 font-semibold px-6 py-3 rounded-md hover:bg-green-200 transition"
                    >
                    🔍 Explore Recipes
                    </Link>
                    <Link
                    href="/login"
                    className="inline-block bg-green-50 text-green-800 font-semibold px-6 py-3 rounded-md hover:bg-green-100 transition"
                    >
                    👤 Log In / Create Account
                    </Link>
                </div>
            </p>

        </section>
      </main>
    </div>
  );
}
