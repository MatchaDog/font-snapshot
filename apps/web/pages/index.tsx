import { A } from "@solidjs/router";
import { createSignal, For } from "solid-js";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "@components/ui/pagination";
import { createQuery } from "@tanstack/solid-query";

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

export default function Home() {
  const [currentPage, setCurrentPage] = createSignal(1);
  const itemsPerPage = 30;

  const fontsQuery = createQuery(() => ({
    queryKey: ["/google/fonts/list"],
    queryFn: fetchFonts,
  }));

  const paginatedFonts = () => {
    const allFonts = fontsQuery.data || [];
    const startIndex = (currentPage() - 1) * itemsPerPage;
    return allFonts.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = () => Math.ceil((fontsQuery.data?.length || 0) / itemsPerPage);

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="text-2xl font-bold mb-4">字体列表</h1>
      {fontsQuery.isLoading ? (
        <p>加载中...</p>
      ) : fontsQuery.isError ? (
        <p>加载出错: {fontsQuery.error.message}</p>
      ) : (
        <>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <For each={paginatedFonts()}>
              {(font) => (
                <div class="border p-4 rounded">
                  <h2 class="text-xl mb-2">{font.family}</h2>
                  <p>分类: {font.category}</p>
                  <A
                    href={`/preview/${font.family}`}
                    class="text-blue-500 hover:underline"
                  >
                    预览
                  </A>
                </div>
              )}
            </For>
          </div>
          <Pagination
            page={currentPage()}
            onPageChange={setCurrentPage}
            count={totalPages()}
            itemComponent={(props) => (
              <PaginationItem page={props.page}>{props.page}</PaginationItem>
            )}
            ellipsisComponent={() => <PaginationEllipsis />}
          >
            <PaginationPrevious />
            <PaginationItems />
            <PaginationNext />
          </Pagination>
        </>
      )}
    </main>
  );
}
