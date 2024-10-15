import { Card, CardContent, CardHeader, CardTitle } from "@vapestation/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vapestation/ui/form";
import { stringToSlug } from "common";
import { type CreateProductFormValues } from "common/schema/product";
import {
  Check,
  ChevronsUpDown,
  ExternalLink,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@vapestation/ui/input";
import { Textarea } from "@vapestation/ui/textarea";
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
import { cn } from "~ui/lib/utils";
import { Button } from "~ui/ui/button";
import { Select } from "~ui/ui/select";
import { api } from "~admin/trpc/react";
import { useState } from "react";
import ReactMdEditor from "~admin/components/common/react-md-editor";

type Props = {
  addProductForm: UseFormReturn<CreateProductFormValues>;
};

function ProductDetail({ addProductForm }: Props) {
  // local state
  const [longDescription, setLongDescription] = useState<string>("");

  // server interaction
  const {
    data: brandResponse,
    hasNextPage,
    isLoading,
  } = api.brand.getAllBrandsMeta.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1,
      refetchInterval: false,
    },
  );

  //    computed values
  const brands = brandResponse?.pages?.flatMap((page) => page.brands) ?? [];

  // handlers
  const handleLongDescriptionChange = (value: string | undefined) => {
    setLongDescription(value ?? "");
    addProductForm.setValue("longDescription", value ?? "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <FormField
            control={addProductForm.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    className="w-full"
                    onChange={(event) => {
                      field.onChange(event);
                      addProductForm.setValue(
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
            control={addProductForm.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel className="flex items-center gap-x-2">
                  Permalink*
                  <Link
                    href={`${process.env.NEXT_PUBLIC_STORE_URL}/product/${field.value}`}
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
            control={addProductForm.control}
            name="description"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Description*</FormLabel>
                <FormControl>
                  <Input {...field} type="text" className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={addProductForm.control}
            name="longDescription"
            render={({ field }) => {
              return (
                <FormItem className="grid gap-3">
                  <FormLabel>Long Description</FormLabel>
                  <FormControl>
                    <ReactMdEditor
                      value={longDescription}
                      setValue={handleLongDescriptionChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={addProductForm.control}
            name="brandId"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Brand *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[200px] justify-between",
                          field.value
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <span className="truncate">
                          {field.value
                            ? brands.find((brand) => brand.id === field.value)
                                ?.name
                            : "Select Brand"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search brand..." />
                      <CommandEmpty>
                        {isLoading ? (
                          <span>
                            <LoaderCircle className="mx-auto h-4 w-4 animate-spin" />
                          </span>
                        ) : (
                          "No brand found."
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {brands.map((brand) => {
                            return (
                              <CommandItem
                                value={brand.id}
                                key={brand.id}
                                onSelect={() => {
                                  addProductForm.setValue("brandId", brand.id);
                                }}
                                className="truncate"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    brand.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {brand.name}
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
        </div>

        <div className="my-5 grid grid-cols-1 gap-4">
          <h2>Product Dimensions</h2>

          <div className="grid grid-cols-1 gap-2">
            <FormField
              control={addProductForm.control}
              name="dimension.height"
              render={({ field }) => {
                return (
                  <FormItem className="grid gap-3">
                    <FormLabel>Height</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="w-full"
                        onChange={(event) => {
                          field.onChange(event);
                          addProductForm.setValue(
                            "dimension.height",
                            event.currentTarget.valueAsNumber,
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={addProductForm.control}
              name="dimension.weight"
              render={({ field }) => {
                return (
                  <FormItem className="grid gap-3">
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="w-full"
                        onChange={(event) => {
                          field.onChange(event);
                          addProductForm.setValue(
                            "dimension.weight",
                            event.currentTarget.valueAsNumber,
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={addProductForm.control}
              name="dimension.length"
              render={({ field }) => {
                return (
                  <FormItem className="grid gap-3">
                    <FormLabel>Length</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="w-full"
                        onChange={(event) => {
                          field.onChange(event);
                          addProductForm.setValue(
                            "dimension.length",
                            event.currentTarget.valueAsNumber,
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductDetail;
