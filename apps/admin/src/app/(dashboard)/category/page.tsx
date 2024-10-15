import { buttonVariants } from "@vapestation/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import CategoryTable from "~admin/components/category/table";

function Category() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center justify-end">
        <Link
          href="/category/add"
          className={buttonVariants({ size: "sm", className: "h-8 gap-1" })}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Category
          </span>
        </Link>
      </div>
      <CategoryTable />
    </main>
  );
}

export default Category;
