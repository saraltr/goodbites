"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipe/${id}`);
        const data = await response.json();

        if (!response.ok || !data || data.message === "Recipe not found") {
          setError("Recipe not found. Please try another one.");
        } else {
          setRecipe(data);
        }
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Unable to load recipe details.");
      }
      setLoading(false);
    };

    if (id) fetchRecipe();
  }, [id]);

  if (loading)
    return (
      <main className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
      </main>
    );

  if (error)
    return (
      <main className="text-center p-6">
        <p className="text-red-600 font-medium">{error}</p>
        <a
          href="/recipes"
          className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
        >
          Back to Recipes
        </a>
      </main>
    );

  return (
    <main className="p-8 bg-[#fafaf8] min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-[#2e7d32] mb-4">
          {recipe.strMeal}
        </h1>

        {/* Recipe Image */}
<img
  src={
    recipe.strMealThumb && recipe.strMealThumb.trim() !== ""
      ? recipe.strMealThumb
      : "/images/placeholder-food.jpg"
  }
  alt={recipe.strMeal || "Recipe image"}
  className="w-full max-h-[400px] object-cover rounded-xl shadow mb-6"
/>

        <p className="text-gray-700 mb-6">{recipe.strInstructions}</p>

        <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          {Array.from({ length: 20 }).map((_, i) => {
            const ingredient = recipe[`strIngredient${i + 1}`];
            const measure = recipe[`strMeasure${i + 1}`];
            return (
              ingredient && (
                <li key={i}>
                  {ingredient} — {measure}
                </li>
              )
            );
          })}
        </ul>

        <p className="mt-6 text-gray-600">
          💲 Estimated Cost: ${recipe.estimatedCost} • 🔥{" "}
          {recipe.nutrition.calories} cal • 💪 {recipe.nutrition.protein}g
          protein
        </p>

        {recipe.strYoutube && (
          <a
            href={recipe.strYoutube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-green-600 hover:underline font-medium"
          >
            ▶ Watch Tutorial on YouTube
          </a>
        )}

        <div className="mt-8">
          <a
            href="/recipes"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-xl"
          >
            ← Back to Recipes
          </a>
        </div>
      </div>
    </main>
  );
}
