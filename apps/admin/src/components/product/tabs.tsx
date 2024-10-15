"use client";

import { Tabs, TabsList, TabsTrigger } from "@vapestation/ui/tabs";
import ProductTable from "./product-table";
import ProductActions from "./product-action";
import { useProductStore } from "~admin/store";
import { $Enums } from "@vapestation/database";
import DeleteProductModal from "./delete-product-modal";

function ProductStatusTab() {
  return (
    <Tabs defaultValue="ALL">
      <div className="flex sm:flex-col-reverse sm:gap-y-2 md:flex-row md:items-center md:justify-between">
        <ProductTabs />
        <ProductActions />
      </div>

      <ProductTable />

      <DeleteProductModal />
    </Tabs>
  );
}

function ProductTabs() {
  // hooks
  const { setTab } = useProductStore();

  return (
    <TabsList>
      <TabsTrigger
        value="ALL"
        onClick={() => {
          setTab("ALL");
        }}
      >
        All
      </TabsTrigger>
      <TabsTrigger
        value={$Enums.ProductStatus.PUBLISHED}
        onClick={() => {
          setTab("PUBLISHED");
        }}
      >
        Published
      </TabsTrigger>
      <TabsTrigger
        value={$Enums.ProductStatus.DRAFT}
        onClick={() => {
          setTab("DRAFT");
        }}
      >
        Draft
      </TabsTrigger>
      <TabsTrigger
        value={$Enums.ProductStatus.ARCHIVED}
        className="hidden sm:flex"
        onClick={() => {
          setTab("ARCHIVED");
        }}
      >
        Archived
      </TabsTrigger>
    </TabsList>
  );
}

export default ProductStatusTab;
