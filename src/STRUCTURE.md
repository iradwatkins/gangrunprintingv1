# Project Structure (Intermediate Pattern)

/src
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── signin/
│   │   ├── signup/
│   │   └── verify/
│   ├── (dashboard)/       # Protected routes
│   │   ├── events/
│   │   ├── profile/
│   │   └── orders/
│   ├── (marketing)/       # Public routes
│   │   ├── about/
│   │   ├── pricing/
│   │   └── faq/
│   └── api/              # API endpoints
│       ├── webhooks/
│       ├── sse/
│       └── orders/
├── components/           # Organized by feature
│   ├── ui/              # shadcn-ui components
│   ├── forms/           # Form components
│   ├── layouts/         # Layout components
│   └── features/        # Feature-specific
├── lib/                 # Utilities & configs
│   ├── auth/           # Auth utilities
│   ├── db/             # Database helpers
│   └── services/       # External services
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
└── server/             # Server-side logic
    ├── actions/        # Server actions
    └── services/       # Business logic