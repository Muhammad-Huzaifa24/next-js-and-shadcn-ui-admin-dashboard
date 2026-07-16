import { Box, FolderOpen, LayoutDashboard, type LucideIcon, Settings, ShoppingCart, Users } from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Main",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        url: "/dashboard/ecommerce",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Catalog",
    items: [
      {
        id: "products",
        title: "Products",
        url: "/dashboard/products",
        icon: Box,
      },
      {
        id: "categories",
        title: "Categories",
        url: "/dashboard/categories",
        icon: FolderOpen,
      },
    ],
  },
  {
    id: 3,
    label: "Sales",
    items: [
      {
        id: "orders",
        title: "Orders",
        url: "/dashboard/orders",
        icon: ShoppingCart,
      },
    ],
  },
  {
    id: 4,
    label: "Customers",
    items: [
      {
        id: "customers",
        title: "Customers",
        url: "/dashboard/customers",
        icon: Users,
      },
    ],
  },
  {
    id: 5,
    label: "Settings",
    items: [
      {
        id: "settings",
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        badge: "soon",
        disabled: true,
      },
    ],
  },
];
