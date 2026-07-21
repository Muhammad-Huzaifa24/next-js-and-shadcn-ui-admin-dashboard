import { format } from "date-fns";

import { RecentOrders } from "./ecommerce/_components/recent-orders";
import { StatsStrip } from "./ecommerce/_components/stats-strip";

export default function DashboardPage() {
  const formattedDate = format(new Date(), "EEEE, do MMMM yyyy");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl leading-none tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">{formattedDate}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <StatsStrip />
        <div className="xl:col-span-12">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
