"use client";

import { useState, useEffect } from "react";
import { Select } from "antd";
import AddToFavorites from "@/components/FavButton";
import { useAuth } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import Image from "next/image";

export default function RecipesPage() {
  const { user } = useAuth();

  // recipes + pagination
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);

  // filters
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [diet, setDiet] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // fetch categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(
          "https://www.themealdb.com/api/json/v1/1/list.php?c=list"
        );
        const data = await res.json();
        if (data.meals) setCategories(data.meals);
      } catch (err) {
        console.error("failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // fetch recipes whenever filters, page, or limit change
  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (query) params.append("query", query);
      if (selectedCategories.length > 0)
        params.append("categories", selectedCategories.join(","));
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
        console.error("error fetching recipes:", err);
        setError("something went wrong.");
      }

      setLoading(false);
    }

    fetchRecipes();
  }, [page, limit, query, selectedCategories, diet]);

  const applyFilters = () => setPage(1);

  return (
    <main className="p-8 bg-[#fafaf8] min-h-screen">
      <h1 className="text-4xl font-bold text-[#2e7d32] mb-6">Find Recipes</h1>

      {/* Search */}
      <div className="mb-6 flex flex-col items-start gap-2">
        <label className="text-gray-900 font-semibold">
          Search by Name or Ingredient
        </label>
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

      {/* Categories */}
      <div className="mb-6 w-full max-w-md">
        <label className="text-gray-900 font-semibold mb-2 block">
          Categories
        </label>
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

      {/* Apply Filters */}
      <button
        onClick={applyFilters}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold 
                   px-6 py-2 rounded-xl mb-8 transition"
      >
        Apply Filters
      </button>

      {/* Dietary + Recipes per page */}
      <div className="mb-6 flex flex-col md:flex-row gap-10">
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

      {/* Loading */}
      {loading && (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="text-center text-red-600 font-medium text-lg">{error}</p>
      )}

      {/* Recipes Grid */}
      {!loading && !error && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.idMeal}
              className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <div className="relative w-full h-48">
  <Image
    src={recipe.strMealThumb || "/images/placeholder-food.jpg"}
    alt={recipe.strMeal}
    fill
    loading="lazy"
    sizes="(max-width: 768px) 100vw,
           (max-width: 1024px) 50vw,
           25vw"
    className="object-cover rounded-md"
  />
</div>

              {/* Add to favorites only if user is logged in */}
              {user && (
                <div className="absolute top-2 right-2 z-10">
                  <AddToFavorites mealId={recipe.idMeal} />
                </div>
              )}

              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {recipe.strMeal}
                </h2>
                <p className="text-sm text-gray-600">
                  {recipe.strCategory} • {recipe.strArea}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  💲 {recipe.estimatedCost} • 🔥 {recipe.nutrition?.calories} cal
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
      )}

      {/* Pagination */}
      {!loading && !error && recipes.length > 0 && (
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
      )}
      <ScrollToTop/>
    </main>
  );
}
