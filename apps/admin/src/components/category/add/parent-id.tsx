"use client";

import React, { useMemo } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vapestation/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@vapestation/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@vapestation/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@vapestation/ui/command";
import { Button } from "@vapestation/ui/button";
import { type UseFormReturn } from "react-hook-form";
import { type CreateCategoryFormValues } from "common/schema/category";
import { api } from "~admin/trpc/react";
import { cn } from "~ui/lib/utils";
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";

type Props = {
  addCategoryForm: UseFormReturn<CreateCategoryFormValues, any, undefined>;
};

function ParentId({ addCategoryForm }: Props) {
  const params = useParams();
  const id = params.id as string | undefined;
  // server interactions
  const { data: categories, isLoading } =
    api.category.getAllCategoriesMeta.useQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent Category</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={addCategoryForm.control}
          name="parentCategoryId"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <FormLabel>Parent Category</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? categories?.find(
                            (category) => category.id === field.value,
                          )?.name
                        : "Select parent category"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandEmpty>
                      {isLoading ? (
                        <span>
                          <LoaderCircle className="mx-auto h-4 w-4 animate-spin" />
                        </span>
                      ) : (
                        "No category found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {categories?.map((category) => {
                          return (
                            <CommandItem
                              value={category.id}
                              key={category.id}
                              onSelect={() => {
                                addCategoryForm.setValue(
                                  "parentCategoryId",
                                  category.id,
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  category.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          );
                        })}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export default ParentId;
