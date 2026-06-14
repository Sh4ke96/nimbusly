"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatMessage } from "@/lib/i18n/format";
import { getTotalPages, getVisiblePageNumbers } from "@/lib/notifications/pagination";
import { NOTIFICATIONS_PAGE_SIZE } from "@/lib/constants/notifications";
import { useT } from "@/lib/lang-context";

interface NotificationsPaginationProps {
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function NotificationsPagination({
  page,
  totalItems,
  onPageChange,
}: NotificationsPaginationProps) {
  const t = useT();
  const totalPages = getTotalPages(totalItems, NOTIFICATIONS_PAGE_SIZE);

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePageNumbers(page, totalPages);

  return (
    <div className="flex flex-col items-center gap-3 border-t border-border px-4 py-4">
      <p className="text-xs text-muted-foreground">
        {formatMessage(t.notifications.pageSummary, {
          page: String(page),
          total: String(totalPages),
        })}
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              label={t.notifications.paginationPrevious}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            />
          </PaginationItem>
          {visiblePages.map((pageNumber, index) =>
            pageNumber === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={pageNumber === page}
                  onClick={() => onPageChange(pageNumber)}
                  aria-label={formatMessage(t.notifications.pageNumberLabel, {
                    page: String(pageNumber),
                  })}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              label={t.notifications.paginationNext}
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
