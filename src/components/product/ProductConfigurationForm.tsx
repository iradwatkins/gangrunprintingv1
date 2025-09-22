/**
 * ProductConfigurationForm - Refactored Entry Point
 * Original: 688 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { useEffect, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AddonAccordion from './AddonAccordion'
import TurnaroundTimeSelector from './TurnaroundTimeSelector'

// Re-export refactored modules
export * from './ProductConfigurationForm-refactored/misc';
export * from './ProductConfigurationForm-refactored/component';

// Main export (if component file)
import MainComponent from './ProductConfigurationForm-refactored/component';
export default MainComponent;
