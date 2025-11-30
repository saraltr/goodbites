import { User } from "firebase/auth";
import { ReactNode } from "react";

// shape of the auth context
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

// define the shape of a user object stored in firestore
export interface FirestoreUser {
  username: string;
  email: string;
  createdAt: { toDate: () => Date };
}

// modal interface
export interface ModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  children?: ReactNode;
}

// favorite meal in user docs
export interface Favorite {
  id: string; // unique meal id
  name: string; // meal name
}

// a single day's meal (array of meals)
export interface DayMeals {
  [dishId: string]: {
    id: string;
    name: string;
  }[];
}

// saved meal plans
export interface Meal {
  originalId: string;
  title: string;
  cost: number;
  fullCost: number;
  includeSeasonal: boolean;
}

export interface Menu {
  id: string;
  mode: string;
  budget: number;
  createdAt: Date | string;
  meals: Meal[];
}

export interface ReviewFormProps {
  recipeId: string;
  onReviewSubmit: (newReview: Review) => void;
}

export interface Review {
  id: string;
  recipeId: string;
  rating: number;
  comment: string;
  userId: string | null;
  userName: string;
  createdAt: { seconds: number; nanoseconds: number } | string;
}
// meal details for meal generator
export interface MealDetails {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  estimatedCost?: number | string;
  cost?: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
  };
  ingredients: string[];
  isFresh: boolean;
  seasonalScore: number;
  category?: string;
  area?: string;
  instructions?: string;
  tags?: string;

  isVegan?: boolean;
  isVegetarian?: boolean;
  isPescatarian?: boolean;
  isGlutenFree?: boolean;
}
// meal object shape
export interface MealDB {
  firestoreId: string;
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strMealThumb: string;
  [key: `strIngredient${number}`]: string | null;
  [key: `strMeasure${number}`]: string | null;
  strArea: string;
  strTags: string;
}



export interface MealResult {
  // original recipe ID
  originalId: string;

  // unique instance ID
  id: string;

  key: string;
  title: string;
  image: string;
  cost: number;
  fullCost: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
  };
  ingredients: string[];
  reusedIngredients: string[];
  isFresh: boolean;
  seasonalScore: number;

  isRepeat: boolean;
  repeatCount: number;
  repeatMessage?: string;
  includeSeasonal?: boolean;

  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
}

export type Nutrition = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};
