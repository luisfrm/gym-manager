import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

type Props = {
  totalPages: number;
  currentPage: number;
  maxVisiblePages?: number;
  next: string | null;
  prev: string | null;
  onPageNext: () => void;
  onPagePrev: () => void;
  onPageChange: (value: number) => void;
  isLoading: boolean;
};

const PaginationComponent = ({
  totalPages,
  maxVisiblePages = 5,
  next,
  prev,
  currentPage,
  onPageNext,
  onPagePrev,
  onPageChange,
  isLoading,
}: Props) => {
  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range if at the start or end
      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Add range numbers
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <Pagination className="w-[200px]">
      <PaginationContent>
        <PaginationItem>
          <button
            disabled={!prev || isLoading}
            onClick={onPagePrev}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaginationPrevious />
          </button>
        </PaginationItem>

        {renderPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <PaginationItem key={`dots-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem
              key={page}
              onClick={() => onPageChange(Number(page))}
              aria-current={currentPage === page ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              <PaginationLink href="#" isActive={currentPage === page} onClick={() => onPageChange(Number(page))}>{page}</PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <button
            disabled={!next || isLoading}
            onClick={onPageNext}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaginationNext />
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
