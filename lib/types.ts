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

// weekly meal plan
export interface WeekMeals {
  monday?: { id: string; name: string }[];
  tuesday?: { id: string; name: string }[];
  wednesday?: { id: string; name: string }[];
  thursday?: { id: string; name: string }[];
  friday?: { id: string; name: string }[];
  saturday?: { id: string; name: string }[];
  sunday?: { id: string; name: string }[];
}

// meals subcollection document
export interface MealsWeekDoc {
  weekId: string;
  meals: WeekMeals;
}