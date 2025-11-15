// app/api/recipe/[id]/route.js
export async function GET(_req, context) {
  const { id } = await context.params; // ✅ must await params

  try {
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    const response = await fetch(apiUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    if (!data?.meals?.length) {
      return new Response(JSON.stringify({ message: "Recipe not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const meal = data.meals[0];

    const extendedMeal = {
      ...meal,
      estimatedCost: calculateCost(meal),
      nutrition: calculateNutrition(meal),
    };

    return new Response(JSON.stringify(extendedMeal), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch recipe", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function calculateCost(meal) {
  const baseCost = 4;
  const ingredientCount = Object.keys(meal).filter(
    (k) => k.startsWith("strIngredient") && meal[k]
  ).length;
  return (baseCost + ingredientCount * 0.75).toFixed(2);
}

function calculateNutrition() {
  const calories = 150 + Math.floor(Math.random() * 200);
  return {
    calories,
    protein: Math.floor(calories / 12),
    fat: Math.floor(calories / 18),
  };
}
