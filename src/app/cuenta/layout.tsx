// src/app/cuenta/layout.tsx
import type { Metadata } from "next";
import RequireAuth from "@/components/panel/RequireAuth";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false, follow: false } };

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
