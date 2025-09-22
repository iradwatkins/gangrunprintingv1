/**
 * product-options - Refactored Entry Point
 * Original: 535 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
import {
import {
import {
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Re-export refactored modules
export * from './product-options-refactored/misc';
export * from './product-options-refactored/component';

// Main export (if component file)

