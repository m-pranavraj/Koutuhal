import { useState, useCallback } from "react";

interface UsePaginationOptions {
  pageSize?: number;
}

export const usePagination = ({ pageSize = 20 }: UsePaginationOptions = {}) => {
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = page < totalPages - 1;
  const hasPrev = page > 0;

  const nextPage = useCallback(() => {
    if (hasNext) setPage(p => p + 1);
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) setPage(p => p - 1);
  }, [hasPrev]);

  const resetPage = useCallback(() => setPage(0), []);

  const range = { from: page * pageSize, to: (page + 1) * pageSize - 1 };

  return {
    page,
    setPage,
    pageSize,
    totalCount,
    setTotalCount,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    resetPage,
    range,
  };
};
