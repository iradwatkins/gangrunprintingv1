/**
 * translation-manager - Refactored Entry Point
 * Original: 544 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { useState, useEffect, useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
import {
import {
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
import { useToast } from '@/hooks/use-toast'

// Re-export refactored modules
export * from './translation-manager-refactored/misc';
export * from './translation-manager-refactored/component';

// Main export (if component file)

