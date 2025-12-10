const CACHE_TTL = 5 * 60 * 1000;
let CACHE = {};
let ALL_MEALS_CACHE = null;

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Pagination
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  // Filters
  const query = searchParams.get("query")?.toLowerCase() || "";
  const categoriesParam = searchParams.get("categories");
  const selectedCategories = categoriesParam ? categoriesParam.split(",") : [];
  const diet = searchParams.get("diet")?.toLowerCase() || "";

  const cacheKey = `${query}-${selectedCategories.join(",")}-${diet}`;


  // Return from CACHE if exists
  if (CACHE[cacheKey] && Date.now() - CACHE[cacheKey].time < CACHE_TTL) {
    const meals = CACHE[cacheKey].data;
    return Response.json(paginate(meals, page, limit));
  }

  try {
    // 2) ALL meals from A–Z (cached globally)
    const allMeals = await loadAllMeals();


    // 3) Combined search (name + ingredients)
    let filtered = allMeals;

    if (query) {
      filtered = filtered.filter(
        (meal) =>
          meal.strMeal.toLowerCase().includes(query) ||
          meal.ingredientsList.some((i) => i.includes(query))
      );
    }


    // 4) Category filtering
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((meal) =>
        selectedCategories.includes(meal.strCategory)
      );
    }

    // 5) Diet filtering
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

    // 6) Add cost + nutrition
    const enriched = filtered.map((meal) => ({
      ...meal,
      estimatedCost: calculateCost(meal),
      nutrition: calculateNutrition(),
    }));

    // Save to CACHE
    CACHE[cacheKey] = {
      time: Date.now(),
      data: enriched,
    };

    return Response.json(paginate(enriched, page, limit));
  } catch (err) {
    console.error("API ERROR:", err);
    return Response.json({ message: "Failed to fetch recipes" }, { status: 500 });
  }
}

/* -------------------------------------------------------
LOAD ALL MEALS A–Z + CACHE GLOBALLY
------------------------------------------------------- */
async function loadAllMeals() {
  if (ALL_MEALS_CACHE && Date.now() - ALL_MEALS_CACHE.time < CACHE_TTL) {
    return ALL_MEALS_CACHE.data;
  }

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  let meals = [];

  // Fetch A–Z in PARALLEL
  const requests = alphabet.map((letter) =>
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`)
  );

  const responses = await Promise.all(requests);

  for (const res of responses) {
    const data = await res.json();
    if (data.meals) {
      meals.push(
        ...data.meals.map((meal) => ({
          ...meal,
          ingredientsList: extractIngredients(meal),
        }))
      );
    }
  }

  ALL_MEALS_CACHE = {
    time: Date.now(),
    data: meals,
  };

  return meals;
}

  //  Helper Functions

function extractIngredients(meal) {
  let ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const item = meal[`strIngredient${i}`];
    if (item && item.trim()) ingredients.push(item.toLowerCase());
  }
  return ingredients;
}

function calculateCost(meal) {
  const ingredientCount = extractIngredients(meal).length;
  return (4 + ingredientCount * 0.75).toFixed(2);
}

function calculateNutrition() {
  const calories = 150 + Math.floor(Math.random() * 200);
  return {
    calories,
    protein: Math.floor(calories / 12),
    fat: Math.floor(calories / 18),
  };
}

function paginate(items, page, limit) {
  const start = (page - 1) * limit;
  return {
    meals: items.slice(start, start + limit),
    totalPages: Math.ceil(items.length / limit),
  };
}
