import { SignedIn } from "@clerk/nextjs";
import { ReactNode } from "react";
import Header from "~admin/components/header";
import Nav from "~admin/components/nav";
import { TRPCReactProvider } from "~admin/trpc/react";

type LayoutProps = {
  children: ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <SignedIn>
      <TRPCReactProvider>
        <div className="bg-muted/40 relative flex min-h-screen w-full flex-col">
          <Nav />

          <div className="relative flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <Header />
            {children}
          </div>
        </div>
      </TRPCReactProvider>
    </SignedIn>
  );
}

export default Layout;
