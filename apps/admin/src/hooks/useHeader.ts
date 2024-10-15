"use client";

import { usePathname } from "next/navigation";

export function useGetBreadcrumb() {
  // pathname
  const pathname = usePathname();

  if (pathname.includes("/product/edit/")) {
    return [
      {
        title: "Dashboard",
        href: "/",
      },
      {
        title: "Products",
        href: "/product",
      },
      {
        title: "Edit Product",
      },
    ];
  }

  switch (pathname) {
    case "/customer":
      return [
        {
          title: "Dashboard",
          href: "/",
        },
        {
          title: "Customer",
          href: "/customer",
        },
        {
          title: "All Customers",
        },
      ];

    case "/order":
      return [
        {
          title: "Dashboard",
          href: "/",
        },
        {
          title: "Orders",
          href: "/order",
        },
        {
          title: "All Orders",
        },
      ];

    case "/product":
      return [
        {
          title: "Dashboard",
          href: "/",
        },
        {
          title: "Products",
          href: "/product",
        },
        {
          title: "All Products",
        },
      ];
    case "/product/add":
      return [
        {
          title: "Dashboard",
          href: "/",
        },
        {
          title: "Products",
          href: "/product",
        },
        {
          title: "Add Product",
        },
      ];

    default:
      return [];
  }
}
