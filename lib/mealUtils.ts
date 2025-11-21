import {
  ALL_YEAR_INGREDIENTS,
  SEASONAL_INGREDIENTS,
  MONTHLY_INGREDIENTS,
} from "./ingredients";

// Normalize for matching
export function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/[^a-z ]/g, "");
}

// Extract up to 20 ingredients from MealDB object
export function getMealIngredients(meal: any): string[] {
  const ingredients: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const raw = meal[`strIngredient${i}`];
    if (raw && raw.trim() !== "") {
      ingredients.push(normalize(raw));
    }
  }
  return ingredients;
}

// Check if ingredient is available this month
export function isIngredientInSeason(ingredient: string): boolean {
  const month = new Date().getMonth(); // 0–11

  const monthlyList = MONTHLY_INGREDIENTS[month];
  if (monthlyList?.some((i) => normalize(i) === ingredient)) return true;

  // Check broad seasonal categories
  const lowerIng = ingredient.toLowerCase();
  const seasonGroups = Object.values(SEASONAL_INGREDIENTS);
  for (const group of seasonGroups) {
    if (group.some((i) => normalize(i) === lowerIng)) return true;
  }

  return false;
}

// Check if ingredient is all-year
export function isAllYearIngredient(ingredient: string): boolean {
  return ALL_YEAR_INGREDIENTS.some(
    (i) => normalize(i) === normalize(ingredient)
  );
}

// Compute seasonal score: higher = more seasonal
export function computeSeasonalScore(ingredients: string[]): number {
  let score = 0;

  ingredients.forEach((ing) => {
    if (isIngredientInSeason(ing)) score += 3;
    else if (isAllYearIngredient(ing)) score += 1;
  });

  return score;
}

// Detect reused ingredients
export function getReuseInfo(
  ingredients: string[],
  usedBefore: Set<string>
): string[] {
  return ingredients.filter((i) => usedBefore.has(i));
}

// Update usedIngredients set after selecting a meal
export function registerIngredients(
  ingredients: string[],
  usedBefore: Set<string>
) {
  ingredients.forEach((i) => usedBefore.add(i));
}
