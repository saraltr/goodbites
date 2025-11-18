// app/api/recipes/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const firstLetter = searchParams.get("letter");

  try {
    // Free endpoints
    const apiUrl = search
      ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`
      : firstLetter
      ? `https://www.themealdb.com/api/json/v1/1/search.php?f=${firstLetter}`
      : `https://www.themealdb.com/api/json/v1/1/search.php?s=`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.meals) {
      return new Response(JSON.stringify({ message: "No recipes found" }), {
        status: 404,
      });
    }

    // Extend data
    const extendedData = data.meals.map((meal) => ({
      ...meal,
      estimatedCost: calculateCost(meal),
      nutrition: calculateNutrition(meal),
    }));

    return new Response(JSON.stringify(extendedData), { status: 200 });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch recipes", error }),
      { status: 500 }
    );
  }
}

// Mock cost + nutrition calculations
function calculateCost(meal) {
  const baseCost = 4;
  const ingredientCount = Object.keys(meal).filter(
    (key) => key.startsWith("strIngredient") && meal[key]
  ).length;
  return (baseCost + ingredientCount * 0.75).toFixed(2);
}

function calculateNutrition(meal) {
  const calories = 150 + Math.floor(Math.random() * 200);
  return {
    calories,
    protein: Math.floor(calories / 12),
    fat: Math.floor(calories / 18),
  };
}
