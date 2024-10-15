"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@vapestation/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vapestation/ui/form";
import { type CreateProductFormValues } from "common/schema/product";
import { Check, ChevronsUpDown, LoaderCircle, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
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
import { Badge } from "@vapestation/ui/badge";
import { Button } from "@vapestation/ui/button";
import { cn } from "~ui/lib/utils";
import { api } from "~admin/trpc/react";
import { useEffect, useState } from "react";

type Props = {
  addProductForm: UseFormReturn<CreateProductFormValues>;
  isProductLoading?: boolean;
};

function ProductCategory({ addProductForm, isProductLoading = false }: Props) {
  const { data: categories, isLoading } =
    api.category.getAllCategoriesMeta.useQuery();

  // local states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    addProductForm.getValues("categoryIds") ?? [],
  );

  // handlers
  const handleSelectCategories = (categoryId: string) => {
    setSelectedCategories((current) => {
      const isSelected = current.some((item) => item === categoryId);
      if (isSelected) {
        return current.filter((item) => item !== categoryId);
      } else {
        return [...current, categoryId];
      }
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories((current) =>
      current.filter((item) => item !== categoryId),
    );
  };

  // sideEffects
  // handle when the selectedCategories changes
  useEffect(() => {
    if (!isLoading && !isProductLoading && selectedCategories.length)
      addProductForm.setValue("categoryIds", selectedCategories);
  }, [selectedCategories, isLoading]);

  useEffect(() => {
    console.log(addProductForm.getValues("categoryIds"));
    if (!isLoading && !isProductLoading)
      setSelectedCategories(addProductForm.getValues("categoryIds"));
  }, [isLoading]);

  if (!categories) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Category</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={addProductForm.control}
          name="categoryIds"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <FormLabel>Category *</FormLabel>
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
                            (category) => category.id === field.value[0],
                          )?.name
                        : "Select category"}
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
                              onSelect={() =>
                                handleSelectCategories(category.id)
                              }
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  category.id === field.value[0]
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
              <div
                className="flex flex-wrap gap-2"
                aria-label="Selected products"
              >
                {selectedCategories?.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="py-1 pl-2 pr-1"
                  >
                    {categories?.find((c) => c.id === category)?.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground ml-2 h-auto p-0"
                      onClick={() => handleRemoveCategory(category)}
                      aria-label={`Remove ${categories?.find((c) => c.id === category)?.name}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export default ProductCategory;
