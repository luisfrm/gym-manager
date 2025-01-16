import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";

type Props = {
  total: number;
  pages: number;
  next: string | null;
  prev: string | null;
  currentPage: number;
  onPageNext: () => void;
  onPagePrev: () => void;
};

const PaginationComponent = ({ total, pages, next, prev, currentPage, onPageNext, onPagePrev }: Props) => {
  return (
    <Pagination className="w-[200px]">
      <PaginationContent>
        {
          !!prev && (
            <PaginationItem>
              <PaginationPrevious href="#" onClick={onPagePrev} />
            </PaginationItem>
          )
        }
        <PaginationItem>
          <PaginationLink href="#">{currentPage}</PaginationLink>
        </PaginationItem>
        {
          !!next && (
            <PaginationItem>
              <PaginationNext href="#" onClick={onPageNext} />
            </PaginationItem>
          )
        }
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
