import React from 'react';
import { Toast, useToastState } from '@tamagui/toast';
import { YStack, useTheme, useWindowDimensions } from 'tamagui';
import { StyleSheet } from 'react-native';

declare module '@tamagui/toast' {
  interface CustomData {
    variant: 'error' | 'success' | 'warning';
  }
}

export default function CurrentToast() {
  const currentToast = useToastState();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const theme = useTheme();

  let backgroundColor;
  let color;
  let borderColor;
  if (currentToast?.variant === 'error') {
    backgroundColor = theme.red4.val;
    borderColor = theme.red8.val;
    color = theme.red9.val;
  }

  if (!currentToast || currentToast.isHandledNatively) {
    return null;
  }

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={styles.enter}
      exitStyle={styles.exit}
      opacity={1}
      backgroundColor={backgroundColor}
      scale={1}
      animation="100ms"
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="$2"
      shadowColor="#000000"
      shadowRadius={5}
      shadowOffset={{ width: 0, height: 5 }}
      shadowOpacity={0.1}
      viewportName={currentToast.viewportName}>
      <YStack>
        <Toast.Title color={color}>{currentToast.title}</Toast.Title>
        {!!currentToast.message && (
          <Toast.Description color={color}>
            {currentToast.message}
          </Toast.Description>
        )}
      </YStack>
    </Toast>
  );
}

const styles = StyleSheet.create({
  enter: { opacity: 0, scale: 0.5, y: -25 },
  exit: { opacity: 0, scale: 1, y: -20 },
});
