/**
 * page - Refactored Entry Point
 * Original: 506 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sun, Moon, Copy, Check, Download, Loader2, ExternalLink } from 'lucide-react'
import { useTheme } from 'next-themes'

// Re-export refactored modules
export * from './page-refactored/misc';
export * from './page-refactored/component';

// Main export (if component file)
import MainComponent from './page-refactored/component';
export default MainComponent;
