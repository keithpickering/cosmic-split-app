import React, { PropsWithChildren, forwardRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Button,
  XStack,
  Text,
  Popover,
  YStack,
  Label,
  Input,
  Adapt,
  ButtonProps,
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
    <PaginationButton
      key="first"
      isDisabled={activePage === 1}
      onPress={() => onPageChange(1)}>
      &lt;&lt;
    </PaginationButton>,
  );

  // Previous Page Button
  paginationItems.push(
    <PaginationButton
      key="prev"
      isDisabled={activePage === 1}
      onPress={() => onPageChange(activePage - 1)}>
      &lt;
    </PaginationButton>,
  );

  // Start Ellipsis
  if (startPage > 1) {
    paginationItems.push(
      <EllipsisButton key="start-ellipsis" onSelectPage={onPageChange} />,
    );
  }

  // Page Numbers
  for (let page = startPage; page <= endPage; page++) {
    const isActivePage = activePage === page;
    paginationItems.push(
      <PaginationButton
        key={page}
        isDisabled={isActivePage}
        isActive={isActivePage}
        onPress={() => onPageChange(page)}>
        {page}
      </PaginationButton>,
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
    <PaginationButton
      key="next"
      isDisabled={activePage === pageCount}
      onPress={() => onPageChange(activePage + 1)}>
      &gt;
    </PaginationButton>,
  );

  paginationItems.push(
    <PaginationButton
      key="last"
      isDisabled={activePage === pageCount}
      onPress={() => onPageChange(pageCount)}>
      &gt;&gt;
    </PaginationButton>,
  );

  return (
    <XStack alignItems="center" gap="$2">
      {paginationItems}
    </XStack>
  );
}

type PaginationButtonProps = {
  onPress?: () => void;
  isDisabled?: boolean;
  isActive?: boolean;
};

function PaginationButton({
  onPress,
  isDisabled = false,
  isActive = false,
  children,
}: PropsWithChildren<PaginationButtonProps>) {
  return (
    <Button
      onPress={onPress}
      disabled={isDisabled}
      opacity={isDisabled ? 0.5 : 1}
      size="$3"
      theme={isActive ? 'active' : null}
      chromeless={!isActive}
      style={styles.button}>
      {children}
    </Button>
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
    <Popover size="$3" placement="right" offset={{ mainAxis: -60 }} allowFlip>
      <Popover.Trigger>
        <PaginationButton>...</PaginationButton>
      </Popover.Trigger>
      <Adapt when="sm" platform="touch">
        <Popover.Sheet modal dismissOnSnapToBottom>
          <Popover.Sheet.Frame padding="$4">
            <Adapt.Contents />
          </Popover.Sheet.Frame>
          <Popover.Sheet.Overlay
            animation="lazy"
            enterStyle={styles.popoverExit}
            exitStyle={styles.popoverExit}
          />
        </Popover.Sheet>
      </Adapt>
      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={styles.popoverExit}
        exitStyle={styles.popoverExit}
        elevate
        animation={[
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}>
        <YStack space="$3">
          <XStack space="$2" alignItems="center">
            <Input
              aria-label="Page"
              keyboardType="numeric"
              placeholder="Page"
              size="$3"
              width="$5"
              value={pageInput}
              onChangeText={setPageInput}
            />
            <Popover.Close asChild>
              <Button size="$3" onPress={handleSelect}>
                Go
              </Button>
            </Popover.Close>
          </XStack>
        </YStack>
      </Popover.Content>
    </Popover>
  );
}

const styles = StyleSheet.create({
  button: {},
  popoverExit: { opacity: 0 },
});
