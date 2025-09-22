/**
 * page - Refactored Entry Point
 * Original: 546 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { box } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
import toast from '@/lib/toast'

// Re-export refactored modules
export * from './page-refactored/misc';
export * from './page-refactored/component';

// Main export (if component file)
import MainComponent from './page-refactored/component';
export default MainComponent;
