"use client";

import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@vapestation/ui/dropdown-menu";
import { File, FolderDown, ListFilter, PlusCircle } from "lucide-react";
import { Button, buttonVariants } from "@vapestation/ui/button";
import { useProductStore } from "~admin/store";
import { jsonToCSV } from "react-papaparse";
import Link from "next/link";
import { api } from "~admin/trpc/react";

function ProductActions() {
  // server interaction
  const { tab } = useProductStore();
  const { data: productsResponse } =
    api.product.getAllProducts.useInfiniteQuery(
      {
        status: tab === "ALL" ? undefined : tab,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchInterval: false,
      },
    );

  // compute data
  const products = productsResponse?.pages?.flatMap((page) => page.products);

  // handle download products as CSV
  const handleExport = () => {
    if (!products || !products.length) return;
    const modifiedProducts = products.map((product) => {
      const {
        brand,
        brandId,
        categories,
        categoryIds,
        // crossSellProductId,
        // crossSelledProductIds,
        inventory,
        googleAdsMeta,
        // upSellProductId,
        // upSelledProductIds,
        ...rest
      } = product;
      return {
        ...rest,
        ...googleAdsMeta,
        ...inventory,
        categories: categories.map((category) => category.name).join(";"),
      };
    });
    // convert products to CSV
    const csv = jsonToCSV(modifiedProducts, { header: true });

    // create a blob and download the file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `products-${tab}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <ListFilter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filter
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Active</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1"
        onClick={handleExport}
        disabled={!products || !products?.length}
      >
        <File className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
          Export
        </span>
      </Button>
      <Button size="sm" variant="outline" className="h-8 gap-1">
        <FolderDown className="h-4 w-4" />
        Import
      </Button>
      <Link
        href="/product/add"
        className={buttonVariants({ size: "sm", className: "h-8 gap-1" })}
      >
        <PlusCircle className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
          Add Product
        </span>
      </Link>
    </div>
  );
}

export const MobileProductActions = () => {
  // server interaction
  const { tab } = useProductStore();
  const { data: productsResponse } =
    api.product.getAllProducts.useInfiniteQuery(
      {
        status: tab === "ALL" ? undefined : tab,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchInterval: false,
      },
    );

  // compute data
  const products = productsResponse?.pages?.flatMap((page) => page.products);

  // handle download products as CSV
  const handleExport = () => {
    if (!products || !products.length) return;
    // convert products to CSV
    const csv = jsonToCSV(products, { header: true });

    // create a blob and download the file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `products-${tab}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center gap-x-4 border-t border-t-gray-300 bg-white p-2 sm:hidden">
      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1"
        onClick={handleExport}
        disabled={!products || !products?.length}
      >
        <File className="h-3.5 w-3.5" />
        <span className="sr-only">Export</span>
      </Button>
      <Button size="sm" variant="outline" className="h-8 gap-1">
        <FolderDown className="h-4 w-4" />
        <span className="sr-only">Import</span>
      </Button>
      <Link
        href="/product/add"
        className={buttonVariants({ size: "sm", className: "h-8 gap-1" })}
      >
        <PlusCircle className="h-3.5 w-3.5" />
        <span className="sr-only">Add Product</span>
      </Link>
    </div>
  );
};

export default ProductActions;
