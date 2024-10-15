import {
  Boxes,
  Home,
  LayoutList,
  LineChart,
  Package,
  ShoppingCart,
  Users2,
} from "lucide-react";
import { NavItem } from "./type";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    Icon: Home,
    href: "/dashboard",
  },
  {
    title: "Orders",
    Icon: ShoppingCart,
    href: "/order",
  },
  {
    title: "Products",
    Icon: Package,
    href: "/product",
  },
  {
    title: "Category",
    Icon: LayoutList,
    href: "/category",
  },
  {
    title: "Brand",
    Icon: Boxes,
    href: "/brand",
  },
  {
    title: "Analytics",
    Icon: LineChart,
    href: "/analytics",
  },
];
