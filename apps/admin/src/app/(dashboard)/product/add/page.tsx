"use client";

import { Button, buttonVariants } from "@vapestation/ui/button";
import {
  CreateProductFormValues,
  createProductFormSchema,
} from "common/schema/product";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@vapestation/ui/form";
import { api } from "~admin/trpc/react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ProductDetail from "~admin/components/product/add-product/product-detail";
import ProductCategory from "~admin/components/product/add-product/product-category";
import ProductPrice from "~admin/components/product/add-product/product-price";
import ProductStatus from "~admin/components/product/add-product/product-status";
import ProductImage from "~admin/components/product/add-product/product-image";
import Inventory from "~admin/components/product/add-product/inventory";
import GoogleadsMeta from "~admin/components/product/add-product/googleads-meta";
import AdvancedInventory from "~admin/components/product/add-product/advanced-inventory";

function AddProductPage() {
  // hooks
  const router = useRouter();

  // add product form
  const addProductForm = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      status: "DRAFT",
    },
  });

  // server utils
  const utils = api.useUtils();

  // server interaction
  const { mutateAsync: createProduct, isPending } =
    api.product.createProduct.useMutation({
      onSuccess: () => {
        utils.product.getAllProducts.invalidate();
        toast.success("Product created successfully");
        router.push("/product");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to create product");
      },
    });

  const { mutateAsync: changeProductStatus } =
    api.product.changeProductStatus.useMutation();

  // form handler
  const handleFormSubmit = async (values: CreateProductFormValues) => {
    await createProduct(values);
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Form {...addProductForm}>
        <form
          className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4"
          onSubmit={addProductForm.handleSubmit(handleFormSubmit)}
        >
          <div className="flex items-center gap-4">
            <Link
              href={"/product"}
              className={buttonVariants({
                size: "icon",
                variant: "outline",
                className: "h-7 w-7",
              })}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button variant="outline" size="sm" type="button">
                Discard
              </Button>
              <Button
                size="sm"
                type="submit"
                loading={isPending}
                disabled={isPending}
              >
                Save Product
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <ProductDetail addProductForm={addProductForm} />
              <ProductCategory addProductForm={addProductForm} />
              <ProductPrice addProductForm={addProductForm} />
              <Inventory addProductForm={addProductForm} />
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <ProductStatus addProductForm={addProductForm} />
              <ProductImage addProductForm={addProductForm} />
              <GoogleadsMeta addProductForm={addProductForm} />
              <AdvancedInventory addProductForm={addProductForm} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 md:hidden">
            <Link
              href={"/product"}
              className={buttonVariants({
                size: "sm",
                variant: "outline",
              })}
            >
              Discard
            </Link>
            <Button
              size="sm"
              type="submit"
              loading={isPending}
              disabled={isPending}
            >
              Save Product
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}

export default AddProductPage;
