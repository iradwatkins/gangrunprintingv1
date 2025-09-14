# Architecture Shard 007: Localization & White-Label System

## Overview
**Epic**: Multi-language Support & White-Label Architecture
**Status**: 0% Complete - Not started
**Priority**: Medium - Phase 2 feature

## Technical Requirements

### Localization System
```typescript
interface LocalizationSystem {
  languages: {
    supported: ['en', 'es'];
    default: 'en';
    autoDetect: boolean;
  };
  translations: {
    static: StaticTranslations;
    dynamic: DynamicContent;
    userGenerated: ContentTranslation;
  };
  regional: {
    currency: CurrencySettings;
    dateFormat: DateFormatSettings;
    numberFormat: NumberFormatSettings;
  };
}

interface WhiteLabelSystem {
  branding: {
    logo: LogoConfiguration;
    colors: ColorPalette;
    fonts: Typography;
    favicon: FaviconSettings;
  };
  content: {
    companyInfo: CompanyDetails;
    legalPages: LegalContent;
    emailTemplates: BrandedEmails;
  };
  domains: {
    custom: CustomDomain[];
    subdomains: SubdomainMapping;
    ssl: SSLConfiguration;
  };
}
```

### Implementation Tasks

#### 1. Internationalization (i18n) Setup
- [ ] Configure next-i18next
- [ ] Create translation file structure
- [ ] Implement language switcher
- [ ] Auto-detect browser language
- [ ] Persist language preference
- [ ] RTL support for future languages
- [ ] Translation management interface
- [ ] Plural forms handling

#### 2. Content Translation
- [ ] Static content translation files
- [ ] Database content translation
- [ ] Product description translations
- [ ] Email template translations
- [ ] Error message translations
- [ ] SEO metadata translations
- [ ] URL slug translations
- [ ] Image alt text translations

#### 3. White-Label Theme System
- [ ] Theme configuration interface
- [ ] Dynamic CSS variable injection
- [ ] Logo upload and management
- [ ] Color palette customization
- [ ] Font selection system
- [ ] Custom CSS injection
- [ ] Theme preview mode
- [ ] Theme export/import

#### 4. Multi-Tenant Architecture
- [ ] Tenant identification system
- [ ] Database isolation strategy
- [ ] Tenant-specific configurations
- [ ] Resource isolation
- [ ] Performance isolation
- [ ] Backup strategy per tenant
- [ ] Tenant onboarding flow
- [ ] Billing integration

#### 5. Domain Management
- [ ] Custom domain configuration
- [ ] SSL certificate automation
- [ ] Subdomain routing
- [ ] Domain verification
- [ ] DNS configuration guide
- [ ] Redirect management
- [ ] Domain analytics
- [ ] Failover configuration

### Database Schema Extensions

```sql
-- Translation tables
CREATE TABLE "Translation" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "context" TEXT,
    "isApproved" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    UNIQUE("key", "language")
);

-- Product translations
CREATE TABLE "ProductTranslation" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("productId") REFERENCES "Product"("id"),
    UNIQUE("productId", "language")
);

-- White-label configurations
CREATE TABLE "Tenant" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "domain" TEXT,
    "subdomain" TEXT,
    "theme" JSONB NOT NULL,
    "settings" JSONB,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP
);

-- Tenant-specific overrides
CREATE TABLE "TenantConfig" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "type" TEXT NOT NULL, -- 'branding', 'feature', 'integration'
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id"),
    UNIQUE("tenantId", "key")
);

-- User-tenant associations
CREATE TABLE "UserTenant" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id"),
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id"),
    UNIQUE("userId", "tenantId")
);
```

### Translation Management

```typescript
// Translation service
class TranslationService {
  private cache = new Map<string, Map<string, string>>();

  async loadTranslations(language: string) {
    if (this.cache.has(language)) {
      return this.cache.get(language);
    }

    const translations = await prisma.translation.findMany({
      where: { language, isApproved: true },
    });

    const translationMap = new Map(
      translations.map(t => [t.key, t.value])
    );

    this.cache.set(language, translationMap);
    return translationMap;
  }

  async translate(key: string, language: string, params?: Record<string, any>) {
    const translations = await this.loadTranslations(language);
    let text = translations.get(key) || key;

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, String(v));
      });
    }

    return text;
  }

  async translateContent(content: any, language: string) {
    // Deep translate object properties
    if (typeof content === 'string') {
      return this.translate(content, language);
    }

    if (Array.isArray(content)) {
      return Promise.all(
        content.map(item => this.translateContent(item, language))
      );
    }

    if (typeof content === 'object' && content !== null) {
      const translated: any = {};
      for (const [key, value] of Object.entries(content)) {
        translated[key] = await this.translateContent(value, language);
      }
      return translated;
    }

    return content;
  }
}
```

### Theme System Implementation

