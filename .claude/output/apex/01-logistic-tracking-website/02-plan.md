# APEX Plan: 01-logistic-tracking-website

## Overview
Transform GlobalImex v3 from an import-export platform into a logistics tracking website with black/white/blue color scheme, removing all ecommerce (catalog, requests, payments, reviews, referral) while keeping and enhancing blog + auth. 10 execution phases ordered by dependency.

---

## Implementation Plan

### Phase 0: Verify No Cross-References
- Check for remaining imports from ecommerce features across non-ecommerce files
- Audit the Aura registry imports

### Phase 1: Color Scheme → `src/app/globals.css`
**File: `src/app/globals.css` (lines 7-49, 51-106, 108-155)**
- Replace brand color variables (sandy-brown, dusty-mauve, dark-cyan, cream, deep-mocha) → blue, white, black/slate palette
- New palette:
  - `--blue-primary: #2563eb` (primary blue)
  - `--blue-accent: #3b82f6` (lighter accent blue)
  - `--slate-900: #0f172a` (near-black foreground)
  - `--slate-50: #f8fafc` (near-white background)
  - `--slate-200: #e2e8f0` (border/input)
  - `--slate-500: #64748b` (secondary/muted)
  - `--white: #ffffff`
- Update all CSS variable mappings for light and dark mode
- Keep dark mode with inverted white↔dark-slate

### Phase 2: Update Branding & App Layout
**File: `src/components/layout/AppLayout.tsx`**
- Change brand name if needed (or keep "GlobalImex" as a logistics brand)
- Update NAV_ITEMS: remove "Catalogue", keep "Accueil", "Blog", add "Suivi" (tracking)
- Update footer: remove service links to catalog/transit, keep blog/tracking
- Update mobile nav accordingly

**File: `src/app/layout.tsx`**
- Update metadata title/description for logistics tracking focus
- Update keywords for logistics tracking

### Phase 3: Remove Ecommerce Aura Operations & Features
**Remove entire feature directories:**
- `src/features/catalog/` - products, categories, freight quotes, homeData
- `src/features/requests/` - create, createTransit, myRequests, getById
- `src/features/payments/` - submitProof
- `src/features/reviews/` - create, listByProduct, moderate
- `src/features/referral/` - myInfo, applyCode

### Phase 4: Clean Up Admin Operations
**Remove admin operation files:**
- `src/features/admin/server/products.ts`
- `src/features/admin/server/createProduct.ts`
- `src/features/admin/server/updateProduct.ts`
- `src/features/admin/server/deleteProduct.ts`
- `src/features/admin/server/productById.ts`
- `src/features/admin/server/uploadProductImage.ts`
- `src/features/admin/server/categories.ts`
- `src/features/admin/server/saveCategory.ts`
- `src/features/admin/server/freightRules.ts`
- `src/features/admin/server/saveFreightRule.ts`
- `src/features/admin/server/deleteFreightRule.ts`
- `src/features/admin/server/paymentMethods.ts`
- `src/features/admin/server/reviewPayment.ts`
- `src/features/admin/server/allPayments.ts`
- `src/features/admin/server/paymentMethodCrud.ts`
- `src/features/admin/server/paymentTerms.ts`
- `src/features/admin/server/reviews.ts`
- `src/features/admin/server/clients.ts` (or simplify)
- `src/features/admin/server/userById.ts` (or simplify)
- `src/features/admin/server/toggleUserBlock.ts` (or simplify)
- `src/features/admin/server/toggleUserAdmin.ts` (or simplify)
- `src/features/admin/server/dashboard.ts` (simplify to blog/tracking stats only)

### Phase 5: Update Aura Registry
**File: `src/aura.registry.ts`**
- Remove imports for catalog, requests, payments, reviews, referral features

