"use client";

import { useState, useEffect } from "react";
import { Select } from "antd";

export default function RecipesPage() {
  // Recipes + pagination
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);

  // Filters
  const [query, setQuery] = useState(""); // 🔍 Combined name + ingredient search
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [diet, setDiet] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list");
        const data = await res.json();
        if (data.meals) setCategories(data.meals);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch recipes whenever filters or page/limit change
  useEffect(() => {
    fetchRecipes();
  }, [page, limit]);

  // Fetch recipes
  const fetchRecipes = async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    if (query) params.append("query", query);

    if (selectedCategories.length > 0) {
      params.append("categories", selectedCategories.join(","));
    }

    if (diet) params.append("diet", diet);

    try {
      const response = await fetch(`/api/recipes?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setRecipes([]);
        setError("No recipes found. Try another search.");
      } else {
        setRecipes(data.meals || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1);
    fetchRecipes();
  };

  return (
    <main className="p-8 bg-[#fafaf8] min-h-screen">
      <h1 className="text-4xl font-bold text-[#2e7d32] mb-6">Find Recipes</h1>

      {/* 🔍 Combined Search */}
      <div className="mb-6 flex flex-col items-start gap-2">
        <label className="text-gray-900 font-semibold">Search by Name or Ingredient</label>
        <input
          type="text"
          placeholder="e.g. Chicken, Rice, Pasta…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-2
                     bg-white text-gray-900 placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* 🗂 Multi-select Category Filter (AntD) */}
      <div className="mb-6 w-full max-w-md">
        <label className="text-gray-900 font-semibold mb-2 block">Categories</label>

        <Select
          mode="multiple"
          allowClear
          placeholder="Select categories"
          className="w-full text-black"
          onChange={(values) => {
            setSelectedCategories(values);
            setPage(1);
          }}
          value={selectedCategories}
          options={categories.map((c) => ({
            label: c.strCategory,
            value: c.strCategory,
          }))}
        />
      </div>

      {/* APPLY FILTERS */}
      <button
        onClick={applyFilters}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold 
                   px-6 py-2 rounded-xl mb-8 transition"
      >
        Apply Filters
      </button>

      {/* Dietary + Recipes Per Page */}
      <div className="mb-6 flex flex-col md:flex-row gap-10">
        {/* Dietary Filters */}
        <div>
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
              <label key={item.value} className="flex items-center gap-2 text-gray-900">
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

        {/* Recipes Per Page */}
        <div>
          <label className="block text-gray-900 font-semibold mb-2">
            Recipes Per Page
          </label>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-xl px-3 py-2 text-gray-900"
          >
            {[10, 20, 30, 40, 50].map((num) => (
              <option key={num} value={num} className="text-gray-900">
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <p className="text-center text-red-600 font-medium text-lg">{error}</p>
      )}

      {/* RECIPES GRID */}
      {!loading && !error && recipes.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.idMeal}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <img
                  src={recipe.strMealThumb || "/images/placeholder-food.jpg"}
                  alt={recipe.strMeal}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900">
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
                    className="text-green-600 hover:underline text-sm font-medium"
                  >
                    View Recipe →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`px-5 py-2 rounded-xl font-semibold transition
                ${
                  page === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 hover:scale-105"
                }`}
            >
              ← Previous
            </button>

            <span className="text-lg font-bold text-gray-900">
              Page {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-5 py-2 rounded-xl font-semibold transition
                ${
                  page === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 hover:scale-105"
                }`}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </main>
  );
}