```typescript
// Theme configuration
interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: {
      base: string;
      scale: number;
    };
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

// Theme provider component
export function ThemeProvider({ tenant, children }: ThemeProviderProps) {
  const theme = useMemo(() => {
    return generateThemeFromConfig(tenant.theme);
  }, [tenant.theme]);

  useEffect(() => {
    // Inject CSS variables
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set fonts
    root.style.setProperty('--font-body', theme.typography.fontFamily);
    root.style.setProperty('--font-heading', theme.typography.headingFont);
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Multi-Tenant Middleware

```typescript
// Tenant detection middleware
export async function tenantMiddleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Check for custom domain
  let tenant = await prisma.tenant.findFirst({
    where: { domain: hostname, isActive: true },
  });

  // Check for subdomain
  if (!tenant) {
    const subdomain = hostname.split('.')[0];
    tenant = await prisma.tenant.findFirst({
      where: { subdomain, isActive: true },
    });
  }

  // Default tenant
  if (!tenant) {
    tenant = await prisma.tenant.findFirst({
      where: { slug: 'default' },
    });
  }

  // Add tenant to request context
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant.id);
  requestHeaders.set('x-tenant-slug', tenant.slug);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
```

### Localization Components

```typescript
// Language switcher component
export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, locales } = router;

  const handleChange = (newLocale: string) => {
    const { pathname, query } = router;
    router.push({ pathname, query }, undefined, { locale: newLocale });
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales?.map(lang => (
          <SelectItem key={lang} value={lang}>
            {getLanguageName(lang)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Translation hook
export function useTranslation(namespace?: string) {
  const { t, i18n } = useTranslationBase(namespace);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return {
    t: isReady ? t : (key: string) => key,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
  };
}
```

### White-Label Admin Interface

```typescript
// Theme editor components
components/admin/white-label/
├── ThemeEditor.tsx
├── ColorPicker.tsx
├── FontSelector.tsx
├── LogoUploader.tsx
├── PreviewPane.tsx
├── ThemeTemplates.tsx
├── CustomCSS.tsx
└── DomainSettings.tsx

// Theme editor implementation
export function ThemeEditor({ tenant }: { tenant: Tenant }) {
  const [theme, setTheme] = useState(tenant.theme);
  const [preview, setPreview] = useState(false);

  const updateColor = (key: string, value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  const saveTheme = async () => {
    await fetch(`/api/admin/tenants/${tenant.id}/theme`, {
      method: 'PATCH',
      body: JSON.stringify({ theme }),
    });
  };

  return (
    <div className="theme-editor">
      <ColorSection colors={theme.colors} onChange={updateColor} />
      <TypographySection typography={theme.typography} onChange={...} />
      <SpacingSection spacing={theme.spacing} onChange={...} />

      <PreviewModal open={preview} theme={theme} />

      <Button onClick={() => setPreview(true)}>Preview</Button>
      <Button onClick={saveTheme}>Save Theme</Button>
    </div>
  );
}
```

### API Endpoints

```yaml
# Localization API
/api/translations:
  GET: Get translations for language
  POST: Add new translation
  PUT: Update translation

/api/translations/export:
  GET: Export translations as JSON/CSV

/api/translations/import:
  POST: Import translations from file

# White-label API
/api/tenants:
  GET: List tenants (admin)
  POST: Create new tenant

/api/tenants/{id}:
  GET: Get tenant details
  PATCH: Update tenant settings
  DELETE: Delete tenant

/api/tenants/{id}/theme:
  GET: Get tenant theme
  PATCH: Update theme
  POST: Reset to default

/api/tenants/{id}/domain:
  POST: Configure custom domain
  DELETE: Remove custom domain
```

## Performance Considerations

- Translation caching with Redis
- CDN for tenant-specific assets
- Lazy loading of language bundles
- Theme CSS generation at build time
- Database query optimization for tenant data
- Edge caching for multi-tenant routing

## Security Considerations

- Tenant data isolation
- Cross-tenant access prevention
- Domain verification for custom domains
- SSL certificate validation
- Theme CSS sanitization
- Translation content moderation

## Success Criteria

- [ ] English/Spanish fully supported
- [ ] Translations load < 100ms
- [ ] Theme changes apply instantly
- [ ] Custom domains work with SSL
- [ ] Tenant isolation verified
- [ ] No performance degradation
- [ ] Admin can manage all aspects
- [ ] SEO maintained across languages

## Dependencies

- Core application complete
- Admin dashboard (Shard 005)
- Redis for caching
- CDN for assets
- SSL certificate provider

## Implementation Priority

1. Basic i18n setup with static translations
2. Language switcher and persistence
3. Product translation system
4. Theme customization interface
5. Multi-tenant database structure
6. Custom domain support
7. Advanced theme features
8. Translation management UI