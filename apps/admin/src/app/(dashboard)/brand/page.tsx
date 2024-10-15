import React from "react";
import { buttonVariants } from "@vapestation/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import BrandTable from "../../../components/brand/brand-table";

type Props = {};

function BrandPage({}: Props) {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center justify-end">
        <Link
          href="/brand/add"
          className={buttonVariants({ size: "sm", className: "h-8 gap-1" })}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Brand
          </span>
        </Link>
      </div>
      <BrandTable />
    </main>
  );
}

export default BrandPage;
