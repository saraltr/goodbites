"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { MealDB } from "@/lib/types";

// firestoreid mapping
type FavoriteMap = { [mealId: string]: string };

// shape of the favorites context
type FavoritesContextType = {
  favorites: FavoriteMap;
  loading: boolean;
  addFavorite: (mealId: string, firestoreId: string) => void;
  removeFavorite: (mealId: string) => void;
};

// create the context
const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // local favorites state
  const [favorites, setFavorites] = useState<FavoriteMap>({});
  // loading state used while fetching initial data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/favorites");

        // only parse if the request succeeded
        if (res.ok) {
          const data = await res.json();
          const map: FavoriteMap = {};

          // firestoreid format
          data.recipes.forEach((r: MealDB) => {
            map[r.idMeal] = r.firestoreId;
          });

          // store the mapped favorites
          setFavorites(map);
        }
      } catch (error) {
        console.error(error);
      }

      // mark loading as done
      setLoading(false);
    }

    // load favorites on mount
    load();
  }, []);

  // add a new favorite to local state
  const addFavorite = (mealId: string, firestoreId: string) => {
    setFavorites((prev) => ({ ...prev, [mealId]: firestoreId }));
  };

  // remove a favorite from local state
  const removeFavorite = (mealId: string) => {
    setFavorites((prev) => {
      const copy = { ...prev };
      delete copy[mealId];
      return copy;
    });
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, addFavorite, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  // get the context and make sure we're inside the provider
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("usefavorites must be used inside <favoritesprovider>");
  }
  return ctx;
}