"use client";

import { Button, buttonVariants } from "@vapestation/ui/button";
import React, { useEffect } from "react";
import { Form } from "@vapestation/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategorySchema,
  CreateCategoryFormValues,
} from "common/schema/category";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { api } from "~admin/trpc/react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import CategoryDetails from "~admin/components/category/add/category-details";
import ParentId from "~admin/components/category/add/parent-id";
import CategoryImage from "~admin/components/category/add/category-image";
import { util, z } from "zod";
import { compare } from "fast-json-patch";

type Props = {};

function EditCategory({}: Props) {
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
  const updateCategoryForm = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
  });

  // server utils
  const utils = api.useUtils();

  //   server interactions
  const { data: category } = api.category.getCategoryById.useQuery(id, {
    enabled: !!id,
    refetchInterval: false,
    throwOnError(error, query) {
      if (error.data?.code === "NOT_FOUND") {
        toast.error("Category not found");
        router.push("/category");
      } else {
        toast.error("Category not found");
        router.push("/category");
      }
      return true;
    },
  });
  const { mutateAsync: updateCategory, isPending } =
    api.category.updateCategory.useMutation({
      onSuccess: () => {
        utils.category.getCategoryById.invalidate(id);
        toast.success("Category updated successfully");
      },
    });

  // handle form submit
  const handleFormSubmit = async (values: CreateCategoryFormValues) => {
    if (!category) return;
    // create patch json
    const patch = compare(category, values);
    const body = { patch, id: category.id };
    await updateCategory(body);
  };

  //  setting form values
  useEffect(() => {
    if (!category) return;
    updateCategoryForm.setValue("name", category.name);
    updateCategoryForm.setValue("description", category.description);
    updateCategoryForm.setValue("slug", category.slug);
    updateCategoryForm.setValue(
      "parentCategoryId",
      category.parentCategoryId ?? undefined,
    );
    updateCategoryForm.setValue("image", category.image);
  }, [category]);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Form {...updateCategoryForm}>
        <form
          className="mx-auto grid w-full flex-1 auto-rows-max gap-4"
          onSubmit={updateCategoryForm.handleSubmit(handleFormSubmit)}
        >
          <div className="flex items-center gap-4">
            <Link
              href={"/category"}
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
              <Button
                size="sm"
                type="submit"
                loading={isPending}
                disabled={isPending}
              >
                Update Category
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <CategoryDetails addCategoryForm={updateCategoryForm} />
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <ParentId addCategoryForm={updateCategoryForm} />
              <CategoryImage addCategoryForm={updateCategoryForm} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 md:hidden">
            <Link
              href={"/category"}
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
              Update Category
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}

export default EditCategory;
