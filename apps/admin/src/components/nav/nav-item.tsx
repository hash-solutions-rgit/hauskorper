"use client";

import { cn } from "@vapestation/ui/utils";
import { NavItem as NavItemType } from "./type";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@vapestation/ui/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({
  item,
  showFullSidebar,
}: {
  item: NavItemType;
  showFullSidebar: boolean;
}) {
  const { Icon, href, title } = item;

  //   hooks
  const pathname = usePathname();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
            pathname.includes(href) && "bg-accent text-accent-foreground",
            showFullSidebar && "justify-start gap-2 md:h-full md:w-full",
          )}
        >
          <Icon className="h-5 w-5" />
          <span className={cn(!showFullSidebar && "sr-only")}>{title}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  );
}

export default NavItem;
