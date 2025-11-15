"use client";

import { useState, useEffect } from "react";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecipes = async (term = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/recipes?search=${term}`);
      const data = await response.json();

      if (!response.ok || !data || data.message === "No recipes found") {
        setRecipes([]);
        setError("No recipes found. Please try another search.");
      } else {
        setRecipes(data);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setRecipes([]);
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    (async () => await fetchRecipes())();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes(search);
  };

  return (
    <main className="p-8 bg-[#fafaf8] min-h-screen">
      <h1 className="text-4xl font-bold text-[#2e7d32] mb-6">Find Recipes</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Search by recipe name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-xl transition"
        >
          Search
        </button>
      </form>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center mt-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
        </div>
      )}

      {/* Error Message */}
      {!loading && error && (
        <div className="text-center mt-10">
          <p className="text-red-600 font-medium text-lg">{error}</p>
          <button
            onClick={() => fetchRecipes()}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Recipe Grid */}
      {!loading && !error && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.idMeal}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden border border-gray-100"
            >
              <img
                src={recipe.strMealThumb}
                alt={recipe.strMeal}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {recipe.strMeal}
                </h2>
                <p className="text-sm text-gray-600">
                  {recipe.strCategory} • {recipe.strArea}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  💲 {recipe.estimatedCost} • 🔥 {recipe.nutrition.calories} cal
                </p>
                <a
                  href={`/recipe/${recipe.idMeal}`}
                  className="inline-block mt-3 text-green-600 hover:underline text-sm font-medium"
                >
                  View Recipe →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
