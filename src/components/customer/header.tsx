/**
 * header - Refactored Entry Point
 * Original: 598 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
import { cn } from '@/lib/utils'
import { ThemeToggle, MobileThemeToggle } from '@/components/theme-toggle'
import { CartButton } from '@/components/cart/cart-button'

// Re-export refactored modules
export * from './header-refactored/misc';
export * from './header-refactored/component';

// Main export (if component file)

