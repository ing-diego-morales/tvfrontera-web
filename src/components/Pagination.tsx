// src/components/Pagination.tsx
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  params,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && query.set(k, v));
    query.set("page", String(page));
    return `${basePath}?${query.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <Link
        href={buildUrl(Math.max(1, currentPage - 1))}
        className={`p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors ${
          currentPage === 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronLeft size={18} className="text-indigo" />
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={buildUrl(p)}
          className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
            p === currentPage
              ? "bg-naranja text-white"
              : "bg-white text-indigo border border-gray-200 hover:bg-gray-100"
          }`}
        >
          {p}
        </Link>
      ))}

      <Link
        href={buildUrl(Math.min(totalPages, currentPage + 1))}
        className={`p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors ${
          currentPage === totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronRight size={18} className="text-indigo" />
      </Link>
    </div>
  );
}