export async function GET(req, context) {
  const { id } = await context.params;   // ⭐ REQUIRED FIX

  if (!id) {
    return new Response(JSON.stringify({ message: "Recipe ID missing" }), {
      status: 400,
    });
  }

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
      { cache: "no-store" }
    );

    const data = await response.json();

    if (!data?.meals?.length) {
      return new Response(JSON.stringify({ message: "Recipe not found" }), {
        status: 404,
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

  } catch (err) {
    console.error("Error fetching recipe:", err);
    return new Response(
      JSON.stringify({ message: "Failed to fetch recipe" }),
      { status: 500 }
    );
  }
}

function calculateCost(meal) {
  const count = Object.keys(meal).filter(
    (k) => k.startsWith("strIngredient") && meal[k]
  ).length;
  return (4 + count * 0.75).toFixed(2);
}

function calculateNutrition(meal) {
  return {
    calories: 400 + Math.floor(Math.random() * 200),
    protein: 20,
    fat: 15,
  };
}
