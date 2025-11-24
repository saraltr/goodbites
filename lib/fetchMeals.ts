import {
  getReuseInfo, registerIngredients, calculateFullCost
} from "@/lib/mealUtils";
import { MealDetails, MealResult } from "@/lib/types";

const REPEAT_MESSAGE = "Repeat Meal!";
const MAX_WEEKLY_MEALS = 16;
const MAX_DAILY_MEALS = 2;
const REPEAT_COST = 1;
const MAX_DAILY_DESSERTS = 1;
const MAX_WEEKLY_DESSERTS = 2;

// Shuffle array in-place
function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Check if a meal is a dessert
function isDessert(meal: MealResult) {
  return /(yogurt|cake|cookie|dessert|snack)/i.test(meal.title);
}

// Unique meal ID
function getUniqueMealId(id: string, type?: string, index?: number): string {
  return `${id}-${type ?? 'orig'}-${index ?? 0}-${Math.random().toString(36).slice(2, 5)}`;
}

// Pick a dessert
function pickDessert(
  meals: MealResult[],
  budgetLeft: number,
  alreadySelected: MealResult[],
  maxDesserts: number,
  usedIngredients: Set<string>
): MealResult | null {
  const currentDesserts = alreadySelected.filter(isDessert).length;
  if (currentDesserts >= maxDesserts) return null;

  const candidates = meals.filter(
    m => m.cost <= budgetLeft &&
         isDessert(m) &&
         !alreadySelected.some(s => s.originalId === m.originalId)
  );
  if (!candidates.length) return null;

  const seasonalCandidates = candidates.filter(m => m.isFresh);
  const chosenPool = seasonalCandidates.length ? seasonalCandidates : candidates;
  const chosen = chosenPool[Math.floor(Math.random() * chosenPool.length)];

  const reusedIngredients = getReuseInfo(chosen.ingredients, usedIngredients);

  return {
    ...chosen,
    id: getUniqueMealId(chosen.originalId, "dessert"),
    key: getUniqueMealId(chosen.originalId, "dessert-key"),
    reusedIngredients
  };
}

