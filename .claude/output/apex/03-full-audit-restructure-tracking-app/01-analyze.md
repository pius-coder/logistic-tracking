# Step 01: Analyze

**Task:** Full audit and restructure tracking app - remove AI features, setup admin with blog, ensure all redirects work, verify all features
**Started:** 2026-07-01T15:30:55Z

---

## Context Discovery

### Project Overview
- **App:** JC Import Express - Tracking colis (package tracking)
- **Language:** French (fr)
- **Stack:** Next.js 16, Aura (custom framework), Prisma 7, PostgreSQL 5433
- **Auth:** Phone-based (E.164) with OTP + password, opaque sessions (30-day TTL)
- **Admin:** Based on `isAdmin` boolean on `AuraUser` model
- **Mapping:** Mapbox GL JS for tracking visualization

### 1. Full Project Structure

```
Root
├── src/
│   ├── proxy.ts           # Next.js 16 Proxy (edge middleware)
│   ├── aura.registry.ts   # Register all feature operations
│   ├── app/               # 22 pages, 4 layouts, 5 API routes
│   │   ├── (auth)/        # Login, register, logout, reset-password, verify-phone
│   │   ├── (client)/      # Public + authenticated routes
│   │   │   ├── (public)/  # Landing page, tracking/[id]
│   │   │   └── (main)/    # Dashboard, compte, blog, notifications, legal
│   │   └── (admin)/       # Admin dashboard, requests, clients, blog, cms, settings
│   ├── aura/              # Aura meta-framework (~60 files)
│   ├── features/          # 5 domains: admin, blog, notifications, tracking, user
│   ├── components/        # ~90 custom + 40 shadcn/ui components
│   ├── generated/prisma/  # Prisma generated client
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities
├── prisma/                # Schema (18 models), seeds
└── .claude/output/apex/   # APEX output folders
```

### 2. Database Schema (18 Models)
- **Core Business:** `Request` (colis), `TrajectoryStep`, `RequestStatusEvent`, `Country`
- **Auth:** `AuraUser`, `AuraPhoneIdentity`, `AuraPasswordCredential`, `AuraSession`, `AuraOtpChallenge`
- **Content:** `BlogPost`, `SiteContent`, `AppSettings`, `JcNotification`
- **System:** `AuraNotification`, `AuraOutboxEvent`, `AuraAuditLog`, `AuraFile`, `AuraJobRun`, `AuraRateLimitBucket`, `AdminAccessKey`, `WhatsAppAuthSession`

### 3. Aura Framework (Proprietary)
- `defineOperationFn("domain.action").query()/.mutate().input(schema).params(schema).entities([...]).use(...).auth()/.public()/.internal().handler(...)`
- Context `ctx` provides: db, session, user, auth, notify, bump, log, audit, requestId, source, request, cookies, storage
- Registry imports all feature modules in `src/aura.registry.ts`
- Client-side: `useAuraQuery`, `useAuraMutation`, `useAuraForm`, `AuraGuard`

### 4. Auth System
- Phone-based registration/login with password + OTP
- Session token (64-char base64url, SHA-256 hashed in DB), 30-day TTL
- CSRF double-submit cookie pattern (HMAC-SHA256)
- Proxy layer checks cookie presence for redirects
- Auth guard layouts at: `(main)/layout.tsx`, `(admin)/layout.tsx`, `(onboarding)/layout.tsx`

### 5. Public Pages
| Route | File | Description |
|-------|------|-------------|
| `/` | `(client)/(public)/page.tsx` | Landing page (static + blog section) |
| `/tracking/[id]` | `tracking/[id]/page.tsx` | Map-based real-time tracking (chromeless) |
| `/blog` | `blog/page.tsx` | Blog listing |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | Blog post detail |

