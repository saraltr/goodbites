"use client";

import { useState, useEffect } from "react";
import { Button, Alert } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";

type FavoriteRecipe = {
  firestoreId: string;
  idMeal: string;
  [key: string]: unknown;
};

export default function AddToFavorites({ mealId }: { mealId: string }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [firestoreId, setFirestoreId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // fetch current favorites on load
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) return;

        const data = await res.json() as { recipes: FavoriteRecipe[] };
        const fav = data.recipes.find((f) => f.idMeal === mealId);
        if (fav) {
          setAdded(true);
          setFirestoreId(fav.firestoreId);
        }
      } catch {}
    };

    fetchFavorites();
  }, [mealId]);

  // auto-hide messages
  useEffect(() => {
    if (!successMsg && !errorMsg) return;
    const timer = setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMsg, errorMsg]);

  // add recipe to user's favorites
  const addFavorite = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data?.error ?? "Failed to save");
        return;
      }

      setAdded(true);
      setFirestoreId(data?.recipe?.firestoreId ?? null);
      setSuccessMsg("Saved!");
    } catch {
      setLoading(false);
      setErrorMsg("Failed to save");
    }
  };

  // remove from favorites
  const removeFavorite = async () => {
    if (!firestoreId) {
      setErrorMsg("Favorite not found");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/favorites?id=${firestoreId}`, { method: "DELETE" });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data?.error ?? "Failed to remove");
        return;
      }

      setAdded(false);
      setFirestoreId(null);
      setSuccessMsg("Removed");
    } catch {
      setLoading(false);
      setErrorMsg("Failed to remove");
    }
  };

  const handleToggle = async () => {
    if (loading) return;
    if (added) {
      await removeFavorite();
    } else {
      await addFavorite();
    }
  };

  return (
    <div className="mb-4">
      {errorMsg && <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 12 }} />}
      {successMsg && <Alert message={successMsg} type="success" showIcon style={{ marginBottom: 12 }} />}

      <Button
        type="primary"
        shape="round"
        icon={added ? <HeartFilled /> : <HeartOutlined />}
        loading={loading}
        onClick={handleToggle}
        style={{
          background: added ? "#ff7875" : "#52c41a",
          border: "none",
        }}
      >
        {added ? "Remove" : "Save"}
      </Button>
    </div>
  );
}