import React from "react";
import { Card, Row, Col, Typography, Divider } from "antd";

const { Paragraph } = Typography;

const cardItems = [
  {
    key: "1",
    label: "🌿 Seasonal & Remaining Meals",
    description:
      "Your menu starts contains at least one seasonal meal to use the best seasonal ingredients. Remaining meals are selected randomly, giving seasonal meals a higher chance to appear, while avoiding duplicates and staying within your budget.",
  },
  {
    key: "2",
    label: "🍰 Desserts",
    description:
      "Desserts are added only if your remaining budget allows. Maximum daily or weekly dessert limits are respected, and seasonal desserts are preferred to complement your menu.",
  },
  {
    key: "3",
    label: "🔄 Repeat Meals",
    description:
      "If there are empty slots remaining, some meals may be repeated at a lower cost to fill your menu without exceeding your budget. Repeating a meal allows you to reuse ingredients already included in your plan making meal prep faster and easier.",
  },
  {
    key: "4",
    label: "🧀 Ingredient Reuse",
    description:
      "Ingredients used across multiple meals are tracked. Reusing ingredients helps reduce food waste and keeps your budget under control.",
  },
  {
    key: "5",
    label: "💵 Budget & Costs",
    description:
      "Meals are added only if their cost fits your remaining budget. Costs are calculated based on recommended portions for healthy servings. Daily plans suggest 1–2 meals, weekly plans include up to 7–16 meals. Protein-heavy meals cost more, and repeat meals are $1 each. Dessert limits: 1/day, 2/week.",
  },
  {
    key: "6",
    label: "📊 Summary",
    description:
      "Our smart meal plan balances nutrition, seasonality, and budget. Seasonal meals are prioritized, ingredients are reused, and costs reflect real U.S. supermarket prices to help you plan efficiently.",
  },
];

const MenuInfo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <Divider>
      <h2 className="text-2xl text-green-700 font-bold text-center">How Your Menu is Calculated</h2>
      </Divider>
      <Paragraph style={{ textAlign: "center", color: "#008236", marginBottom: 32 }}>
        Learn how we generate your personalized meal plan based on seasonal ingredients, budget,
        and ingredient reuse to reduce waste.
      </Paragraph>

      <Row gutter={[24, 24]}>
        {cardItems.map((card) => (
          <Col xs={24} sm={12} md={12} lg={8} key={card.key}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                border: "1px solid #e6f7ff",
                backgroundColor: "#bae5cbb8",
                minHeight: 200,
              }}
              title={card.label}
            >
              <Paragraph style={{ color: "#0d2703ff", whiteSpace: "pre-line" }}>
                {card.description}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MenuInfo;