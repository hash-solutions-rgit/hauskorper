"use client";

import { Button, buttonVariants } from "@vapestation/ui/button";
import React, { useEffect } from "react";
import { Form } from "@vapestation/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateBrandFormValues, createBrandSchema } from "common/schema/brand";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { api } from "~admin/trpc/react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import CategoryImage from "~admin/components/category/add/category-image";
import BrandDetails from "~admin/components/brand/add/details";
import { compare } from "fast-json-patch";
import { z } from "zod";

type Props = {};

function AddBrand({}: Props) {
  // hooks
  const router = useRouter();

  const params = useParams();
  // parsing id from params
  const id = z
    .object({
      id: z.string(),
    })
    .parse(params).id;

  // form hooks
  const updateBrandForm = useForm<CreateBrandFormValues>({
    resolver: zodResolver(createBrandSchema),
  });

  // server utils
  const utils = api.useUtils();

  //   server interactions
  const { data: brand } = api.brand.getBrandById.useQuery(id, {
    enabled: !!id,
    refetchInterval: false,
    throwOnError(error, query) {
      if (error.data?.code === "NOT_FOUND") {
        toast.error("Brand not found");
        router.push("/brand");
      } else {
        toast.error("Brand not found");
        router.push("/brand");
      }
      return true;
    },
  });
  const { mutateAsync: updateBrand, isPending } =
    api.brand.updateBrand.useMutation({
      onSuccess: () => {
        utils.brand.getBrandById.invalidate(id);
        toast.success("Brand created successfully");
        router.push("/brand");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // handle form submit
  const handleFormSubmit = async (values: CreateBrandFormValues) => {
    if (!brand) return;
    // create patch json
    const patch = compare(brand, values);
    const body = { patch, id: brand.id };
    await updateBrand(body);
  };

  //  setting form values
  useEffect(() => {
    if (!brand) return;
    updateBrandForm.setValue("name", brand.name);
    updateBrandForm.setValue("description", brand.description);
    updateBrandForm.setValue("slug", brand.slug);
    updateBrandForm.setValue("image", brand.image);
  }, [brand]);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Form {...updateBrandForm}>
        <form
          className="mx-auto grid w-full flex-1 auto-rows-max gap-4"
          onSubmit={updateBrandForm.handleSubmit(handleFormSubmit)}
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
                Update Brand
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <BrandDetails addBrandForm={updateBrandForm} />
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <CategoryImage addCategoryForm={updateBrandForm} />
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
              Update Brand
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}

export default AddBrand;
