import { ProductStatus } from "@vapestation/database";

export type ProductTab = ProductStatus | "ALL";

export type Pagination = {
  page: number;
  setPage: (page: number) => void;
  increasePage: () => void;
  decreasePage: () => void;
};

export type ProductStore = Pagination & {
  tab: ProductTab;
  setTab: (tab: ProductTab) => void;

  deleteProductModal: boolean;
  setDeleteProductModal: (value: boolean) => void;
  selectedProductId: string;
  setSelectedProductId: (value: string) => void;
};

export type CustomerStore = Pagination;
