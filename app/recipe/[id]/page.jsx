"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import AddToFavorites from "@/components/FavButton";
import ScrollToTop from "@/components/ScrollToTop";

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedRecipes, setRelatedRecipes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [error, setError] = useState("");

  const userHasReviewed = useMemo(
    () => reviews.some((review) => review.userId === user?.uid),
    [reviews, user]
  );

  useEffect(() => {
    async function fetchAll() {
      try {
        /* ---------------------- FETCH MAIN RECIPE ---------------------- */
        const recipeResponse = await fetch(`/api/recipe/${id}`);
        const recipeData = await recipeResponse.json();

        if (
          !recipeResponse.ok ||
          !recipeData ||
          recipeData.message === "Recipe not found"
        ) {
          setError("Recipe not found. Please try another one.");
          setLoading(false);
          return;
        }

        setRecipe(recipeData);

        /* ------------------------- FETCH REVIEWS ------------------------- */
        const reviewsResponse = await fetch(`/api/recipes/${id}/reviews`);
        const reviewsData = await reviewsResponse.json();
        if (reviewsResponse.ok) setReviews(reviewsData);

        /* ------------------- FETCH RELATED RECIPES ------------------- */
        try {
          const relatedRes = await fetch(`/api/recipe/${id}/related`);
          const relatedData = await relatedRes.json();

          if (relatedRes.ok && Array.isArray(relatedData)) {
            setRelatedRecipes(relatedData);
          } else {
            setRelatedRecipes([]);
          }
        } catch (err) {
          console.error("Failed to load related recipes:", err);
          setRelatedRecipes([]);
        }

        setLoadingRelated(false);
      } catch (err) {
        console.error("Error fetching recipe details:", err);
        setError("Unable to load recipe details.");
      }

      setLoading(false);
    }

    if (id) fetchAll();
  }, [id]);

  /* ----------------------- HANDLERS FOR REVIEWS ----------------------- */
  const handleReviewSubmit = (newReview) =>
    setReviews((prev) => [newReview, ...prev]);

  const handleReviewUpdate = (updatedReview) =>
    setReviews((prev) =>
      prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
    );

  const handleReviewDelete = (reviewId) =>
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));

  /* ----------------------------- LOADING ------------------------------ */
  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen bg-[#fafaf8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
      </main>
    );
  }

  /* ----------------------------- ERROR ------------------------------ */
  if (error) {
    return (
      <main className="text-center p-6 bg-[#fafaf8] min-h-screen">
        <p className="text-red-600 font-medium">{error}</p>

        <a
          href="/recipes"
          className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
        >
          Back to Recipes
        </a>

        <ScrollToTop />
      </main>
    );
  }

  /* --------------------------- MAIN PAGE --------------------------- */
  return (
    <main className="p-8 bg-[#fafaf8] min-h-screen">
      <ScrollToTop />

      {/* Back to Recipes */}
      <a
        href="/recipes"
        className="inline-block mb-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-xl"
      >
        ← Back to Recipes
      </a>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-[#2e7d32] mb-4">
          {recipe.strMeal}
        </h1>

        {/* Image */}
        <div className="relative w-full max-h-[400px] mb-6">
          <Image
            src={
              recipe.strMealThumb?.trim()
                ? recipe.strMealThumb
                : "/images/placeholder-food.jpg"
            }
            alt={recipe.strMeal}
            width={500}
            height={400}
            loading="lazy"
            className="w-full max-h-[400px] object-cover rounded-xl shadow mb-6"
          />

          {/* Favorites Button */}
          {user && (
            <div className="absolute top-3 right-3 z-10">
              <AddToFavorites mealId={id} />
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="text-gray-700 mb-6">{recipe.strInstructions}</p>

        {/* Ingredients */}
        <h2 className="text-xl text-gray-700 font-semibold mb-3">Ingredients</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          {Array.from({ length: 20 }).map((_, i) => {
            const ing = recipe[`strIngredient${i + 1}`];
            const measure = recipe[`strMeasure${i + 1}`];
            return ing && <li key={i}>{ing} — {measure}</li>;
          })}
        </ul>

        {/* Nutrition */}
        <p className="mt-6 text-gray-600">
          💲 Estimated Cost: ${recipe.estimatedCost} • 🔥{" "}
          {recipe.nutrition.calories} cal • 💪 {recipe.nutrition.protein}g protein
        </p>

        {/* YouTube */}
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

        {/* Reviews */}
        <div className="mt-8 border-t pt-8">
          <ReviewList
            reviews={reviews}
            recipeId={id}
            onReviewUpdate={handleReviewUpdate}
            onReviewDelete={handleReviewDelete}
          />

          {!userHasReviewed && (
            <ReviewForm recipeId={id} onReviewSubmit={handleReviewSubmit} />
          )}
        </div>
      </div>

      {/* --------------------- RELATED RECIPES --------------------- */}
      <div className="mt-12 border-t pt-10">
        <h2 className="text-2xl font-bold text-[#2e7d32] mb-6">
          You Might Also Like
        </h2>

        {loadingRelated && <p className="text-gray-600">Loading related recipes...</p>}

        {!loadingRelated && relatedRecipes.length === 0 && (
          <p className="text-gray-600">No related recipes available.</p>
        )}

        {!loadingRelated && relatedRecipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedRecipes.map((meal) => (
              <a
                key={meal.idMeal}
                href={`/recipe/${meal.idMeal}`}
                className="bg-white rounded-xl shadow hover:shadow-lg transition block overflow-hidden border"
              >
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <p className="font-semibold text-gray-900">
                    {meal.strMeal}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
