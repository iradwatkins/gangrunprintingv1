/**
 * SimpleConfigurationForm - Refactored Entry Point
 * Original: 1052 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
import { LoadingSkeleton, ErrorState } from '@/components/common/loading'
import FileUploadZone from './FileUploadZone'
import AddonAccordionWithVariable from './AddonAccordionWithVariable'
import TurnaroundTimeSelector from './TurnaroundTimeSelector'
import { validateCustomSize, calculateSquareInches } from '@/lib/utils/size-transformer'

// Re-export refactored modules
export * from './SimpleConfigurationForm-refactored/misc';
export * from './SimpleConfigurationForm-refactored/component';

// Main export (if component file)
import MainComponent from './SimpleConfigurationForm-refactored/component';
export default MainComponent;
