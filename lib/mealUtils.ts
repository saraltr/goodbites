import {
  ALL_YEAR_INGREDIENTS,
  SEASONAL_INGREDIENTS,
  MONTHLY_INGREDIENTS,
} from "./ingredients";

import { MealDetails, Nutrition, MealDB } from "./types";

// Normalize for matching
export function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/[^a-z ]/g, "");
}


// Extract up to 20 ingredients from MealDB object
export function getMealIngredients(meal: MealDB): string[] {
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

// cost calculation based on meal title
export function baseMealCost(title: string): number {
  title = title.toLowerCase();
  if (/chicken|pork|beef|lamb|fish|seafood|goat|duck/.test(title)) return 8.5;
  if (/cheese|eggs|tofu|legumes|stew|curry/.test(title)) return 6;
  return 4.5;
}

// calculate full meal cost
export function calculateFullCost(meal: MealDetails): number {
  const baseCost = 4;
  const ingredientCount = meal.ingredients.length;
  return parseFloat((baseCost + ingredientCount * 0.75).toFixed(2));
}

export function calculateNutrition(title: string): Nutrition {
  title = title.toLowerCase();

  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;

  // Protein-based meals (meat, fish, poultry)
  if (/chicken|pork|beef|lamb|fish|seafood|goat|duck/.test(title)) {
    calories = 400;  
    protein = 30;    // 3–4 oz protein portion
    fat = 18;        // lean to moderate fat
    carbs = 25;      // side of starch/veg
  } 
  // Starchy meals (pasta, rice, potatoes, bread)
  else if (/pasta|rice|potato|fettuccine|bread/.test(title)) {
    calories = 350;  
    protein = 12;    
    fat = 8;         
    carbs = 55;      // main carb source
  } 
  // Vegetarian / Legume-based meals
  else if (/vegetarian|vegan|stew|curry|legumes|tofu|salad/.test(title)) {
    calories = 300;  
    protein = 15;    
    fat = 12;        
    carbs = 40;      
  } 
  // Desserts
  else if (/dessert|cake|cookie|souffle|pudding|crema|chocolate/.test(title)) {
    calories = 250;  
    protein = 4;     
    fat = 15;        
    carbs = 35;      
  } 
  // Default / Mixed meals
  else {
    calories = 350;  
    protein = 18;    
    fat = 12;        
    carbs = 35;      
  }

  return { calories, protein, fat, carbs};
}