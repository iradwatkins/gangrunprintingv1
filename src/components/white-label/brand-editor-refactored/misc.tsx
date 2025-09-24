/**
 * brand-editor - misc definitions
 * Auto-refactored by BMAD
 */

'use client'

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BrandEditorProps {
  section: 'colors' | 'typography' | 'logos' | 'layout' | 'custom' | 'email'
}

interface BrandConfig {
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string

  // Typography
  primaryFont: string
  secondaryFont: string
  fontSize: string
  fontWeight: string
  lineHeight: string

  // Layout
  borderRadius: string
  spacing: string
  containerWidth: string
  headerHeight: string

  // Branding
  logoUrl: string
  logoText: string
  faviconUrl: string
  brandName: string

  // Custom
  customCss: string
  customJs: string

  // Email
  emailHeaderLogo: string
  emailFooterText: string
  emailColors: {
    header: string
    headerText: string
    footer: string
    footerText: string
    button: string
    buttonText: string
  }
}
