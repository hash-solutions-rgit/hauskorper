"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vapestation/ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "@vapestation/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  FolderDown,
  FolderUp,
  Plus,
} from "lucide-react";
import { Badge } from "@vapestation/ui/badge";
import { Button } from "@vapestation/ui/button";
import { cn } from "~ui/lib/utils";
import { useProductStore } from "~admin/store";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@vapestation/ui/pagination";
import { api } from "~admin/trpc/react";
import { camelCaseToNormalCase, imageFullPath, roundToTwoCeil } from "common";
import { TabsContent } from "@vapestation/ui/tabs";
import { Skeleton } from "@vapestation/ui/skeleton";
import { Prisma, ProductStatus } from "@vapestation/database";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { productColumns } from "common/schema/product";
import { useMemo, useState } from "react";

type ColumnSort = {
  id: string;
  desc: boolean;
};
type SortingState = ColumnSort[];

function ProductTable() {
  // hooks
  const {
    tab,
    page,
    increasePage,
    decreasePage,
    setDeleteProductModal,
    setSelectedProductId,
  } = useProductStore();
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);

  // server utils
  const utils = api.useUtils();

  // server interaction
  const {
    data: productsResponse,
    isLoading,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    fetchNextPage: fetchNextPageTrpc,
  } = api.product.getAllProducts.useInfiniteQuery(
    {
      status: tab === "ALL" ? undefined : tab,
    },
    {
      enabled: !!page,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: false,
      getPreviousPageParam: () => (page - 1 > 0 ? page - 1 : null),
    },
  );

  const { mutateAsync: changeProduct, isSuccess } =
    api.product.changeProductStatus.useMutation({
      onSuccess() {
        utils.product.getAllProducts.invalidate();
        toast("Status changed successfully", {
          dismissible: true,
          duration: 2000,
        });
      },
    });

  // compute data
  const products = useMemo(
    () =>
      productsResponse?.pages
        ?.flatMap((page) => page.products)
        .slice(20 * (page - 1), page * 20),
    [productsResponse, page],
  );
  const totalProducts = productsResponse?.pages[0]?.totalProducts ?? 0;

  // handle pagination
  const fetchNextPage = () => {
    if (hasNextPage) {
      increasePage();
      fetchNextPageTrpc();
    }
  };

  const fetchPrevPage = () => {
    if (page > 1) {
      decreasePage();
    }
  };

  // handle delete product
  const handleDeleteProduct = (id: string) => {
    setDeleteProductModal(true);
    setSelectedProductId(id);
  };

  // handle change product status
  const handleChangeProductStatus = async (
    status: ProductStatus,
    id: string,
  ) => {
    await changeProduct({
      status,
      id,
    });
  };

  // table utils

  // column helper
  const columnHelper = createColumnHelper<
    Prisma.ProductGetPayload<{
      include: {
        brand: true;
        categories: true;
      };
    }>
  >();

  // column
  const columns = productColumns.map((key) => {
    switch (key) {
      case "costPrice":
      case "sellingPrice":
        return columnHelper.accessor(key, {
          header: camelCaseToNormalCase(key),
          cell: (info) => roundToTwoCeil(info.getValue())?.toString(),
          sortingFn: "alphanumeric",
        });

      case "image":
        return columnHelper.accessor(key, {
          header: "",
          cell: (info) => (
            <div className="flex aspect-square h-8 w-8 items-center justify-center rounded-md bg-gray-50">
              <img
                alt={info.getValue()}
                className="object-cover"
                src={`${imageFullPath(info.getValue())}`}
                loading="lazy"
              />
            </div>
          ),
        });

      case "inventory.quantity":
        return columnHelper.accessor("inventory.quantity", {
          id: "quantity",
          header: "Stock",
          cell: (info) => info.getValue()?.toString(),
        });

      case "categories.name":
        return columnHelper.accessor("categories.name", {
          id: "categoryName",
          header: "Category",
          cell: (info) => info.getValue()?.toString(),
        });

      case "brand.name":
        return columnHelper.accessor("brand.name", {
          id: "brandName",
          header: "Brand",
          cell: (info) => info.getValue()?.toString(),
        });

      case "status":
        return columnHelper.accessor(key, {
          header: camelCaseToNormalCase(key),
          cell: (info) => (
            <Badge
              className={cn(
                info.getValue()?.toString() === "ARCHIVED" &&
                  "bg-red-100 text-red-800",
                info.getValue()?.toString() === "DRAFT" &&
                  "bg-gray-100 text-gray-800",
                info.getValue()?.toString() === "PUBLISHED" &&
                  "bg-green-100 text-green-800",
              )}
            >
              {info.getValue()?.toString()}
            </Badge>
          ),
        });

      default:
        return columnHelper.accessor(key, {
          header: camelCaseToNormalCase(key),
          cell: (info) => info.getValue()?.toString(),
          sortingFn: "alphanumeric",
        });
    }
  });

  const table = useReactTable({
    columns: columns ?? [],
    data: products ?? [],
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    initialState: {
      sorting: [
        {
          id: "name",
          desc: true, // sort by name in descending order by default
        },
      ],
    },
  });

  const { getHeaderGroups, getRowModel } = table;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          Manage your products and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-[calc(100vw-20px)] sm:max-w-[calc(100vw-120px)]">
        {isLoading || !productsResponse || isFetchingNextPage ? (
          <Skeleton className="mt-4 h-60 w-full bg-gray-300" />
        ) : (
          <TabsContent value={tab} className="mt-0">
            <div className="flex flex-col gap-y-2 overflow-x-auto">
              <div className="flex flex-col gap-y-2">
                <Table className="relative w-fit border-y">
                  <TableHeader className="relative  bg-white">
                    {getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        className="sticky top-0 z-10 w-fit"
                      >
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            style={{ width: `${header.getSize()}px` }}
                            className={cn(
                              "relative h-fit w-full max-w-sm cursor-pointer truncate border-r border-r-gray-300 px-3 py-2 font-medium text-gray-800 last:border-r-0",
                            )}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {getRowModel().rows.map((row) => {
                      return (
                        <TableRow
                          key={row.id}
                          className="cursor-pointer"
                          onClick={() => {
                            router.push(`/product/edit/${row.original.id}`);
                          }}
                        >
                          {row.getVisibleCells().map((cell) => {
                            return (
                              <TableCell
                                key={cell.id}
                                className={cn(
                                  "max-w-sm truncate border-r border-t-0 border-gray-300 px-3 py-2 text-gray-600 last:border-r-0",
                                )}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created at
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  return (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer"
                      onClick={() => {
                        router.push(`/product/edit/${product.id}`);
                      }}
                    >
                      <TableCell className="hidden sm:table-cell">
                        <img
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={`${imageFullPath(product.image)}`}
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            product.status === "ARCHIVED" &&
                              "bg-red-100 text-red-800",
                            product.status === "DRAFT" &&
                              "bg-gray-100 text-gray-800",
                            product.status === "PUBLISHED" &&
                              "bg-green-100 text-green-800",
                          )}
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.sellingPrice}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">25</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDistance(product.createdAt, new Date())} ago
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
                            <DropdownMenuItem>
                              <Link
                                href={`/product/edit/${product.id}`}
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Edit2 className="h-3 w-3" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {product.status !== "ARCHIVED" && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleChangeProductStatus(
                                    "ARCHIVED",
                                    product.id,
                                  );
                                }}
                              >
                                <ArchiveX className="h-3 w-3" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            {product.status !== "PUBLISHED" && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() => {
                                  handleChangeProductStatus(
                                    "PUBLISHED",
                                    product.id,
                                  );
                                }}
                              >
                                <BookCheck className="h-3 w-3" />
                                Published
                              </DropdownMenuItem>
                            )}
                            {product.status !== "DRAFT" && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() => {
                                  handleChangeProductStatus(
                                    "DRAFT",
                                    product.id,
                                  );
                                }}
                              >
                                <SquarePen className="h-3 w-3" />
                                Draft
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex items-center gap-2 text-red-600 hover:!text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table> */}
          </TabsContent>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground text-xs">
          Showing{" "}
          <strong>
            {(page - 1) * 20 + 1} -{" "}
            {totalProducts && totalProducts > page * 10
              ? page * 20
              : totalProducts}
          </strong>{" "}
          of <strong>{totalProducts}</strong> products
        </div>
        <Pagination className="ml-auto mr-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                disabled={!hasPreviousPage}
                onClick={fetchPrevPage}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Previous Product</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                disabled={!hasNextPage}
                onClick={fetchNextPage}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Next Product</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}

function TableFooterMenu() {
  return (
    <div className="flex shrink-0 items-center gap-x-4">
      <Button variant={"ghost"} className="gap-x-2">
        <Plus className="h-4 w-4" />
        New Row
      </Button>
      <Button variant={"ghost"} className="gap-x-2">
        <FolderDown className="h-4 w-4" />
        Import
      </Button>
      <Button variant={"ghost"} className="gap-x-2">
        <FolderUp className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
}

export default ProductTable;
