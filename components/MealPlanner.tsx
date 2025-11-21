"use client"
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import fetchMeals from "@/lib/fetchMeals";
import { MealResult } from "@/lib/types";
import { Row, Col, Card, Button, Select, InputNumber, Badge } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const { Option } = Select;

export default function MealPlanner() {
  const [plannerData, setPlannerData] = useLocalStorage<{
    mode: "daily" | "weekly";
    budget: number;
    meals: MealResult[];
  }>("plannerData", { mode: "weekly", budget: 0, meals: [] });

  const [confirmedMeals, setConfirmedMeals] = useState<MealResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  const { mode, budget, meals } = plannerData;

  const used = [...confirmedMeals, ...meals].reduce((sum, m) => sum + m.cost, 0);

  const handleGenerate = async () => {
    if (budget <= 0) return;
    setLoading(true);

    const remainingBudget = budget - confirmedMeals.reduce((sum, m) => sum + m.cost, 0);
    const result = await fetchMeals(remainingBudget, mode);

    const existingIds = new Set(confirmedMeals.map((m) => m.id));
    const newMeals = result.filter((m) => !existingIds.has(m.id));

    setPlannerData({ ...plannerData, meals: newMeals });
    setLoading(false);
  };

  const handleRemoveMeal = (id: string) => {
    const updatedMeals = meals.filter((m) => m.id !== id);
    setPlannerData({ ...plannerData, meals: updatedMeals });
  };

  const handleGenerateReplacement = async () => {
    if (budget <= 0) return;
    setLoading(true);

    const replacementBudget =
      1.2 * budget - confirmedMeals.reduce((sum, m) => sum + m.cost, 0) - meals.reduce((sum, m) => sum + m.cost, 0);

    const result = await fetchMeals(replacementBudget, mode);
    const existingIds = new Set([...confirmedMeals, ...meals].map((m) => m.id));

    const replacements = result.filter((m) => !existingIds.has(m.id));

    if (replacements.length === 0) {
      setUserMessage("⚠️ No replacement meals available with the current budget/pool.");
      setTimeout(() => setUserMessage(""), 10000);
    } else {
      setUserMessage("");
    }

    setPlannerData({
      ...plannerData,
      meals: [...meals, ...replacements].slice(0, mode === "daily" ? 2 : 14 - confirmedMeals.length),
    });

    setLoading(false);
  };

  const handleConfirmMenu = () => {
    // should send the save menu to firebase if the user is logged in
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl text-green-700 font-bold mb-6 text-center">Smart Meal Planner</h1>

      <Row gutter={[16, 16]} className="mb-6 justify-center">
        <Col>
          <Select
            value={mode}
            onChange={(value) => setPlannerData({ ...plannerData, mode: value })}
            style={{ width: 120 }}
          >
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
          </Select>
        </Col>

        <Col>
          <InputNumber
            value={budget}
            min={0}
            onChange={(value) => setPlannerData({ ...plannerData, budget: Number(value) })}
            placeholder="Budget ($)"
          />
        </Col>

        <Col>
          <Button type="primary" onClick={handleGenerate} className="custom-btn">
            Generate
          </Button>

        </Col>
        <Col>
          <Button danger type="default" onClick={handleGenerateReplacement}>
            Replace Removed
          </Button>
        </Col>

        <Col>
          <Button color="green" variant="solid" onClick={handleConfirmMenu}>
            Confirm Menu
          </Button>
        </Col>
      </Row>

      {userMessage && <div className="text-center text-red-600 font-semibold mb-4">{userMessage}</div>}

      <div className="text-center font-semibold text-green-700 mb-2">
        Budget used: ${used.toFixed(2)} / ${budget}
      </div>

      <div className="w-full bg-gray-200 h-4 rounded-full mb-6">
        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-300"
          style={{ width: `${Math.min((used / budget) * 100, 100)}%` }}
        ></div>
      </div>

      {/* spiner */}
      {loading && (
        <div className="flex flex-col items-center justify-center my-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500 border-gray-200 mb-2"></div>
          <p className="text-green-700 font-semibold">Generating your meals...</p>
        </div>
      )}

      <Row gutter={[16, 16]}>
        {meals.map((meal) => (
          <Col xs={24} sm={12} md={8} lg={6} key={meal.key}>
            <Badge.Ribbon
              text={meal.isFresh ? "🌱 Seasonal" : "🥔 All-year"}
              color={meal.isFresh ? "green" : "gray"}
            >
              <Card
                cover={
                  <div className="relative w-full h-48">
                    <Image
                      src={meal.image}
                      alt={meal.title}
                      fill
                      className="rounded-t object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                      priority={false}
                    />
                  </div>
                }
                actions={[
                  <Button
                    key="remove"
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={() => handleRemoveMeal(meal.id)}
                  >
                    Remove
                  </Button>,
                  <Link key="view" href={`/recipe/${meal.originalId}`}>
                    <Button type="default" size="small">
                      View Recipe
                    </Button>
                  </Link>,
                ]}
              >
                <Card.Meta
                  title={meal.title}
                  description={
                    <div className="flex flex-col gap-1 min-h-[80px] text-sm">
                      <p className="m-0">💰 Cost: ${meal.cost.toFixed(2)}</p>

                      {meal.reusedIngredients.length > 0 && (
                        <p
                          className="m-0 text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap"
                          title={meal.reusedIngredients.join(", ")}
                        >
                          🛒 Reused: {meal.reusedIngredients.join(", ")}
                        </p>
                      )}

                      {meal.repeatMessage && (
                        <p className="m-0 text-blue-600 italic">{meal.repeatMessage}</p>
                      )}
                    </div>
                  }
                />
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>
    </div>
  );
}