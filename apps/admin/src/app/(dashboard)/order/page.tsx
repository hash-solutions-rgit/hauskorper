"use client";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreVertical,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@vapestation/ui/badge";
import { Button, buttonVariants } from "@vapestation/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vapestation/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@vapestation/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@vapestation/ui/pagination";
import { Separator } from "@vapestation/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@vapestation/ui/table";
import { api } from "~admin/trpc/react";
import { format } from "date-fns/format";
import { useState } from "react";
import { pmedFormSchema } from "common/schema/forms/pmeds";
import Link from "next/link";

function OrderPage() {
  const {
    data: ordersData,
    hasNextPage,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    hasPreviousPage,
  } = api.order.getAllOrder.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1,
      refetchInterval: false,
    },
  );

  const orders = ordersData?.pages.flatMap((page) => page.orders);

  const [index, setIndex] = useState(0);

  const order =
    orders && orders?.length > 0 && orders[index] ? orders[index] : null;

  // handler
  const handlePrevOrder = () => {
    setIndex((prev) => {
      if (prev <= 0) {
        return 0;
      } else {
        return prev - 1;
      }
    });
  };

  const handleNextOrder = () => {
    if (!orders?.length) return;
    setIndex((prev) => {
      if (prev >= orders?.length) {
        return orders?.length - 1;
      } else {
        return prev + 1;
      }
    });
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Card>
          <CardHeader className="px-7">
            <CardTitle>Orders</CardTitle>
            <CardDescription>Recent orders from your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order, index) => {
                  return (
                    <TableRow
                      className="bg-accent cursor-pointer"
                      key={order.id}
                      onClick={() => {
                        setIndex(index);
                      }}
                    >
                      <TableCell>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-muted-foreground hidden text-sm md:inline">
                          {order.customer.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        Sale
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className="text-xs" variant={"secondary"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(order.createdAt, "dd-MM-yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        &pound;{order.totalAmount}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <Pagination className="my-5 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        disabled={!hasPreviousPage}
                        onClick={() => fetchPreviousPage()}
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
                        onClick={() => fetchNextPage()}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="sr-only">Next Product</span>
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>

      {order && (
        <div>
          <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
            <CardHeader className="bg-muted/50 flex flex-row items-start">
              <div className="grid gap-0.5">
                <CardTitle className="group flex items-center gap-2 text-lg">
                  {order.orderId}
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy Order ID</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Date: {format(order.createdAt, "MMMM dd,yyyy")}
                </CardDescription>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Link
                  className={buttonVariants({
                    size: "sm",
                    className: "h-8 gap-1",
                  })}
                  href={`/order/${order.id}`}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                    Order Details
                  </span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline" className="h-8 w-8">
                      <MoreVertical className="h-3.5 w-3.5" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Trash</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-sm">
              <div className="grid gap-3">
                <div className="font-semibold">Order Details</div>
                <ul className="grid gap-3">
                  {order.products.map((product) => (
                    <li
                      className="flex items-center justify-between"
                      key={product.id}
                    >
                      <span className="text-muted-foreground">
                        {product.product.name} x <span>{product.quantity}</span>
                      </span>
                      <span>&pound;{product.price}</span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-2" />
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      &pound;
                      {order.products.reduce((sum, product) => {
                        return sum + product.price;
                      }, 0)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span> &pound;3.95</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>included</span>
                  </li>
                  <li className="flex items-center justify-between font-semibold">
                    <span className="text-muted-foreground">Total</span>
                    <span> &pound;{order.totalAmount}</span>
                  </li>
                </ul>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <div className="font-semibold">Shipping Information</div>
                  <address className="text-muted-foreground grid gap-0.5 not-italic">
                    <span>{order.address.line1}</span>
                    <span>{order.address.line2}</span>
                    <span>
                      {order.address.country}, {order.address.state}
                    </span>
                    <span>
                      {order.address.city}, {order.address.post_code}
                    </span>
                  </address>
                </div>
                <div className="grid auto-rows-max gap-3">
                  <div className="font-semibold">Billing Information</div>
                  <div className="text-muted-foreground">
                    Same as shipping address
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid gap-3">
                <div className="font-semibold">Customer Information</div>
                <dl className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Customer</dt>
                    <dd>{order.customer.name}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>
                      <a href="mailto:">{order.customer.email}</a>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>
                      <a href="tel:">+44 {order.customer.phone}</a>
                    </dd>
                  </div>
                </dl>
              </div>
              <Separator className="my-4" />

              <div className="flex flex-col gap-4">
                <h4>Questionnaire</h4>
                <ul>
                  {order.FormMetaData.map((data) => {
                    const formData = pmedFormSchema.safeParse(data.value);
                    if (!formData.success) return null;

                    return (
                      <li key={data.id}>
                        <ul>
                          {Object.entries(formData.data).map(
                            ([question, answer]) => (
                              <li>
                                {question} :{" "}
                                {["string", "number", "boolean"].includes(
                                  typeof answer,
                                )
                                  ? answer
                                  : (answer as string[]).join(", ")}
                              </li>
                            ),
                          )}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 flex flex-row items-center border-t px-6 py-3">
              <div className="text-muted-foreground text-xs">
                Updated{" "}
                <time dateTime={format(order.createdAt, "yyyy-MM-dd")}>
                  {format(order.createdAt, "MMMM dd, yyyy")}
                </time>
              </div>
              <Pagination className="ml-auto mr-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={handlePrevOrder}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span className="sr-only">Previous Order</span>
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={handleNextOrder}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span className="sr-only">Next Order</span>
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </div>
      )}
    </main>
  );
}

export default OrderPage;
