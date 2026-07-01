# APEX Analysis: 01-logistic-tracking-website

## Codebase Overview

Current project: **GlobalImex v3** — A cross-border import/export platform for African trade. Built on Next.js 16 + Aura meta-framework + Prisma 7 + PostgreSQL.

## Domain Architecture

### Features to KEEP (logistics tracking + blog core):
| Feature | Files | Models | Ops |
|---------|-------|--------|-----|
| **tracking/** | `features/tracking/server/` (5 ops), `components/tracking/` (12 files), `pages/tracking/[id]` | TrajectoryStep, RequestStatusEvent | keep all |
| **blog/** | `features/blog/` (2 ops), `components/blog/` (8 files), `pages/blog/[slug]` & `pages/blog/` | BlogPost | keep all |
| **auth/** | `aura/server/auth/operations.ts` (10 ops), `pages/(auth)/` (7 pages) | AuraUser, AuraSession, etc. | keep auth |
| **notifications/** | `features/notifications/` | GlobalimexNotification | keep |
| **admin blog CMS** | `admin server/` blogPosts, saveBlogPost, deleteBlogPost | BlogPost, SiteContent | keep |
| **admin site content** | `admin server/` siteContent | SiteContent | keep |
| **admin settings** | `admin server/` settings | AppSettings | keep |

### Features to REMOVE (ecommerce/ordering):
| Feature | Files | Models | Ops |
|---------|-------|--------|-----|
| **catalog/** | `features/catalog/` (6 ops), `components/catalog/` (10 files) | Product, ProductImage, Category, FreightRule | remove entirely |
| **requests/** | `features/requests/` (4 ops), pages demande/, transit/, mes-demandes/ | Request | remove entirely |
| **payments/** | `features/payments/` (1 op), `components/client/ClientPaymentSection` | Payment, PaymentMethod | remove entirely |
| **reviews/** | `features/reviews/` (3 ops) | ProductReview | remove entirely |
| **referral/** | `features/referral/` (2 ops), pages parrainage/ | Referral | remove entirely |
| **admin products/categories/payments** | admin products/, categories/, paiements/ pages & ops | — | remove |
| **admin freight rules** | admin freightRules ops | FreightRule | remove |
| **admin reviews** | admin reviews ops | ProductReview | remove |

### Home page - needs complete rewrite

## Current Color Scheme (globals.css)
- `--primary`: #fcaa67 (sandy-brown)
- `--secondary`: #548687 (dark-cyan)  
- `--accent`: #b0413e (dusty-mauve)
- `--background`: #fffff7 (cream)
- `--foreground`: #473335 (deep-mocha)
- `--success`: #4ade80
- `--warning`: #facc15

## New Color Scheme (black/white/blue)
- `--primary`: Blue (e.g., #2563eb)
- `--secondary`: Slate/gray (e.g., #64748b)
- `--accent`: Lighter blue (e.g., #3b82f6)
- `--background`: White (#ffffff) / Near-white (#f8fafc)
- `--foreground`: Black/near-black (#0f172a)
- `--success`: #10b981 (teal/green)
- `--warning`: #f59e0b

## Key Patterns
- Shell/Content/Skeleton pattern for pages
- Aura operations with `defineOperationFn`
- `@base-ui/react` instead of `@radix-ui/react`
- `proxy.ts` instead of `middleware.ts`
- `params` and `searchParams` are Promises (Next.js 16)
- CSS custom properties in globals.css with Tailwind v4 `@theme inline {}`