// to capitalize ingredients
function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function fetchMeals(
  budget: number,
  mode: "daily" | "weekly"
): Promise<MealResult[]> {
  try {
    let allMeals: MealDetails[] = [];

    const cached = localStorage.getItem("allMealsPool");
    if (cached) {
      allMeals = JSON.parse(cached);
    } else {
      const res = await fetch("/api/categories");
      const meals = res.ok ? await res.json() : [];
      allMeals = meals;
      localStorage.setItem("allMealsPool", JSON.stringify(allMeals));
    }

    if (!allMeals.length) return [];

    const usedIngredients = new Set<string>();
    const usedMealOriginalIds = new Set<string>();

    // format meals
    const formatted: MealResult[] = allMeals.map((meal, idx) => {
    const ingredients = meal.ingredients.map(capitalizeWords);
    const seasonalScore = meal.seasonalScore ?? 0;
    const isFresh = seasonalScore > 0;

    return {
      originalId: meal.idMeal,
      id: getUniqueMealId(meal.idMeal, "orig", idx),
      key: getUniqueMealId(meal.idMeal, "key", idx),
      title: meal.strMeal,
      image: meal.strMealThumb,
      cost: meal.cost ?? 0,
      fullCost: calculateFullCost(meal),
      nutrition: meal.nutrition,
      ingredients,
      reusedIngredients: [],
      isFresh,
      seasonalScore,
      includeSeasonal: isFresh,
      isRepeat: false,
      repeatCount: 1,
    };
  });


    // sort by seasonalScore, then cost
    formatted.sort((a, b) => {
      if (b.seasonalScore !== a.seasonalScore) return b.seasonalScore - a.seasonalScore;
      return a.cost - b.cost;
    });

    shuffleArray(formatted);

    const maxMeals = mode === "daily" ? MAX_DAILY_MEALS : MAX_WEEKLY_MEALS;
    const maxDesserts = mode === "daily" ? MAX_DAILY_DESSERTS : MAX_WEEKLY_DESSERTS;

    const plan: MealResult[] = [];
    let spent = 0;

    // add at least one seasonal meal
    const seasonalMeal = formatted.find(m => m.isFresh && !isDessert(m));
    if (seasonalMeal && seasonalMeal.cost <= budget) {
      const reusedIngredients = getReuseInfo(seasonalMeal.ingredients, usedIngredients);
      plan.push({ ...seasonalMeal, reusedIngredients });
      spent += seasonalMeal.cost;
      registerIngredients(seasonalMeal.ingredients, usedIngredients);
      usedMealOriginalIds.add(seasonalMeal.originalId);
    }

    // fill remaining meals
    while (plan.length < maxMeals && spent < budget) {
      const candidates = formatted.filter(
        m => !usedMealOriginalIds.has(m.originalId) && !isDessert(m) && spent + m.cost <= budget
      );
      if (!candidates.length) break;

      // weighted selection seasonalScore
      const totalWeight = candidates.reduce((sum, m) => sum + m.seasonalScore, 0);
      let r = Math.random() * totalWeight;
      let selected: MealResult | null = null;
      for (const m of candidates) {
        r -= m.seasonalScore;
        if (r <= 0) {
          selected = m;
          break;
        }
      }
      if (!selected) selected = candidates[0];

      const reusedIngredients = getReuseInfo(selected.ingredients, usedIngredients);
      const instance: MealResult = {
        ...selected,
        id: getUniqueMealId(selected.originalId, "inst"),
        key: getUniqueMealId(selected.originalId, "inst-key"),
        reusedIngredients
      };

      plan.push(instance);
      spent += instance.cost;
      registerIngredients(selected.ingredients, usedIngredients);
      usedMealOriginalIds.add(selected.originalId);
    }

    // add desserts
    // calculate budget per remaining meal
    const remainingMeals = maxMeals - plan.length;
    const budgetPerMeal = (budget - spent) / remainingMeals;

    // only allow desserts if budgetPerMeal is reasonable
    let currentDesserts = plan.filter(isDessert).length;
    while (currentDesserts < maxDesserts && budgetPerMeal >= 5) {
      const dessert = pickDessert(formatted, budget - spent, plan, maxDesserts, usedIngredients);
      if (!dessert) break;

      plan.push(dessert);
      spent += dessert.cost;
      registerIngredients(dessert.ingredients, usedIngredients);
      currentDesserts++;
    }

    // add repeat meals if budget and slots remain
    if (plan.length < maxMeals) {
      const needed = maxMeals - plan.length;
      const repeatCandidates = plan
        .filter(m => !isDessert(m))
        .sort((a, b) => b.reusedIngredients.length - a.reusedIngredients.length || b.seasonalScore - a.seasonalScore)
        .slice(0, needed);

      for (const baseMeal of repeatCandidates) {
        if (spent + REPEAT_COST > budget) break;

        const reusedIngredients = getReuseInfo(baseMeal.ingredients, usedIngredients);
        const repeatMeal: MealResult = {
          ...baseMeal,
          id: getUniqueMealId(baseMeal.originalId, "repeat"),
          key: getUniqueMealId(baseMeal.originalId, "repeat-key"),
          isRepeat: true,
          repeatCount: baseMeal.repeatCount + 1,
          repeatMessage: REPEAT_MESSAGE,
          cost: REPEAT_COST,
          reusedIngredients
        };

        plan.push(repeatMeal);
        spent += REPEAT_COST;
        registerIngredients(baseMeal.ingredients, usedIngredients);
        usedMealOriginalIds.add(baseMeal.originalId);
      }
    }

    return plan.slice(0, maxMeals);

  } catch (err) {
    console.error("Error fetching meals:", err);
    return [];
  }
}