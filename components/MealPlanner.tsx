"use client"
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import fetchMeals from "@/lib/fetchMeals";
import { MealResult } from "@/lib/types";
import { Row, Col, Card, Button, Select, InputNumber, Badge, Tabs, Divider, Tag, Empty, Form, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useLocalStorage } from "@/hooks/useLocalStorage";
const { Option } = Select;
import MenuInfo from "./MenuInfo";
import { useAuth } from "@/contexts/AuthContext";


export default function MealPlanner() {
  const { user } = useAuth();
  const [plannerData, setPlannerData] = useLocalStorage<{
    mode: "daily" | "weekly";
    budget: number;
    meals: MealResult[];
  }>("plannerData", { mode: "weekly", budget: 0, meals: [] });

  const [confirmedMeals, setConfirmedMeals] = useState<MealResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  const { mode, budget, meals } = plannerData;

  const hasGeneratedMeals = meals.length > 0 || confirmedMeals.length > 0;


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
      1 * budget - confirmedMeals.reduce((sum, m) => sum + m.cost, 0) - meals.reduce((sum, m) => sum + m.cost, 0);

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

    async function handleConfirmMenu() {
    // send the save menu to firebase if the user is logged in
    const filteredMeals = plannerData.meals.map(meal => ({
      originalId: meal.originalId,
      title: meal.title,
      cost: meal.cost,
      fullCost: meal.fullCost,
      includeSeasonal: meal.includeSeasonal,
    }));

    await fetch("/api/menu", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {budget:(plannerData.budget), 
        mode:(plannerData.mode),
        meals:(filteredMeals)
      },
    )
    })

    // debug
    // const data = await res.json();
    // console.log(data);

  };

return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl text-green-700 font-bold mb-6 text-center">Smart Meal Planner</h1>

      <Row gutter={[16, 16]} className="mb-6 justify-center">
        <Col>
        <Form.Item label="Plan Type">
          <Select
            value={mode}
            onChange={(value) => setPlannerData({ ...plannerData, mode: value })}
            style={{ width: 120 }}
          >
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
          </Select>
        </Form.Item>
        </Col>

        <Col>
        <Form.Item label="Budget">
          <InputNumber
            value={budget}
            min={0}
            onChange={(value) => setPlannerData({ ...plannerData, budget: Number(value) })}
            placeholder="Budget ($)"
            required
          />
        </Form.Item>
        </Col>

        <Col>
          <Button type="primary" onClick={handleGenerate} className="custom-btn">
            Generate
          </Button>
        </Col>

        <Col>
          <Button type="primary" onClick={handleGenerateReplacement} className="replace-btn">
            Replace Removed
          </Button>
        </Col>

        <Col>
        <Tooltip title={!user ? "Log in to save your menu!" : ""}>
          <Button type="primary" onClick={handleConfirmMenu} disabled={!user}>
            Confirm Menu
          </Button>
        </Tooltip>
        </Col>
        <Col>
        <Button
          type="primary"
          className="restart-btn"
          onClick={() => {
            // clear local storage key
            localStorage.removeItem("plannerData");
            // reset state
            setPlannerData({ mode: "weekly", budget: 0, meals: [] });
            setConfirmedMeals([]);
            setUserMessage("");
          }}
        >
          Restart
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
        {hasGeneratedMeals ? (
          meals.map((meal) => (
            <Col xs={24} sm={12} md={8} lg={6} key={meal.key}>
              <Badge.Ribbon
                text={meal.isRepeat ? meal.repeatMessage : meal.isFresh ? "🌱 Seasonal" : "🥔 All-year"}
                color={meal.isRepeat ? "blue" : meal.isFresh ? "green" : "gray"}
                placement="start"
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
                      <Tabs
                        defaultActiveKey="1"
                        size="small"
                        items={[
                          {
                            key: "1",
                            label: "Overview",
                            children: (
                              <>
                                <p>💰 Estimated Cost: ${meal.cost}</p>
                                <p>💰 Full Meal Cost: ${meal.fullCost}</p>
                                {meal.repeatMessage && (
                                  <Tag
                                    color="blue"
                                    style={{
                                      whiteSpace: "normal",
                                      wordBreak: "break-word",
                                      display: "block",
                                    }}
                                  >
                                    Reuses your ingredients to reduce food waste and stay on budget!
                                  </Tag>
                                )}
                              </>
                            ),
                          },
                          {
                            key: "2",
                            label: "Nutrition",
                            children: (
                              <>
                                <Divider style={{ margin: "8px 0" }}>Nutrition Info</Divider>
                                <p>Calories: {meal.nutrition.calories} kcal</p>
                                <p>Protein: {meal.nutrition.protein} g</p>
                                <p>Fat: {meal.nutrition.fat} g</p>
                              </>
                            ),
                          },
                          ...(meal.reusedIngredients?.length
                            ? [
                                {
                                  key: "3",
                                  label: "Ingredients",
                                  children: (
                                    <>
                                      <Divider style={{ margin: "8px 0" }}>🛒 Reused Ingredients:</Divider>
                                      <ul
                                        style={{
                                          margin: 0,
                                          paddingLeft: "1rem",
                                          listStyle: "none",
                                        }}
                                      >
                                        {meal.reusedIngredients.map((ingredient, idx) => (
                                          <li
                                            key={idx}
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 6,
                                              padding: "2px 0",
                                            }}
                                          >
                                            <span role="img" aria-label="ingredient">
                                              ✅
                                            </span>
                                            <span>{ingredient}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </>
                                  ),
                                },
                              ]
                            : []),
                        ]}
                      />
                    }
                  />
                </Card>
              </Badge.Ribbon>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty
              description={
                <span>
                  You haven&apos;t generated any meals yet. <br />
                  Click &quot;Generate&quot; to create your personalized menu.
                </span>
              }
            >
            </Empty>
          </Col>
        )}
      </Row>
      <div className="my-6">
        <MenuInfo></MenuInfo>
      </div>
    </div>
  );
}