### 6. Admin Pages (7 of 10 nav links have actual pages)
| Route | Status |
|-------|--------|
| `/dashboard/admin` | ✅ Dashboard with stats |
| `/dashboard/admin/requests` | ✅ Request listing |
| `/dashboard/admin/clients` | ✅ Client listing |
| `/dashboard/admin/blog` | ✅ Blog CRUD manager |
| `/dashboard/admin/cms` | ✅ CMS editor |
| `/dashboard/admin/parametres` | ✅ Settings |
| `/dashboard/admin/produits` | ❌ Missing page (components exist: AdminProductsShell) |
| `/dashboard/admin/categories` | ❌ Missing page |
| `/dashboard/admin/paiements` | ❌ Missing page |
| `/dashboard/admin/avis` | ❌ Missing page |
| `/dashboard/admin/pays` | ❌ Missing page (operation exists: admin.countries) |
| `/dashboard/admin/requests/[id]` | ❌ Missing page (all shell components exist) |
| `/dashboard/admin/clients/[id]` | ❌ Missing page (operation exists: admin.userById) |

### 7. AI Features Remaining
- `src/app/(client)/(public)/page.tsx` - already cleaned (AI references removed)
- `src/app/api/ai/fill-product/route.ts` - already deleted
- No remaining AI features found in the codebase

### 8. Blog System
- `BlogPost` model with: title, slug, content, excerpt, imageUrl, author, published, publishedAt, tags, metaTitle, metaDesc, type (BLOG/ADVICE)
- Public ops: `blog.posts` (list published), `blog.postBySlug` (get single)
- Admin ops: `admin.blogPosts` (list all), `admin.saveBlogPost` (CRUD), `admin.deleteBlogPost`
- BlogSection on landing page fetches 3 latest posts
- Blog list page at `/blog`, detail at `/blog/[slug]`

### 9. Home Components (Landing Page)
| Component | Description |
|-----------|-------------|
| `header.tsx` | Site header with nav and phone |
| `hero.tsx` | Hero with static tracking search (cosmetic only) |
| `features.tsx` | Services + testimonials + CTA |
| `benefits.tsx` | Mission/vision/values |
| `pricing.tsx` | Contact form (static, no handler) |
| `faq.tsx` | Accordion FAQ |
| `blog-section.tsx` | RSC that fetches 3 latest blog posts |
| `landing.tsx` | Composition of all above |

### 10. Next.js 16 Breaking Changes to Address
1. ✅ `proxy.ts` already renamed (was `middleware.ts`)
2. ❓ Async params/searchParams - verify all pages use `await` on params
3. ✅ Using Node.js runtime (not Edge) for proxy
4. ✅ No AMP usage
5. ❓ No `next lint` in scripts - uses external ESLint
6. ❓ Check `turbopack` config location
7. ❓ Check for `revalidateTag` usage
8. ❓ Check for `experimental.*` configs
9. ✅ No `serverRuntimeConfig` usage

### 11. Redirects Analysis
- **Proxy.ts** handles auth redirects (line 327-347):
  - Protected paths without session → `/login?redirect=...`
  - Auth pages with session → `/dashboard`
- **Server components** use `redirect()` from `next/navigation` (throws error)
  - `(main)/layout.tsx`: redirects to `/onboarding` if onboarding incomplete
  - `(onboarding)/layout.tsx`: redirects to `/` if onboarding complete
  - `(admin)/layout.tsx`: redirects to `/dashboard` if not admin, `/login` if not logged in
  - `logout/page.tsx`: redirects to `/login` after logout
- **Tracking page** uses two-tier auth pattern (try auth, fallback to public)
- **Missing:** Custom `not-found.tsx`, `forbidden.js`, `unauthorized.js`

### 12. Acceptance Criteria
- [ ] AC1: All AI features completely removed from codebase
- [ ] AC2: Blog system fully functional - admin CRUD, public listing, landing page section
- [ ] AC3: All admin routes redirect correctly based on auth/role
- [ ] AC4: Missing admin pages created or dead nav links removed
- [ ] AC5: All redirects use Next.js 16 compliant patterns
- [ ] AC6: All pages comply with Next.js 16 async params API
- [ ] AC7: Tracking features work for both authenticated and public users
- [ ] AC8: Landing page renders correctly with blog section
- [ ] AC9: Auth flow works end-to-end (register → verify → login → dashboard)
- [ ] AC10: No dead code, broken imports, or deprecated APIs
