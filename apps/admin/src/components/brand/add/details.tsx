import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vapestation/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@vapestation/ui/card";
import { Textarea } from "@vapestation/ui/textarea";
import { Input } from "@vapestation/ui/input";
import { type UseFormReturn } from "react-hook-form";
import { type CreateBrandFormValues } from "common/schema/brand";
import { stringToSlug } from "common";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type Props = {
  addBrandForm: UseFormReturn<CreateBrandFormValues, any, undefined>;
};

function BrandDetails({ addBrandForm }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <FormField
            control={addBrandForm.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    className="w-full"
                    onChange={(event) => {
                      field.onChange(event);
                      addBrandForm.setValue(
                        "slug",
                        stringToSlug(event.target.value),
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={addBrandForm.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel className="flex items-center gap-x-2">
                  Permalink
                  <Link
                    href={`${process.env.NEXT_PUBLIC_STORE_URL}/brand/${field.value}`}
                    className="flex cursor-pointer items-center gap-x-1 text-blue-600"
                    target="_blank"
                  >
                    link
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </FormLabel>
                <FormControl>
                  <Input {...field} type="text" className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={addBrandForm.control}
            name="description"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel className="flex items-center gap-x-2">
                  Description *
                </FormLabel>
                <FormControl>
                  <Textarea {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default BrandDetails;
