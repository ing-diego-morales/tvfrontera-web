// src/app/panel/layout.tsx
import type { Metadata } from "next";
import RequireAuth from "@/components/panel/RequireAuth";

export const metadata: Metadata = { title: "Mi Punto Aliado", robots: { index: false, follow: false } };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={["SOCIO"]}>{children}</RequireAuth>;
}
