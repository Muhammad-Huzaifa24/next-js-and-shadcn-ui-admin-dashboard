import { Download, Plus } from "lucide-react";

import { PageHeader, PageHeaderAction } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";

import { OrdersTable } from "./_components/orders-table";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Orders"
        actions={
          <>
            <PageHeaderAction variant="outline">
              <Download className="size-3.5" />
              Export
            </PageHeaderAction>
            <Button size="sm">
              <Plus className="size-3.5" />
              Add Order
            </Button>
          </>
        }
      />
      <OrdersTable />
    </div>
  );
}
