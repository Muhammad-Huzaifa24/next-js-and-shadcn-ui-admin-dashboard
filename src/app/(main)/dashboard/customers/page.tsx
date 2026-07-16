import { Download, Plus } from "lucide-react";

import { PageHeader, PageHeaderAction } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";

import { CustomersTable } from "./_components/customers-table";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Customers"
        actions={
          <>
            <PageHeaderAction variant="outline">
              <Download className="size-3.5" />
              Export
            </PageHeaderAction>
            <Button size="sm">
              <Plus className="size-3.5" />
              Add Customer
            </Button>
          </>
        }
      />
      <CustomersTable />
    </div>
  );
}
