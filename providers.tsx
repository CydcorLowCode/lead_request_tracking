"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#161920",
            color: "#f0f1f5",
            border: "1px solid rgba(255,255,255,0.12)",
            fontFamily: "var(--font-dm-sans)",
          },
        }}
      />
    </>
  );
}
