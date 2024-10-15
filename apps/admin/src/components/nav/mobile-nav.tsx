"use client";

import { Sheet, SheetContent, SheetTrigger } from "@vapestation/ui/sheet";
import { Button } from "@vapestation/ui/button";
import { LineChart, Package2, PanelLeft } from "lucide-react";
import { navItems } from "./constant";
import Link from "next/link";
import { useState } from "react";

function MobileNav() {
  // local state
  const [isOpen, setIsOpen] = useState(false);

  //   handle close mobile nav
  const handleClose = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className="bg-primary text-primary-foreground group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:text-base"
            onClick={handleClose}
          >
            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Acme Inc</span>
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
              onClick={handleClose}
            >
              <item.Icon className="h-5 w-5" />
              {item.title}
            </Link>
          ))}
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
            onClick={handleClose}
          >
            <LineChart className="h-5 w-5" />
            Settings
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
