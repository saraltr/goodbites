import { MealDetails } from "@/lib/types";
import { getMealIngredients, isIngredientInSeason, computeSeasonalScore, calculateNutrition, baseMealCost } from "@/lib/mealUtils";

const CATEGORIES = [
  "Beef",
  "Chicken",
  "Seafood",
  "Pork",
  "Lamb",
  "Vegetarian",
  "Vegan",
  "Dessert",
  "Pasta",
  "Side",
  "Starter",
  "Breakfast",
  "Miscellaneous",
] as const;

// fetch summary list of meals in a category
async function fetchMealsSummary(category: typeof CATEGORIES[number]) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
  if (!res.ok) return [];
  const data: { meals?: { idMeal: string; strMeal: string; strMealThumb: string }[] } = await res.json();
  return data.meals ?? [];
}

// fetch full meal details for a single meal
async function fetchMealDetails(mealId: string): Promise<MealDetails | null> {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    if (!res.ok) return null;
    const data = await res.json();
    const meal = data.meals?.[0];
    if (!meal) return null;

    const ingredients = getMealIngredients(meal);

    return {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      cost: baseMealCost(meal.strMeal),
      ingredients,
      isFresh: ingredients.some(isIngredientInSeason),
      seasonalScore: computeSeasonalScore(ingredients),
      nutrition: calculateNutrition(meal.strMeal),
    };
  } catch (err) {
    console.error("Error fetching meal details:", err);
    return null;
  }
}

// fetch meals by category with full details
export async function fetchMealsByCategory(category: typeof CATEGORIES[number]): Promise<MealDetails[]> {
  const summaryList = await fetchMealsSummary(category);
  const detailsPromises = summaryList.map((meal) => fetchMealDetails(meal.idMeal));
  const details = await Promise.all(detailsPromises);
  return details.filter(Boolean) as MealDetails[];
}

export async function GET() {
  try {
    const results = await Promise.all(CATEGORIES.map(fetchMealsByCategory));
    const flattened = results.flat();
    return new Response(JSON.stringify(flattened), { status: 200 });
  } catch (err) {
    console.error("Error fetching all categories:", err);
    return new Response(JSON.stringify([]), { status: 500 });
  }
}
