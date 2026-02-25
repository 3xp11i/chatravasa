import { Capacitor } from '@capacitor/core';

/**
 * Composable for detecting platform and providing platform-specific functionality
 */
export const usePlatform = () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform(); // 'web', 'android', 'ios'
  const isAndroid = platform === 'android';
  const isIOS = platform === 'ios';
  const isWeb = platform === 'web';

  return {
    isNative,
    isAndroid,
    isIOS,
    isWeb,
    platform
  };
};
