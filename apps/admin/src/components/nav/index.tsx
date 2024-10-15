"use client";

import { Package2, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vapestation/ui/tooltip";
import { navItems } from "./constant";
import Link from "next/link";
import NavItem from "./nav-item";
import { Separator } from "@vapestation/ui/separator";
import { useState } from "react";
import { cn } from "~ui/lib/utils";

function Nav() {
  // local state
  const [showFullSidebar, setShowFullSidebar] = useState(false);

  // handlers
  // const handleSidebarToggle = () => {
  //   setShowFullSidebar((prev) => !prev);
  // };

  return (
    <aside
      className={cn(
        "bg-background fixed inset-y-0 left-0 z-20 hidden w-14 flex-col border-r sm:flex",
        showFullSidebar && "w-40",
      )}
    >
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Logo />
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              showFullSidebar={showFullSidebar}
            />
          ))}
        </nav>
        <SettingNav />
      </TooltipProvider>
    </aside>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="bg-primary text-primary-foreground group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:h-8 md:w-8 md:text-base"
    >
      <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
      <span className="sr-only">Acme Inc</span>
    </Link>
  );
}

function SettingNav() {
  return (
    <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
      <Separator />
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Settings</TooltipContent>
      </Tooltip>
    </nav>
  );
}

export default Nav;
