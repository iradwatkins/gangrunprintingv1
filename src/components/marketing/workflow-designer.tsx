/**
 * workflow-designer - Refactored Entry Point
 * Original: 999 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { useState, useCallback } from 'react'
import {
import 'reactflow/dist/style.css'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import {
import {
import { type WorkflowStep, type WorkflowTrigger } from '@/lib/marketing/workflow-engine'

// Re-export refactored modules
export * from './workflow-designer-refactored/misc';
export * from './workflow-designer-refactored/component';

// Main export (if component file)

