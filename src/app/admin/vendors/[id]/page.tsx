/**
 * page - Refactored Entry Point
 * Original: 608 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
import {

// Re-export refactored modules
export * from './page-refactored/misc';
export * from './page-refactored/utils';

// Main export (if component file)
import MainComponent from './page-refactored/component';
export default MainComponent;
