"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vapestation/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@vapestation/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@vapestation/ui/dropdown-menu";
import { Button } from "@vapestation/ui/button";
import { Skeleton } from "@vapestation/ui/skeleton";
import { MoreHorizontal } from "lucide-react";
import { api } from "~admin/trpc/react";
import { MouseEvent, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { imageFullPath } from "common";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {};

function BrandTable({}: Props) {
  // hooks
  const router = useRouter();

  // server utils
  const utils = api.useUtils();

  // server interactions
  const {
    data: brandResponse,
    hasNextPage,
    isLoading,
    fetchNextPage,
  } = api.brand.getAllBrands.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1,
      refetchInterval: false,
    },
  );

  const { mutateAsync: deleteCategory, isPending: isUpdatePending } =
    api.category.deleteCategory.useMutation({
      onSuccess: () => {
        utils.category.getAllCategories.invalidate();
        toast.success("Brand deleted successfully");
        router.push("/brand");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const brands = useMemo(
    () => brandResponse?.pages?.flatMap((page) => page.brands) ?? [],
    [brandResponse],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brands</CardTitle>
        <CardDescription>
          Manage your products and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !brandResponse ? (
          <Skeleton className="mt-4 h-60 w-full bg-gray-300" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="hidden md:table-cell">
                  Created at
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => {
                const pushEditPage = () => {
                  router.push(`/brand/edit/${brand.id}`);
                };
                // handle delete category
                const handleDeleteCategory = async (event: MouseEvent) => {
                  event.stopPropagation();
                  await deleteCategory(brand.id);
                };
                return (
                  <TableRow key={brand.id} onClick={pushEditPage}>
                    <TableCell className="font-medium">
                      <img
                        className="aspect-square h-10 w-10 rounded-md bg-gray-100 object-contain"
                        src={imageFullPath(brand.image)}
                        loading="lazy"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {brand.slug}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDistanceToNow(new Date(brand.createdAt))}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={pushEditPage}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleDeleteCategory}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <Button
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage}
                loading={isUpdatePending}
                className="w-full"
              >
                Load more
              </Button>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default BrandTable;
