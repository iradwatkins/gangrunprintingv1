/**
 * business-intelligence - Refactored Entry Point
 * Original: 512 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { businessMetrics } from '@/lib/monitoring'
import { recordMetric } from '@/lib/sentry'

// Re-export refactored modules
export * from './business-intelligence-refactored/misc';
export * from './business-intelligence-refactored/utils';
export * from './business-intelligence-refactored/hooks';

// Main export (if component file)

