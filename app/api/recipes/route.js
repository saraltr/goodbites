export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get("search");
  const ingredient = searchParams.get("ingredient");
  const category = searchParams.get("category");
  const diet = searchParams.get("diet");

  try {
    let apiUrl = "";

    // 🎯 PRIORITY ORDER: search > ingredient > category > default
    if (name) {
      apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`;
    } else if (ingredient) {
      apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`;
    } else if (category) {
      apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
    } else {
      // default: get all recipes that start with "a"
      apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?f=a`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.meals) {
      return new Response(JSON.stringify({ message: "No recipes found" }), {
        status: 404,
      });
    }

    // If ingredient or category filters are used, results return limited data → lookup each recipe
    let meals = [];
    if (ingredient || category) {
      for (const item of data.meals) {
        const full = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${item.idMeal}`
        );
        const fullData = await full.json();
        if (fullData.meals && fullData.meals[0]) {
          meals.push(fullData.meals[0]);
        }
      }
    } else {
      meals = data.meals;
    }

    // 🥦 Apply dietary filter manually
    if (diet) {
      meals = meals.filter((meal) => {
        const tags = meal.strTags?.toLowerCase() || "";

        switch (diet) {
          case "vegan":
            return tags.includes("vegan");
          case "vegetarian":
            return tags.includes("vegetarian");
          case "low-fat":
            return tags.includes("low-fat") || tags.includes("low fat");
          default:
            return true;
        }
      });
    }

    // Add cost + nutrition
    const extended = meals.map((meal) => ({
      ...meal,
      estimatedCost: calculateCost(meal),
      nutrition: calculateNutrition(meal),
    }));

    return new Response(JSON.stringify(extended), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch recipes" }),
      { status: 500 }
    );
  }
}

function calculateCost(meal) {
  const ingredientCount = Object.keys(meal).filter(
    (k) => k.startsWith("strIngredient") && meal[k]
  ).length;
  return (4 + ingredientCount * 0.75).toFixed(2);
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