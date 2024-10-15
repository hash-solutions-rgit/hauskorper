import { create } from "zustand";
import { CustomerStore, ProductStore } from "./type";

export const useProductStore = create<ProductStore>()((set) => ({
  tab: "ALL",
  setTab(tab) {
    set({ tab });
  },

  page: 1,
  increasePage() {
    set((state) => ({ page: state.page + 1 }));
  },
  decreasePage() {
    set((state) => ({ page: state.page - 1 }));
  },
  setPage(page) {
    set({ page });
  },

  deleteProductModal: false,
  setDeleteProductModal(value) {
    set({ deleteProductModal: value });
  },
  selectedProductId: "",
  setSelectedProductId(value) {
    set({ selectedProductId: value });
  },
}));

// customer store
export const useCustomerStore = create<CustomerStore>()((set) => ({
  page: 1,
  increasePage() {
    set((state) => ({ page: state.page + 1 }));
  },
  decreasePage() {
    set((state) => ({ page: state.page - 1 }));
  },
  setPage(page) {
    set({ page });
  },
}));
