"use client";

import Link from "next/link";
import { Card, Typography, Tag } from "antd";

const { Text } = Typography;

interface MealMiniCardProps {
  meal: {
    title: string;
    originalId: string;
    cost: number;
    fullCost: number;
    includeSeasonal: boolean;
  };
}

// dropdown mini card
export default function MealMiniCard({ meal }: MealMiniCardProps) {
  return (
    <Card
      size="small"
    >
      <div className="">
        {/* link to the recipe page */}
        <Link href={`/recipe/${meal.originalId}`}
        className="mb-2">
          <Text strong className="link-hover">{meal.title}</Text>
        </Link>

        <div className="">{meal.includeSeasonal}</div>

        {/* costs */}
        <div className="mt-3">
          <Tag style={{ padding: "5px" }} color="green" className="text-xs sm:text-sm">€{meal.cost}</Tag>
          <Tag style={{ padding: "5px" }} color="blue" className="text-xs sm:text-sm">€{meal.fullCost} full</Tag>
        </div>
      </div>
    </Card>
  );
}
