"use client";
import { Copy, MoreVertical, ShoppingBag } from "lucide-react";
import { Button } from "@vapestation/ui/button";
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
import { Separator } from "@vapestation/ui/separator";
import { format } from "date-fns/format";
import { pmedFormSchema } from "common/schema/forms/pmeds";
import ApprovalButtons from "~admin/components/order/aproval-btns";
import { Badge } from "~ui/ui/badge";
import { api } from "~admin/trpc/react";

type Props = { params: { id: string } };

function OrderDetails({ params }: Props) {
  const { data: order, isLoading } = api.order.getOrder.useQuery(params.id, {
    enabled: !!params.id,
  });

  if (isLoading) return "Loading...";

  if (!order) return "Failed to load";

  return (
    <Card className="m-5 overflow-hidden">
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
          <CardDescription className="flex flex-col gap-4">
            <div>Date: {format(order.createdAt, "MMMM dd,yyyy")}</div>
            <Badge className="w-fit">{order.status}</Badge>
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {order.status === "PENDING" && <ApprovalButtons order={order} />}
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
                    {Object.entries(formData.data).map(([question, answer]) => (
                      <li>
                        {question} :{" "}
                        {["string", "number", "boolean"].includes(typeof answer)
                          ? answer
                          : (answer as string[]).join(", ")}
                      </li>
                    ))}
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
      </CardFooter>
    </Card>
  );
}

export default OrderDetails;
