"use client";

import { useState, useEffect } from "react";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [category, setCategory] = useState("");
  const [diet, setDiet] = useState("");
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch recipes with filters
  const fetchRecipes = async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (ingredient) params.append("ingredient", ingredient);
    if (category) params.append("category", category);
    if (diet) params.append("diet", diet);

    try {
      const response = await fetch(`/api/recipes?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data || data.message === "No recipes found") {
        setRecipes([]);
        setError("No recipes found. Please try different filters.");
      } else {
        setRecipes(data);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  // Load categories + initial recipes
  useEffect(() => {
    async function initialize() {
      try {
        const res = await fetch(
          "https://www.themealdb.com/api/json/v1/1/list.php?c=list"
        );
        const data = await res.json();
        if (data.meals) setCategories(data.meals);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }

      await fetchRecipes();
    }
    initialize();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  return (
    <main className="p-8 bg-[#fafaf8] min-h-screen">
      <h1 className="text-4xl font-bold text-[#2e7d32] mb-6">Find Recipes</h1>

      {/* Search by Name */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col items-start gap-3 mb-6"
      >
        <label className="text-gray-900 font-semibold">Search by Name</label>
        <input
          type="text"
          placeholder="e.g. Pasta"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-2 
                     bg-white text-gray-900 placeholder-gray-500 
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold 
                     px-5 py-2 rounded-xl transition"
        >
          Search
        </button>
      </form>

      {/* Ingredient Filter */}
      <div className="mb-6 flex flex-col items-start">
        <label className="text-gray-900 font-semibold mb-2">
          Search by Ingredient
        </label>
        <input
          type="text"
          placeholder="e.g., chicken, garlic, rice..."
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-2
                     bg-white text-gray-900 placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Category Dropdown */}
      <div className="mb-6 flex flex-col items-start">
        <label className="text-gray-900 font-semibold mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-2
                     bg-white text-gray-900 focus:outline-none focus:ring-2 
                     focus:ring-green-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.strCategory} value={cat.strCategory}>
              {cat.strCategory}
            </option>
          ))}
        </select>
      </div>

      {/* Dietary Filters */}
      <div className="mb-6">
        <label className="block text-gray-900 font-semibold mb-2">
          Dietary Preference
        </label>

        <div className="flex gap-6 flex-wrap">
          {[
            { label: "None", value: "" },
            { label: "Vegetarian", value: "vegetarian" },
            { label: "Vegan", value: "vegan" },
            { label: "Low Fat", value: "low-fat" },
          ].map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-2 text-gray-900"
            >
              <input
                type="radio"
                name="diet"
                value={item.value}
                checked={diet === item.value}
                onChange={() => setDiet(item.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* Apply Filters Button */}
      <button
        onClick={fetchRecipes}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold 
                   px-6 py-2 rounded-xl mb-8"
      >
        Apply Filters
      </button>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center mt-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 
                          border-green-600"></div>
        </div>
      )}

      {/* Error Message */}
      {!loading && error && (
        <div className="text-center mt-10">
          <p className="text-red-600 font-medium text-lg">{error}</p>
          <button
            onClick={fetchRecipes}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white 
                       font-semibold px-4 py-2 rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Recipe Grid */}
      {!loading && !error && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
                        lg:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.idMeal}
              className="bg-white rounded-2xl shadow hover:shadow-lg 
                         transition overflow-hidden border border-gray-100"
            >
              <img
                src={recipe.strMealThumb || "/images/placeholder-food.jpg"}
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
                  className="inline-block mt-3 text-green-600 hover:underline 
                             text-sm font-medium"
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
