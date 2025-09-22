/**
 * business-intelligence - hooks definitions
 * Auto-refactored by BMAD
 */

import { businessMetrics } from '@/lib/monitoring'
import { recordMetric } from '@/lib/sentry'


export const userBehavior = new UserBehaviorAnalytics()