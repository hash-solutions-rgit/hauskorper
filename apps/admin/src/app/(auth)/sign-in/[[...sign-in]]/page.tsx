"use client";

import { SignIn, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect } from "react";
import bg from "~admin/assets/images/auth-bg.webp";
import logo from "~admin/assets/svg/logo.svg";

export default function AuthLayout() {
  // hooks
  const { setTheme } = useTheme();

  const { signOut } = useClerk();

  //  side effects
  useEffect(() => {
    setTheme("light");
    signOut();
  }, []);

  return (
    <div className="flex">
      <div className="absolute right-0 z-0 h-[25vh] w-screen md:h-screen md:w-[30vw]">
        <Image
          src={bg}
          alt="Image"
          className="h-screen w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="invisible absolute right-5 top-5 rounded-lg bg-white p-2 md:visible">
        <Image
          alt="Vapestation Logo - large"
          width={1334}
          height={635}
          className="h-14 w-auto object-contain"
          src={logo}
        />
      </div>
      <div className="z-50 flex h-screen w-full flex-col items-center justify-center pt-20 md:w-2/3 md:p-0">
        <SignIn
          appearance={{
            elements: {
              footer: {
                display: "none",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
