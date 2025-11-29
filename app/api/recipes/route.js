const CACHE_TTL = 5 * 60 * 1000;
let CACHE = {};

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Pagination
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;

  // Filters
  const query = searchParams.get("query")?.toLowerCase() || "";
  const categoriesParam = searchParams.get("categories");
  const selectedCategories = categoriesParam ? categoriesParam.split(",") : [];
  const diet = searchParams.get("diet")?.toLowerCase() || "";

  const cacheKey = `${query}-${selectedCategories.join(
    ","
  )}-${diet}-allMeals`;

  // ---- 1) Return from cache if fresh ----
  if (CACHE[cacheKey] && Date.now() - CACHE[cacheKey].time < CACHE_TTL) {
    const cachedMeals = CACHE[cacheKey].data;
    const paginated = paginate(cachedMeals, page, limit);

    return Response.json(paginated);
  }

  try {
    // ---- 2) Fetch ALL meals A–Z (cached in memory) ----
    const allMeals = await loadAllMeals();

    // ---- 3) Apply combined search ----
    let filtered = allMeals;

    if (query) {
      filtered = filtered.filter(
        (meal) =>
          meal.strMeal.toLowerCase().includes(query) ||
          meal.ingredientsList.some((i) => i.includes(query))
      );
    }

    // ---- 4) Apply category filtering ----
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((meal) =>
        selectedCategories.includes(meal.strCategory)
      );
    }

    // ---- 5) Dietary filtering ----
    if (diet) {
      filtered = filtered.filter((meal) => {
        const tags = meal.strTags?.toLowerCase() || "";

        switch (diet) {
          case "vegan":
            return tags.includes("vegan");
          case "vegetarian":
            return tags.includes("vegetarian");
          case "low-fat":
            return tags.includes("low fat") || tags.includes("low-fat");
          default:
            return true;
        }
      });
    }

    // ---- 6) Add estimatedCost + nutrition ----
    const enriched = filtered.map((meal) => ({
      ...meal,
      estimatedCost: calculateCost(meal),
      nutrition: calculateNutrition(meal),
    }));

    // Save in cache
    CACHE[cacheKey] = {
      time: Date.now(),
      data: enriched,
    };

    // ---- 7) Paginate ----
    const paginated = paginate(enriched, page, limit);

    return Response.json(paginated);
  } catch (error) {
    console.error("API ERROR:", error);
    return Response.json(
      { message: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------
   LOAD ALL MEALS A–Z IN A SINGLE PASS + CACHE GLOBALLY
------------------------------------------------------- */
let ALL_MEALS_CACHE = null;

async function loadAllMeals() {
  if (ALL_MEALS_CACHE && Date.now() - ALL_MEALS_CACHE.time < CACHE_TTL) {
    return ALL_MEALS_CACHE.data;
  }

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  let meals = [];

  for (const letter of alphabet) {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
    );
    const data = await res.json();
    if (data.meals) {
      const expanded = data.meals.map((meal) => ({
        ...meal,
        ingredientsList: extractIngredients(meal),
      }));
      meals.push(...expanded);
    }
  }

  ALL_MEALS_CACHE = {
    time: Date.now(),
    data: meals,
  };

  return meals;
}

/* -------------------------------------------------------
   Helper Functions
------------------------------------------------------- */

// Extract the ingredient strings from the MealDB object
function extractIngredients(meal) {
  let ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const key = meal[`strIngredient${i}`];
    if (key && key.trim()) {
      ingredients.push(key.toLowerCase());
    }
  }
  return ingredients;
}

// Cost function based on number of ingredients
function calculateCost(meal) {
  const ingredientCount = extractIngredients(meal).length;
  return (4 + ingredientCount * 0.75).toFixed(2);
}

// Random nutritional values (safe: no SSR usage)
function calculateNutrition() {
  const calories = 150 + Math.floor(Math.random() * 200);
  return {
    calories,
    protein: Math.floor(calories / 12),
    fat: Math.floor(calories / 18),
  };
}

// Paginate a dataset
function paginate(items, page, limit) {
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    meals: items.slice(start, end),
    totalPages: Math.ceil(items.length / limit),
  };
}
