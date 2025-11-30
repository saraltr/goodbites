"use client";

import { Card, Skeleton } from "antd";

export default function MenuCardSkeleton() {
  return (
    <Card style={{ marginBottom: 20 }}>
      <Skeleton active paragraph={{ rows: 3 }} />
    </Card>
  );
}