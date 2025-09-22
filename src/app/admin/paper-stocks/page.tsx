/**
 * page - Refactored Entry Point
 * Original: 779 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Palette, Square, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
import {
import { Textarea } from '@/components/ui/textarea'
import { CoatingCreationModal } from '@/components/admin/coating-creation-modal'
import { SidesCreationModal } from '@/components/admin/sides-creation-modal'
import toast from '@/lib/toast'

// Re-export refactored modules
export * from './page-refactored/misc';
export * from './page-refactored/component';

// Main export (if component file)
import MainComponent from './page-refactored/component';
export default MainComponent;
