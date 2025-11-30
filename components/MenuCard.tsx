"use client";

import { useRef, useState } from "react";
import {
  Card,
  Button,
  Collapse,
  Tag,
  Typography,
  Popconfirm,
  Dropdown,
  Menu as AntMenu,
} from "antd";
import {
  DeleteOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  DownOutlined,
} from "@ant-design/icons";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import MealMiniCard from "./MealMiniCard";
import { formatDate } from "@/utils/helpers";
import type { Menu, Meal } from "@/lib/types";

const { Panel } = Collapse;
const { Text } = Typography;

interface MenuCardProps {
  menu: Menu;
  deleteMenuAction: (id: string) => void;
}

export default function MenuCard({ menu, deleteMenuAction }: MenuCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState<{
    image: boolean;
    pdf: boolean;
  }>({ image: false, pdf: false });

  const [forceOpen, setForceOpen] = useState(false);


  // expand meals, run taks anc collapse
  const withExpandedMeals = async (task: () => Promise<void>) => {
    setForceOpen(true);
    await new Promise((res) => setTimeout(res, 350)); // allow UI to expand
    await task();
    setForceOpen(false);
  };

  //  image dowload
  const downloadImageAction = async (): Promise<void> => {
    if (!cardRef.current) return;

    setLoading((l) => ({ ...l, image: true }));

    await withExpandedMeals(async () => {
      if (!cardRef.current) return;

      const canvas = await html2canvas(cardRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = imgData;
      link.download = `menu-${menu.id}.png`;
      link.click();
    });

    setLoading((l) => ({ ...l, image: false }));
  };

  // pdf dowload 
  const downloadPdfAction = async (): Promise<void> => {
    if (!cardRef.current) return;

    setLoading((l) => ({ ...l, pdf: true }));

    await withExpandedMeals(async () => {
      if (!cardRef.current) return;

      const canvas = await html2canvas(cardRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      // add extra pages if needed
      while (heightLeft > 0) {
        pdf.addPage();
        position = 0 - (imgHeight - heightLeft);
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`menu-${menu.id}.pdf`);
    });

    setLoading((l) => ({ ...l, pdf: false }));
  };

  // menu total cost
  const totalCost = menu.meals.reduce(
    (sum: number, m: Meal) => sum + m.cost,
    0
  );

  const remaining = menu.budget - totalCost;

  // drop down menu
  const actionMenu = (
    <AntMenu>
      <AntMenu.Item
        key="image"
        icon={<FileImageOutlined />}
        onClick={downloadImageAction}
      >
        Download Image
      </AntMenu.Item>

      <AntMenu.Item
        key="pdf"
        icon={<FilePdfOutlined />}
        onClick={downloadPdfAction}
      >
        Download PDF
      </AntMenu.Item>

      <AntMenu.Item key="delete">
        <Popconfirm
          title="Delete menu?"
          okText="Delete"
          onConfirm={() => deleteMenuAction(menu.id)}
        >
          <Button type="text" danger className="w-full text-left" icon={<DeleteOutlined />}>
            Delete Menu
          </Button>
        </Popconfirm>
      </AntMenu.Item>
    </AntMenu>
  );

  return (
    <div className="my-4">
      <Card
        ref={cardRef}
        className="mb-2"
        title={
          <div className="flex flex-col gap-1 my-2">
            <strong>{menu.mode.toUpperCase()} Menu</strong>
            <Text type="secondary">Created {formatDate(menu.createdAt)}</Text>
          </div>
        }
      >
        {/* Actions */}
        <div className="flex gap-2 mb-4">
          <Dropdown overlay={actionMenu} placement="bottomLeft" trigger={["click"]}>
            <Button size="small" loading={loading.image || loading.pdf}>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        </div>

        {/* Summary */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Tag style={{ padding: "5px" }} color="green">
            Budget: €{menu.budget}
          </Tag>
          <Tag style={{ padding: "5px" }} color="blue">
            Spent: €{totalCost.toFixed(2)}
          </Tag>
          <Tag style={{ padding: "5px" }} color={remaining >= 0 ? "green" : "red"}>
            Remaining: €{remaining.toFixed(2)}
          </Tag>
          <Tag style={{ padding: "5px" }}>Meals: {menu.meals.length}</Tag>
        </div>

        {/* Meals List */}
        <Collapse
          ghost
          expandIconPosition="end"
          activeKey={forceOpen ? ["1"] : undefined}
        >
          <Panel header="Meals" key="1">
            <div className="flex flex-col gap-2">
              {menu.meals.map((meal: Meal) => (
                <MealMiniCard key={meal.originalId} meal={meal} />
              ))}
            </div>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
}