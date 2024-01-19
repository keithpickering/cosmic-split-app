import React from 'react';
import { Button, XStack, Text } from 'tamagui';

type PaginationProps = {
  pageCount: number;
  activePage: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  pageCount,
  activePage,
  onPageChange,
}: PaginationProps) {
  const MAX_PAGES_TO_SHOW = 5; // Maximum number of pages to display in the pagination bar

  const paginationItems = [];

  let startPage = Math.max(1, activePage - Math.floor(MAX_PAGES_TO_SHOW / 2));
  let endPage = Math.min(pageCount, startPage + MAX_PAGES_TO_SHOW - 1);

  if (endPage - startPage + 1 < MAX_PAGES_TO_SHOW) {
    startPage = Math.max(1, endPage - MAX_PAGES_TO_SHOW + 1);
  }

  paginationItems.push(
    <Button
      key="first"
      disabled={activePage === 1}
      onPress={() => onPageChange(1)}>
      &lt;&lt;
    </Button>,
  );

  // Previous Page Button
  paginationItems.push(
    <Button
      key="prev"
      disabled={activePage === 1}
      onPress={() => onPageChange(activePage - 1)}>
      &lt;
    </Button>,
  );

  // Start Ellipsis
  if (startPage > 1) {
    paginationItems.push(<Button key="start-ellipsis">...</Button>);
  }

  // Page Numbers
  for (let page = startPage; page <= endPage; page++) {
    paginationItems.push(
      <Button
        key={page}
        disabled={activePage === page}
        themeInverse={activePage === page}
        color={activePage === page ? 'white' : undefined}
        onPress={() => onPageChange(page)}>
        {page}
      </Button>,
    );
  }

  // End Ellipsis
  if (endPage < pageCount) {
    paginationItems.push(<Button key="end-ellipsis">...</Button>);
  }

  // Next Page Button
  paginationItems.push(
    <Button
      key="next"
      disabled={activePage === pageCount}
      onPress={() => onPageChange(activePage + 1)}>
      &gt;
    </Button>,
  );

  paginationItems.push(
    <Button
      key="last"
      disabled={activePage === pageCount}
      onPress={() => onPageChange(pageCount)}>
      &gt;&gt;
    </Button>,
  );

  return (
    <XStack alignItems="center" gap="$2">
      {paginationItems}
    </XStack>
  );
}
