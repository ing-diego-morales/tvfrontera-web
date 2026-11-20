// src/app/admin/layout.tsx
import type { Metadata } from "next";
import RequireAuth from "@/components/panel/RequireAuth";

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={["ADMIN"]}>{children}</RequireAuth>;
}
