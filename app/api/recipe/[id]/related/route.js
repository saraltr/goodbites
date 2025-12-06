export async function GET(req, context) {
  const { id } = await context.params;

  if (!id) {
    return new Response(JSON.stringify({ message: "Recipe ID missing" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Fetch main recipe details
    const recipeRes = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    const recipeData = await recipeRes.json();

    if (!recipeData.meals) {
      return new Response(JSON.stringify({ message: "Recipe not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const recipe = recipeData.meals[0];
    const category = recipe.strCategory;
    const area = recipe.strArea;

    let related = [];

    // Match by category first
    if (category) {
      const catRes = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
      );
      const catData = await catRes.json();
      if (catData.meals) related.push(...catData.meals);
    }

    // Fallback by area
    if (related.length < 6 && area) {
      const areaRes = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`
      );
      const areaData = await areaRes.json();
      if (areaData.meals) related.push(...areaData.meals);
    }

    // Remove duplicates + exclude current recipe
    related = related
      .filter((meal, index, self) =>
        index === self.findIndex((m) => m.idMeal === meal.idMeal)
      )
      .filter((meal) => meal.idMeal !== id)
      .slice(0, 6);

    return new Response(JSON.stringify(related), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Error fetching related recipes:", err);
    return new Response(
      JSON.stringify({ message: "Failed to load related recipes" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
