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
  const title = meal.strMeal.toLowerCase(); // use meal name

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