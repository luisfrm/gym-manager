import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

type Props = {
  total: number;
  pages: number;
  next: string | null;
  prev: string | null;
  currentPage: number;
  onPageNext: () => void;
  onPagePrev: () => void;
  isLoading: boolean;
};

const PaginationComponent = ({ next, prev, currentPage, onPageNext, onPagePrev, isLoading }: Props) => {
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
        <PaginationItem>
          <PaginationLink href="#">{currentPage}</PaginationLink>
        </PaginationItem>
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
