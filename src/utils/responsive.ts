import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes are based on standard phone
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number) =>
  (SCREEN_WIDTH / guidelineBaseWidth) * size;
export const verticalScale = (size: number) =>
  (SCREEN_HEIGHT / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/**
 * Breakpoints:
 * - Phone: < 600dp
 * - Tablet 7": 600dp - 839dp
 * - Tablet 10": >= 840dp
 */
export const isTablet = SCREEN_WIDTH >= 600;
export const isLargeTablet = SCREEN_WIDTH >= 840;

export const getGridColumns = (defaultCols: number = 2) => {
  if (isLargeTablet) return Math.max(defaultCols + 2, 4);
  if (isTablet) return Math.max(defaultCols + 1, 3);
  return defaultCols;
};

export const getCategoryColumns = () => {
  if (isLargeTablet) return 6;
  if (isTablet) return 4;
  return 3;
};

export const getResponsiveWidth = (percent: number) => {
  return (percent * SCREEN_WIDTH) / 100;
};

export { SCREEN_WIDTH, SCREEN_HEIGHT };
