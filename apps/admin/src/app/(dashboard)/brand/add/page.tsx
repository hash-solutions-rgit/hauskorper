"use client";

import { Button, buttonVariants } from "@vapestation/ui/button";
import React from "react";
import { Form } from "@vapestation/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateBrandFormValues, createBrandSchema } from "common/schema/brand";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { api } from "~admin/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CategoryImage from "~admin/components/category/add/category-image";
import BrandDetails from "~admin/components/brand/add/details";

type Props = {};

function AddBrand({}: Props) {
  // hooks
  const router = useRouter();
  // form hooks
  const addBrandForm = useForm<CreateBrandFormValues>({
    resolver: zodResolver(createBrandSchema),
  });

  //   server interactions
  const { mutateAsync: addBrand, isPending } = api.brand.addBrand.useMutation({
    onSuccess: () => {
      toast.success("Brand created successfully");
      router.push("/brand");
    },
  });

  // handle form submit
  const handleFormSubmit = async (values: CreateBrandFormValues) => {
    await addBrand(values);
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Form {...addBrandForm}>
        <form
          className="mx-auto grid w-full flex-1 auto-rows-max gap-4"
          onSubmit={addBrandForm.handleSubmit(handleFormSubmit)}
        >
          <div className="flex items-center gap-4">
            <Link
              href={"/brand"}
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
                Save Brand
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <BrandDetails addBrandForm={addBrandForm} />
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <CategoryImage addCategoryForm={addBrandForm} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 md:hidden">
            <Link
              href={"/brand"}
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
              Save Brand
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}

export default AddBrand;