### Phase 6: Remove Ecommerce Pages
**Remove entire page directories:**
- `src/app/(client)/(main)/catalogue/` (catalog)
- `src/app/(client)/(main)/produits/` (product detail)
- `src/app/(client)/(main)/demande/` (request/demande pages)
- `src/app/(client)/(main)/transit/` (transit wizard)
- `src/app/(client)/(main)/import/` (import pages)
- `src/app/(client)/(main)/import-depuis/` (import from)
- `src/app/(client)/(main)/import-vers/` (import to)
- `src/app/(client)/(main)/livraison/` (delivery info page)
- `src/app/(client)/(main)/dashboard/parrainage/` (referral)
- `src/app/(client)/(main)/dashboard/page.tsx` (rewrite as logistics dashboard)

**Remove admin pages:**
- `src/app/(admin)/dashboard/admin/produits/` (product CRUD)
- `src/app/(admin)/dashboard/admin/categories/`
- `src/app/(admin)/dashboard/admin/paiements/`
- `src/app/(admin)/dashboard/admin/pays/` (countries)
- `src/app/(admin)/dashboard/admin/avis/` (reviews)
- `src/app/(admin)/dashboard/admin/agent/` (AI agent)
- `src/app/(admin)/dashboard/admin/clients/` (simplify or remove)

**Remove API routes:**
- `src/app/api/ai/fill-product/route.ts`

### Phase 7: Remove Ecommerce Components
**Remove entire component directories:**
- `src/components/catalog/`
- `src/components/country/` (CountrySelect, CountryFlag, LocationPicker)
- `src/components/currency/`
- `src/components/client/`
- `src/components/request-detail/`
- `src/components/mes-demandes/`
- `src/components/dashboard/` (rewrite client dashboard)
- `src/components/compte/` (simplify account page)
- `src/components/admin-dashboard/` (remove or simplify)
- `src/components/admin-clients/` (remove or simplify)
- `src/components/admin-paiements/`
- `src/components/agent/`
- `src/components/home/` (keep TrackingSearch, rewrite hero & sections)
- `src/components/admin/AdminPaymentManager.tsx`
- `src/components/admin/ClientActions.tsx`
- `src/components/admin/ProductForm.tsx`
- `src/components/admin/requests/` (request detail admin components - keep trajectory editor, remove ordering components)

### Phase 8: Update Prisma Schema
**File: `prisma/schema.prisma`**
- Remove models: Product, ProductImage, Category, FreightRule, ProductReview, Payment, PaymentMethod, Referral
- Keep: Request, TrajectoryStep, RequestStatusEvent (for tracking history)
- Keep: BlogPost, SiteContent, AppSettings
- Keep all Aura auth models
- Keep Country (useful for tracking routes)
- Keep GlobalimexNotification
- Remove or keep Request model (used by tracking system)
- Run `bun prisma generate` and `bun db:push`

### Phase 9: Rewrite Home Page
**File: `src/app/(client)/(public)/page.tsx`**
- New hero: logistics tracking themed
- Prominent tracking search widget
- Blog showcase section
- Value propositions for logistics tracking
- Remove featured products, categories, testimonial sections

**File: `src/components/home/HomeHeroShell.tsx` + Content**
- Rewrite for logistics tracking branding

**File: `src/components/home/HomeFeaturedShell.tsx` + Content** - Remove
**File: `src/components/home/HomeCategoriesShell.tsx` + Content** - Remove
**File: `src/components/home/HomeTestimonialsShell.tsx` + Content** - Remove or keep simplified

### Phase 10: Run Validation
- `bun prisma generate`
- `bun check:all` (lint + typecheck)
- Fix any import errors or type issues

---

## Risks & Considerations
- **Cross-imports**: Ecommerce types may be imported by non-ecommerce code - verify with grep before removing
- **Prisma relations**: Removing models requires removing all relations first
- **Admin dependency**: Admin operations reference ecommerce entities - must be cleaned up
- **Home page**: References home components that will be removed - must handle gracefully
- **Client dashboard**: References request/mes-demandes - needs rewrite
