"use client";

import { useEffect, useState, useRef } from "react";
import { MealDB } from "@/lib/types";
import { Grid, Pagination, Input, Select, Tag } from "antd";
import RecipeCard from "./RecipeCard";

export default function UserFavs() {
  const [favs, setFavs] = useState<MealDB[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const screens = Grid.useBreakpoint();
  const cols = screens.xl ? 3 : 2;

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setFavs(data.recipes || []));
  }, []);

  const deleteFavsAction = async (id:string) => {
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/favorites?id=${id}`, {
      method: "DELETE"
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error);
      setTimeout(() => setError(null), 5000);
      return;
    }

    setFavs(f => f.filter(fav => fav.firestoreId !== id));
    setMessage(data?.message);
    setTimeout(() => setMessage(null), 5000);
  }

  // filtering
  const filtered = favs.filter((recipe) => {
    const matchesSearch = recipe.strMeal
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "all" || recipe.strCategory === category;

    return matchesSearch && matchesCategory;
  });

  // pagination
  const start = (currentPage - 1) * pageSize;
  const paginatedFavs = filtered.slice(start, start + pageSize);

  const totalPages = Math.ceil(filtered.length / pageSize);
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // extract category list from data
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...Array.from(new Set(favs.map((r) => r.strCategory))).map((cat) => ({
      value: cat,
      label: cat,
    })),
  ];

  if (favs.length === 0) {
    return <p>No favorites added yet</p>;
  }

  return (
    <>

    {/* feedback messages */}
      {message &&
      <p>
          <Tag color="success" style={{ marginBottom: 12 }}>
              {message}
          </Tag>
      </p>
      }
      {error && (
          <Tag color="error" style={{ marginBottom: 12 }}>
          {error}
          </Tag>
      )}
      {/* filter */}
      <div className="flex flex-col md:flex-row gap-3 my-4">
        <Input
          placeholder="Search recipe..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset pagination
          }}
          allowClear
        />

        <Select
          value={category}
          onChange={(value) => {
            setCategory(value);
            setCurrentPage(1); // reset pagination
          }}
          options={categoryOptions}
          className="min-w-[200px]"
        />
      </div>

      {/* grid */}
      <div
        ref={listRef}
        className="my-4"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 16,
        }}
      >
        {paginatedFavs.map((recipe) => (
          <RecipeCard
            key={recipe.idMeal}
            recipe={recipe}
            onRemoveAction={deleteFavsAction}
          />
        ))}
      </div>

      {/* pagination */}
      <div className="flex justify-center my-6">
        <Pagination
          current={currentPage}
          total={filtered.length}
          pageSize={pageSize}
          onChange={(page) => {
            setCurrentPage(page);
            listRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
          showSizeChanger={false}
        />
      </div>
    </>
  );
}