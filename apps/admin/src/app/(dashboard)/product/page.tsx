import { MobileProductActions } from "~admin/components/product/product-action";
import ProductStatusTab from "~admin/components/product/tabs";

function ProductPage() {
  return (
    <main className="relative grid flex-1 items-start gap-4 p-4 pb-20 sm:px-6 sm:py-0 sm:pb-4 md:gap-8">
      <ProductStatusTab />
      <MobileProductActions />
    </main>
  );
}

export default ProductPage;
