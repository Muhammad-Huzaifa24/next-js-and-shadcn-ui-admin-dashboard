"use client";

import { format, parseISO } from "date-fns";
import { Copy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import type { OrderRow } from "./orders-table";

interface OrderModalProps {
  order: OrderRow | null;
  onClose: () => void;
}

function PaymentBadge({ status }: { status: OrderRow["payment"] }) {
  if (status === "Paid")
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        Paid
      </Badge>
    );
  if (status === "Refunded")
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        Refunded
      </Badge>
    );
  return (
    <Badge
      className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300"
      variant="outline"
    >
      <span className="size-1.5 rounded-full bg-current" />
      Pending
    </Badge>
  );
}

function OrderStatusBadge({ status }: { status: OrderRow["status"] }) {
  const map: Record<OrderRow["status"], string> = {
    Ready: "border-orange-600/25 text-orange-600 dark:border-orange-400/25 dark:text-orange-400",
    Shipped: "border-blue-600/25 text-blue-600 dark:border-blue-400/25 dark:text-blue-400",
    Delivered: "border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300",
    Cancelled: "",
  };
  if (status === "Cancelled")
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        {status}
      </Badge>
    );
  return (
    <Badge className={map[status]} variant="outline">
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right font-medium text-sm">{children}</span>
    </div>
  );
}

export function OrderModal({ order, onClose }: OrderModalProps) {
  if (!order) return null;

  function copyId() {
    void navigator.clipboard.writeText(order?.id);
  }

  return (
    <Dialog
      open={!!order}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Order {order.id}
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Copy order ID"
              onClick={copyId}
              className="text-muted-foreground"
            >
              <Copy className="size-3.5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Customer avatar + name */}
        <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
            {order.customer[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium leading-none">{order.customer}</p>
            <p className="mt-0.5 text-muted-foreground text-xs">Customer</p>
          </div>
        </div>

        <Separator />

        {/* Order details */}
        <div className="divide-y divide-border/60">
          <InfoRow label="Order ID">{order.id}</InfoRow>
          <InfoRow label="Date">{format(parseISO(order.date), "MMM d, yyyy · h:mm a")}</InfoRow>
          <InfoRow label="Payment Status">
            <PaymentBadge status={order.payment} />
          </InfoRow>
          <InfoRow label="Order Status">
            <OrderStatusBadge status={order.status} />
          </InfoRow>
          <InfoRow label="Total">
            <span className="tabular-nums">{order.total}</span>
          </InfoRow>
        </div>

        <Separator />
      </DialogContent>
    </Dialog>
  );
}
