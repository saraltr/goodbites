"use client";

import { useState } from "react";
import { Button, message } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useFavorites } from "@/contexts/FavoritesContext";

export default function AddToFavorites({ mealId }: { mealId: string }) {
  const [loading, setLoading] = useState(false);
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const firestoreId = favorites[mealId] ?? null;
  const added = Boolean(firestoreId);

  const save = async () => {
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
        message.error(data?.error ?? "Failed to save");
        return;
      }

      addFavorite(mealId, data.recipe.firestoreId);
      message.success("Saved to favorites");
    } catch {
      setLoading(false);
      message.error("Failed to save");
    }
  };

  const remove = async () => {
    if (!firestoreId) {
      message.error("Favorite not found");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/favorites?id=${firestoreId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        message.error(data?.error ?? "Failed to remove");
        return;
      }

      removeFavorite(mealId);
      message.success("Removed from favorites");
    } catch {
      setLoading(false);
      message.error("Failed to remove");
    }
  };

  return (
    <Button
      type="primary"
      shape="round"
      icon={added ? <HeartFilled /> : <HeartOutlined />}
      loading={loading}
      onClick={added ? remove : save}
      style={{
        background: added ? "#ff7875" : "#52c41a",
        border: "none",
      }}
    >
      {added ? "Remove" : "Save"}
    </Button>
  );
}