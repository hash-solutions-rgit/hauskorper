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
import { MoreHorizontal } from "lucide-react";
import { api } from "~admin/trpc/react";
import { MouseEvent, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { imageFullPath } from "common";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@vapestation/ui/skeleton";

type Props = {};

function CategoryTable({}: Props) {
  // hooks
  const router = useRouter();

  // server utils
  const utils = api.useUtils();

  // server interactions
  const {
    data: categoryResponse,
    hasNextPage,
    isLoading,
    fetchNextPage,
  } = api.category.getAllCategories.useInfiniteQuery(
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
        toast.success("Category deleted successfully");
        router.push("/category");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const categories = useMemo(
    () => categoryResponse?.pages?.flatMap((page) => page.categories) ?? [],
    [categoryResponse],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>
          Manage your products and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !categoryResponse ? (
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
              {categories.map((category) => {
                const pushEditPage = () => {
                  router.push(`/category/edit/${category.id}`);
                };
                // handle delete category
                const handleDeleteCategory = async (event: MouseEvent) => {
                  event.stopPropagation();
                  await deleteCategory(category.id);
                };
                return (
                  <TableRow key={category.id} onClick={pushEditPage}>
                    <TableCell className="font-medium">
                      <img
                        className="aspect-square h-10 w-10 rounded-md bg-gray-100 object-contain"
                        src={imageFullPath(category.image)}
                        loading="lazy"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {category.slug}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDistanceToNow(new Date(category.createdAt))}
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

export default CategoryTable;
