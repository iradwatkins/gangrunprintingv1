/**
 * email-builder - Refactored Entry Point
 * Original: 920 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { useState, useCallback, useRef } from 'react'
import {
import {
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
import { Popover, PopoverContent } from '@/components/ui/popover'
import { ColorPicker } from '@/components/ui/color-picker'
import {

// Re-export refactored modules
export * from './email-builder-refactored/misc';
export * from './email-builder-refactored/types';
export * from './email-builder-refactored/component';

// Main export (if component file)

