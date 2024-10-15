"use client";

import { Button, buttonVariants } from "@vapestation/ui/button";
import { Input } from "@vapestation/ui/input";
import React, { useMemo, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vapestation/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@vapestation/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategorySchema,
  CreateCategoryFormValues,
} from "common/schema/category";
import { Cat, ChevronLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { imageFullPath, stringToSlug } from "common";
import { api } from "~admin/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@vapestation/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vapestation/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vapestation/ui/select";
import { Label } from "~ui/ui/label";
import CategoryDetails from "~admin/components/category/add/category-details";
import ParentId from "~admin/components/category/add/parent-id";
import CategoryImage from "~admin/components/category/add/category-image";

type Props = {};

function AddCategory({}: Props) {
  // hooks
  const router = useRouter();
  // form hooks
  const addCategoryForm = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
  });

  //   server interactions
  const { mutateAsync: addCategory, isPending } =
    api.category.addCategory.useMutation({
      onSuccess: () => {
        toast.success("Category created successfully");
        router.push("/category");
      },
    });

  // handle form submit
  const handleFormSubmit = async (values: CreateCategoryFormValues) => {
    await addCategory(values);
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Form {...addCategoryForm}>
        <form
          className="mx-auto grid w-full flex-1 auto-rows-max gap-4"
          onSubmit={addCategoryForm.handleSubmit(handleFormSubmit)}
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
              <Button variant="outline" size="sm" type="button">
                Discard
              </Button>
              <Button
                size="sm"
                type="submit"
                loading={isPending}
                disabled={isPending}
              >
                Save Category
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <CategoryDetails addCategoryForm={addCategoryForm} />
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <ParentId addCategoryForm={addCategoryForm} />
              <CategoryImage addCategoryForm={addCategoryForm} />
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
              Save Category
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}

export default AddCategory;
