import React, { useState } from 'react';
import {
  Button,
  XStack,
  Text,
  Popover,
  YStack,
  Label,
  Input,
  Adapt,
} from 'tamagui';

const MAX_PAGES_TO_SHOW = 5; // Maximum number of pages to display in the pagination bar

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
    paginationItems.push(
      <EllipsisButton key="start-ellipsis" onSelectPage={onPageChange} />,
    );
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
    paginationItems.push(
      <EllipsisButton key="end-ellipsis" onSelectPage={onPageChange} />,
    );
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

type EllipsisButtonProps = {
  onSelectPage: (page: number) => void;
};

function EllipsisButton({ onSelectPage }: EllipsisButtonProps) {
  const [pageInput, setPageInput] = useState('');

  const handleSelect = () => {
    try {
      const page = parseInt(pageInput, 10);
      if (Number.isNaN(page)) {
        throw new Error();
      }
      onSelectPage(page);
    } catch (error) {
      //
    } finally {
      setPageInput('');
    }
  };

  return (
    <Popover size="$3" allowFlip>
      <Popover.Trigger asChild>
        <Button key="start-ellipsis">...</Button>
      </Popover.Trigger>
      <Adapt when="sm" platform="touch">
        <Popover.Sheet modal dismissOnSnapToBottom>
          <Popover.Sheet.Frame padding="$4">
            <Adapt.Contents />
          </Popover.Sheet.Frame>
          <Popover.Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Popover.Sheet>
      </Adapt>
      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}>
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" size="$4" />
        <YStack space="$3">
          <XStack space="$2" alignItems="center">
            <Input
              aria-label="Page"
              keyboardType="numeric"
              placeholder="Page"
              size="$2"
              width="$5"
              value={pageInput}
              onChangeText={setPageInput}
            />
            <Popover.Close asChild>
              <Button size="$2" onPress={handleSelect}>
                Go
              </Button>
            </Popover.Close>
          </XStack>
        </YStack>
      </Popover.Content>
    </Popover>
  );
}
