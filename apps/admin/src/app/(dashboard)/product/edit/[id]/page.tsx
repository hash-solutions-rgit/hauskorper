"use client";

import { Button, buttonVariants } from "@vapestation/ui/button";
import {
  CreateProductFormValues,
  createProductFormSchema,
} from "common/schema/product";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@vapestation/ui/form";
import { useEffect } from "react";
import { api } from "~admin/trpc/react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import ProductDetail from "~admin/components/product/add-product/product-detail";
import ProductStatus from "~admin/components/product/add-product/product-status";
import ProductCategory from "~admin/components/product/add-product/product-category";
import ProductImage from "~admin/components/product/add-product/product-image";
import ProductPrice from "~admin/components/product/add-product/product-price";
import Link from "next/link";
import { compare } from "fast-json-patch";
import Inventory from "~admin/components/product/add-product/inventory";
import GoogleadsMeta from "~admin/components/product/add-product/googleads-meta";
import AdvancedInventory from "~admin/components/product/add-product/advanced-inventory";
import ProductSchema from "~admin/components/product/edit/schema";

function EditProductPage() {
  // hooks
  const router = useRouter();
  const params = useParams();

  // parsing id from params
  const id = z
    .object({
      id: z.string(),
    })
    .parse(params).id;

  // server utils
  const utils = api.useUtils();

  // server interaction
  const { mutateAsync: updateProduct, isPending } =
    api.product.updateProduct.useMutation({
      onSuccess: () => {
        utils.product.getAllProducts.invalidate();
        utils.product.getProductById.invalidate(id);
        toast.success("Product updated successfully");
      },
    });

  const { data: product, isLoading: isProductLoading } =
    api.product.getProductById.useQuery(id);

  // add product form
  const addProductForm = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
  });

  // form handler
  const handleFormSubmit = async (values: CreateProductFormValues) => {
    if (!product) return;
    // create patch json
    const patch = compare(product, values);
    const body = { patch, id: product.id };
    await updateProduct(body);
  };

  useEffect(() => {
    if (!product || isProductLoading) return;
    console.log(product);
    addProductForm.setValue("status", product.status);
    addProductForm.setValue("costPrice", product.costPrice);
    addProductForm.setValue("sellingPrice", product.sellingPrice);
    addProductForm.setValue("name", product.name);
    addProductForm.setValue("slug", product.slug);
    addProductForm.setValue("description", product.description);
    addProductForm.setValue(
      "longDescription",
      product.longDescription ?? undefined,
    );
    addProductForm.setValue("image", product.image);
    addProductForm.setValue("blockGuest", product.blockGuest);
    addProductForm.setValue("brandId", product.brandId);
    console.log(product.categoryIds, "product.categoryIds");
    addProductForm.setValue("categoryIds", product.categoryIds);
    addProductForm.setValue("discountPrice", product.discountPrice);

    if (product.dimension)
      addProductForm.setValue("dimension", product.dimension);

    if (product.googleAdsMeta) {
      addProductForm.setValue(
        "googleAdsMeta.brand",
        product.googleAdsMeta.brand,
      );
      addProductForm.setValue("googleAdsMeta.gtin", product.googleAdsMeta.gtin);
      addProductForm.setValue(
        "googleAdsMeta.pipCode",
        product.googleAdsMeta.pipCode ?? undefined,
      );
    }
    addProductForm.setValue("inventory", product.inventory);
    addProductForm.setValue("limitPerUser", product.limitPerUser);
    addProductForm.setValue("blockGuest", product.blockGuest);
    addProductForm.setValue("sku", product.sku);
  }, [isProductLoading]);

  if (isProductLoading) {
    return <div>Loading...</div>;
  }

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
            <h1>
              Edit Product:{" "}
              <span className="font-semibold">
                {addProductForm.getValues("sku")}
              </span>
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button
                size="sm"
                type="submit"
                loading={isPending}
                disabled={isPending}
              >
                Update Product
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <ProductDetail addProductForm={addProductForm} />
              <ProductCategory
                addProductForm={addProductForm}
                isProductLoading={isProductLoading}
              />
              <ProductPrice addProductForm={addProductForm} />
              <Inventory addProductForm={addProductForm} />
              <ProductSchema id={id} />
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
            <Button size="sm">Save Product</Button>
          </div>
        </form>
      </Form>
    </main>
  );
}

export default EditProductPage;
