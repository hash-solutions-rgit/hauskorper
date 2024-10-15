"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vapestation/ui/card";
import {
  Table,
  TableBody,
  TableCell,
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
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@vapestation/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@vapestation/ui/avatar";
import { api } from "~admin/trpc/react";
import { useCustomerStore } from "~admin/store";

export default function CustomerTable() {
  // hooks
  const { page, decreasePage, increasePage } = useCustomerStore();

  // server interaction
  const { data: customersResponse } = api.customer.getAllCustomers.useQuery({
    page,
  });

  if (!customersResponse) {
    return null;
  }

  const { customers, hasMore } = customersResponse;

  // handlers
  const fetchNextPage = () => {
    hasMore && increasePage();
  };

  const fetchPrevPage = () => {
    page > 1 && decreasePage();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          Manage your products and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell">#</TableHead>
              <TableHead className="hidden sm:table-cell"></TableHead>
              <TableHead className="hidden sm:table-cell">Name</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map(({ email, id, image_url, full_name }, index) => (
              <TableRow key={id}>
                <TableCell className="hidden sm:table-cell">{index}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src={image_url} alt={id} />
                    <AvatarFallback>
                      {email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {full_name}
                </TableCell>
                <TableCell className="hidden sm:table-cell">{email}</TableCell>
                <TableCell className="w-fit">
                  <MoreActions />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground text-xs">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div>
        <Pagination className="ml-auto mr-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                disabled={!(page > 1)}
                onClick={fetchPrevPage}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Previous Customer</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                disabled={!hasMore}
                onClick={fetchNextPage}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Next Customer</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}

function MoreActions() {
  // local state
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
