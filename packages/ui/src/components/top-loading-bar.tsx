"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

function TopLoadingBar({ color = "#2563EB" }: { color?: string }) {
  return (
    <>
      <ProgressBar
        height="4px"
        color={color}
        options={{ showSpinner: true }}
        shallowRouting
      />
    </>
  );
}

export default TopLoadingBar;
