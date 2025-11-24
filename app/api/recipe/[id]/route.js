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

function calculateNutrition(meal) {
  const title = meal.strMeal.toLowerCase();

  let calories = 0;
  let protein = 0;
  let fat = 0;

  if (/chicken|pork|beef|lamb|fish|seafood|goat|duck/.test(title)) {
    calories = 600;  // average main protein meal
    protein = 35;    
    fat = 20;
  } else if (/pasta|rice|potato|fettuccine/.test(title)) {
    calories = 550; 
    protein = 18; 
    fat = 15;
  } else if (/vegetarian|vegan|stew|curry|legumes|tofu|salad/.test(title)) {
    calories = 400; 
    protein = 15; 
    fat = 12;
  } else if (/dessert|cake|cookie|souffle|pudding|crema|chocolate/.test(title)) {
    calories = 300; 
    protein = 5; 
    fat = 15;
  } else {
    calories = 400; 
    protein = 20; 
    fat = 15;
  }

  return { calories, protein, fat };
}