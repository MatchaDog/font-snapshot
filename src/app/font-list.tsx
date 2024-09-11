"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Font {
  family: string;
  variants: string[];
  category: string;
}

const fetchFonts = async () => {
  const response = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCZkjW4Dh2fr7P-3BMthkW40KaQxoNpmi4&sort=alpha`
  );
  const data = await response.json();
  return data.items as Font[];
};

export default function FontList() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const {
    data: fonts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["/google/fonts/list"],
    queryFn: fetchFonts,
  });

  const paginatedFonts = () => {
    const allFonts = fonts || [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allFonts.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil((fonts?.length || 0) / itemsPerPage);

  if (isLoading) return <p>加载中...</p>;
  if (isError) return <p>加载出错: {error.message}</p>;

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {paginatedFonts().map((font) => (
          <div key={font.family} className="border p-4 rounded">
            <h2 className="text-xl mb-2">{font.family}</h2>
            <p>分类: {font.category}</p>
            <Link
              href={`/font/${font.family}`}
              className="text-blue-500 hover:underline"
            >
              预览
            </Link>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}
