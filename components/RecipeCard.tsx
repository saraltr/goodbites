"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, Tag, Badge, Space, Tooltip, Button, theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { MealDB } from "@/lib/types";

export default function RecipeCard({

  recipe,
  onRemoveAction
}: {
  recipe: MealDB;
  onRemoveAction?: (firestoreId: string) => void;
}) {
  const { token } = theme.useToken();

  return (
    <Badge.Ribbon
      text={recipe.strCategory}
      color="green"
      placement="start"
    >
      <Card
        hoverable
        style={{ position: "relative", marginBottom: 16 }}
        cover={
          <div style={{ height: 180, position: "relative" }}>
            <Image
              src={recipe.strMealThumb || "/images/placeholder-food.jpg"}
              alt={recipe.strMeal}
              fill
              style={{ objectFit: "cover", borderRadius: "8px 8px 0 0" }}
            />
          </div>
        }
      >
        <Space direction="vertical" size={10}>
          <Link href={`/recipe/${recipe.idMeal}`}>
            <h3 className="link-hover">{recipe.strMeal}</h3>
          </Link>

          {recipe.strArea && (
            <Tag
              style={{
                background: "rgba(0, 128, 128, 0.15)",
                border: "none",
                padding: "2px 8px",
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 6
              }}
            >
              {recipe.strArea}
            </Tag>
          )}

          {onRemoveAction && (
            <Tooltip title={ <div style={{ whiteSpace: "normal", maxWidth: 100 }}> Remove from favorites </div> }>
              <Button
                type="text"
                icon={<CloseOutlined />}
                style={{
                  position: "absolute",
                  top: token.paddingSM,
                  right: token.paddingSM,
                  color: "white",
                  background: "rgba(62, 189, 62, 0.54)",
                  backdropFilter: "blur(4px)"
                }}
                onClick={() => onRemoveAction(recipe.firestoreId)}
              />
            </Tooltip>
          )}
        </Space>
      </Card>
    </Badge.Ribbon>
  );
}
