"use client";

import { UserButton } from "@clerk/nextjs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@vapestation/ui/breadcrumb";
import { Input } from "@vapestation/ui/input";
import { Badge, LoaderCircle, Search, X } from "lucide-react";
import Link from "next/link";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { useGetBreadcrumb } from "~admin/hooks/useHeader";
import MobileNav from "../nav/mobile-nav";
import { api } from "~admin/trpc/react";
import useDebounce from "~admin/hooks/useDebounce";
import { useRouter } from "next/router";
import { Card, CardContent } from "@vapestation/ui/card";
import { imageFullPath } from "common";

function Header() {
  // hooks
  const breadcrumbs = useGetBreadcrumb();

  // local state
  const [show, setShow] = useState(true);
  const [query, setQuery] = useState("");

  // hooks
  const debouncedValue = useDebounce({ delay: 900, value: query });

  // server intercation
  const { data, isLoading } = api.search.searchGlobal.useQuery(debouncedValue, {
    enabled: !!debouncedValue && debouncedValue.length > 2,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });

  // handlers
  const handleQueryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setQuery(query);
  };

  useEffect(() => {
    setShow(!!debouncedValue && debouncedValue.length > 2);
  }, [debouncedValue]);

  return (
    <header className="bg-background sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <MobileNav />
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <Fragment key={breadcrumb.title}>
              <BreadcrumbItem key={breadcrumb.title}>
                <BreadcrumbLink asChild>
                  {breadcrumb.href ? (
                    <Link href={breadcrumb.href} className="capitalize">
                      {breadcrumb.title}
                    </Link>
                  ) : (
                    <BreadcrumbPage> {breadcrumb.title}</BreadcrumbPage>
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index + 1 !== breadcrumbs.length && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1">
        {data && query && query.length > 2 && show ? (
          <X
            className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4"
            onClick={() => {
              setShow(false);
              setQuery("");
            }}
          />
        ) : isLoading ? (
          <LoaderCircle className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4 animate-spin" />
        ) : (
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
        )}
        <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
        <Input
          type="search"
          placeholder="Search for Brand,Product,Category..."
          className="bg-background w-full rounded-lg pl-8"
          onChange={handleQueryChange}
          value={query ?? ""}
        />
        {data && query && query.length > 2 && show && (
          <SearchList data={data} setShow={setShow} />
        )}
      </div>
      <UserButton />
    </header>
  );
}

export default Header;

function SearchList({
  data,
  setShow,
}: {
  data: {
    products: {
      name: string;
      sellingPrice: number;
      image: string;
      slug: string;
      inventory: {
        quantity: number;
      };
      id: string;
    }[];
    categories: {
      name: string;
      image: string;
      slug: string;
      id: string;
    }[];
    brands: {
      name: string;
      image: string;
      slug: string;
      id: string;
    }[];
  };
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const { brands, categories, products } = data;

  const searchedData = [
    ...brands.map((brand) => ({
      ...brand,
      href: `/brand/edit/${brand.id}`,
    })),
    ...categories.map((category) => ({
      ...category,
      href: `/category/edit/${category.id}`,
    })),
    ...products.map((product) => ({
      ...product,
      href: `/product/edit/${product.id}`,
    })),
  ];

  return (
    <Card className="scrollbar-hide absolute left-1/2 top-full z-50 mt-1 max-h-96 w-[calc(100vw-30px)] -translate-x-1/2 flex-col overflow-y-scroll bg-white md:w-[500px]">
      <CardContent className="scrollbar-hide max-h-80 grow space-y-1 overflow-y-scroll p-5">
        {searchedData?.map((data) => (
          <Link
            href={data.href}
            key={data.id}
            className="group flex items-center gap-4"
            onClick={() => setShow(false)}
          >
            <img
              src={imageFullPath(data.image)}
              alt={data.name}
              className="h-16 w-16 rounded-lg object-cover"
              loading="lazy"
              width={64}
              height={64}
            />
            <div className="grid grid-cols-1 gap-x-4 align-middle md:grid-cols-3">
              <h3 className="group-hover:text-primary w-full text-sm font-semibold transition-colors duration-300">
                {data.name}
              </h3>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
