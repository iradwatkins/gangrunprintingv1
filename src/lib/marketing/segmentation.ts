/**
 * segmentation - Refactored Entry Point
 * Original: 737 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { prisma } from '@/lib/prisma'

// Re-export refactored modules
export * from './segmentation-refactored/misc';
export * from './segmentation-refactored/types';

// Main export (if component file)

