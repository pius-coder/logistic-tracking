# Step 02: Plan

**Task:** Update landing page, product, and blog to be dynamic server-side using Aura framework; manage content through an admin dashboard; admin adds clients manually with no client registration; add products and blog articles; remove hardcoded data and static elements; manage testimonials for landing page and product details with form fields name, advice, star; do not launch a server or install dependencies.
**Started:** 2026-07-02T20:53:03Z

---

## Implementation Plan

### Overview

Move runtime product, testimonial, and editable landing/blog copy out of hardcoded component arrays into Prisma-backed Aura operations. Keep `generateStaticParams` on the product detail route, but make it read product slugs from server-side data instead of the static `PRODUCTS` array.

### Prerequisites

- [ ] Do not install dependencies.
- [ ] Do not launch a dev server.
- [ ] Keep `src/app/(client)/(public)/produits/[slug]/page.tsx:9` `generateStaticParams`.
- [ ] After Prisma schema edits, run local Prisma generation before typechecking.

### File Changes

#### `prisma/schema.prisma`
- Add `Product` model after existing content models at `prisma/schema.prisma:445`.
- Add `ProductTestimonial` model for admin-entered testimonials with `name`, `advice`, `star`, optional `productId`, `showOnLanding`, `isPublished`, and `sortOrder`.
- Add indexes for published/sorted product and testimonial reads.

#### `prisma/seed.ts`
- Import new generated models/enums as needed near `prisma/seed.ts:1`.
- Add seed rows for initial `SiteContent` landing/blog/product-section copy using `siteContent.upsert`, matching the current runtime hardcoded text from `landing-data.ts`, `hero.tsx`, `products.tsx`, `features.tsx`, and blog page copy.
- Add seed products based on current `PRODUCTS` content from `src/components/home/landing-data.ts:128`.
- Add seed testimonials based on current product reviews and landing testimonials from `src/components/home/features.tsx:143`.
- Keep existing blog post seeding at `prisma/seed.ts:186`; adjust only if needed for compatibility.

#### `src/features/catalog/types.ts` (NEW FILE)
- Define public view types for products and testimonials consumed by home/product components.
- Include split `features` and `gallery` arrays in the view type so UI files do not parse storage fields.

#### `src/features/catalog/server/products.ts` (NEW FILE)
- Add public Aura queries:
  - `catalog.products`: published products, sorted, with published testimonials for rating counts.
  - `catalog.productBySlug`: one published product by slug with product testimonials.
  - `catalog.productSlugs`: published product slugs for `generateStaticParams`.
  - `catalog.landingTestimonials`: testimonials flagged for landing display.
- Follow the public blog pattern in `src/features/blog/server/blogPosts.ts:5`.

#### `src/features/catalog/index.ts` (NEW FILE)
- Re-export catalog product operations so registry imports evaluate the operation modules.

#### `src/features/site/server/content.ts` (NEW FILE)
- Add public `site.content` Aura query returning published `SiteContent` by optional sections.
- Return a flat key/value map (`section.key -> publishedContent`) and grouped sections.

#### `src/features/site/index.ts` (NEW FILE)
- Re-export public site content operation.

#### `src/features/admin/shared/schemas.ts`
- Add `saveProductInputSchema`, `deleteProductInputSchema`, `saveProductTestimonialInputSchema`, and `deleteProductTestimonialInputSchema` after current content/blog schemas at `src/features/admin/shared/schemas.ts:148` and `185`.
- Add exported TypeScript types near `src/features/admin/shared/schemas.ts:205`.
- Extend `adminCreateUser` input shape to include optional email, business name, country, currency, and admin flag only if the existing clients UI needs these fields.

#### `src/features/admin/server/products.ts` (NEW FILE)
- Add admin-only Aura operations:
  - `admin.products`: list products with testimonial counts.
  - `admin.saveProduct`: create/update by id, preserving slug uniqueness through Prisma.
  - `admin.deleteProduct`: delete a product.
- Use `.entities(["Product", "ProductTestimonial"])`, `.use(requireAdmin())`, `.auth()` like `src/features/admin/server/blogPosts.ts:6`.

#### `src/features/admin/server/testimonials.ts` (NEW FILE)
- Add admin-only Aura operations:
  - `admin.productTestimonials`: list testimonials with product summary.
  - `admin.saveProductTestimonial`: create/update testimonial from name/advice/star fields plus optional product/landing flags.
  - `admin.deleteProductTestimonial`: delete testimonial.
- Use the admin guard pattern from `src/features/admin/server/siteContent.ts:11`.

#### `src/features/admin/server/createUser.ts`
- Expand the existing admin-only create user operation at `src/features/admin/server/createUser.ts:8` to accept optional email, business name, country id, currency code, and `isAdmin`.
- Preserve manual-admin-only creation; do not add any public registration operation or route.

#### `src/features/admin/server/dashboard.ts`
- Replace placeholder `totalProducts: 0` at `src/features/admin/server/dashboard.ts:44` with `ctx.db.product.count()` once the model exists.

#### `src/features/admin/index.ts`
- Export new product and testimonial admin operations near existing blog/CMS exports at `src/features/admin/index.ts:15`.

#### `src/aura.registry.ts`
- Import `@/features/admin/index` so existing admin operations register; current file only imports auth/tracking/blog at `src/aura.registry.ts:3`.
- Import new `@/features/catalog/index` and `@/features/site/index`.
- Import `@/features/notifications/index`, `@/features/requests/index`, and `@/features/journeys/index` to register operations used by existing app routes.

#### `src/lib/site-content.ts` (NEW FILE)
- Add small helpers for reading string/number/JSON values from the `site.content` map.
- Return empty/default structural values when content is missing, without embedding old marketing copy in runtime components.

#### `src/components/home/types.ts` (NEW FILE)
- Define prop types for `LandingPage`, `Hero`, `Products`, `Features`, `Benefits`, `Pricing`, `Faq`, and `SiteHeader`.
- Include reusable typed shapes for stats, services, tracking steps, FAQ rows, use cases, and testimonials.

#### `src/components/home/landing-data.ts`
- Remove runtime product/testimonial arrays.
- Either delete the file or leave only non-content type exports if any imports still need a transition point.

#### `src/app/(client)/(public)/page.tsx`
- Fetch `site.content`, `catalog.products`, and `catalog.landingTestimonials` server-side using `callAuraServer`, following the blog section pattern in `src/components/home/blog-section.tsx:18`.
- Pass content/products/testimonials into `LandingPage`.
- Keep metadata but source configurable text from server content only where Next metadata constraints allow.

#### `src/components/home/landing.tsx`
- Update `LandingPage` at `src/components/home/landing.tsx:8` to receive content/products/testimonials props.
- Pass content slices to `SiteHeader`, `Hero`, `Products`, `Features`, `Benefits`, `Pricing`, and `Faq`.

#### `src/components/home/header.tsx`
- Replace hardcoded nav/brand/contact at `src/components/home/header.tsx:2` with props from server content.

#### `src/components/home/hero.tsx`
- Replace hardcoded hero stats/copy/images at `src/components/home/hero.tsx:7` and `133` with props from server content.

#### `src/components/home/products.tsx`
- Replace static import at `src/components/home/products.tsx:3` with props from Aura catalog data.
- Remove USD conversion dependency on static `XAF_TO_USD_RATE`.
- Render empty/hidden state when no published products exist.

#### `src/components/home/features.tsx`
- Replace static `STATS`, `SERVICES`, `TRACKING_STEPS`, and `TESTIMONIALS` at `src/components/home/features.tsx:21` with props parsed from `SiteContent` and Aura testimonials.
- Preserve icon rendering through a local icon-key map.

#### `src/components/home/benefits.tsx`
- Replace static `USE_CASES` import from `landing-data.ts` with props from parsed `SiteContent`.

#### `src/components/home/faq.tsx`
- Replace static `FAQS` import from `landing-data.ts` with props from parsed `SiteContent`.

#### `src/components/home/pricing.tsx`
- Replace visible static section copy/contact values with props from parsed `SiteContent`.
- Keep the existing form behavior if no backend form operation exists.

#### `src/components/home/blog-section.tsx`
- Keep existing server-side blog fetch at `src/components/home/blog-section.tsx:18`.
- Accept section heading/body copy from `SiteContent` so the visible blog preview copy is admin-managed.

#### `src/app/(client)/(public)/produits/[slug]/page.tsx`
- Keep `generateStaticParams` at `src/app/(client)/(public)/produits/[slug]/page.tsx:9`.
- Change `generateStaticParams` to fetch `catalog.productSlugs` server-side.
- Change page body lookup at `src/app/(client)/(public)/produits/[slug]/page.tsx:15` to fetch `catalog.productBySlug`.

#### `src/components/products/ProductDetail.tsx`
- Replace imports from `landing-data.ts` at `src/components/products/ProductDetail.tsx:4` with catalog view types.
- Render product testimonials from server data.
- Remove USD conversion dependency on static exchange rate.
- Keep display labels/CTA content either from passed product data or site content props.

#### `src/app/(client)/(main)/blog/page.tsx`
- Fetch `site.content` for blog listing heading/copy while keeping existing `BlogListShell`.

#### `src/components/blog/BlogListShell.tsx`, `BlogListContent.tsx`, `BlogPostShell.tsx`, `BlogPostContent.tsx`
- Preserve existing Aura-backed blog data flow.
- Adjust type fields if `blog.posts` select needs to include `type`.

#### `src/app/(admin)/dashboard/admin/products/page.tsx` (NEW FILE)
- Add admin UI for products and testimonials using `useAuraQuery`/`useAuraMutation`, following the blog page pattern at `src/app/(admin)/dashboard/admin/blog/page.tsx:24`.
- Product form: name, slug, short/full descriptions, image URL, gallery URLs, features, price XAF, likes, sort order, published.
- Testimonial form: name, advice, star, optional product, show on landing, published.

#### `src/app/(admin)/dashboard/admin/cms/page.tsx`
- Expand `SECTION_LABELS`/`SECTION_KEYS` at `src/app/(admin)/dashboard/admin/cms/page.tsx:27` to cover landing, header/contact, hero, products section copy, services JSON, stats JSON, tracking JSON, FAQ JSON, benefits JSON, pricing/contact, and blog copy.
- Use textareas for structured JSON fields.

#### `src/app/(admin)/dashboard/admin/blog/page.tsx`
- Keep blog CRUD; only adjust invalidation keys if new public site/blog content query names are added.

#### `src/app/(admin)/dashboard/admin/clients/page.tsx`
- Keep route shell, rely on restored `AdminClientsShell`.

#### `src/components/admin-clients/AdminClientsShell.tsx` (NEW FILE)
- Implement manual client list/create UI with `admin.users` and `admin.createUser`.
- Do not expose public registration. Include fields for username, display name, password, email/business/country where supported.

#### `src/components/admin-dashboard/AdminDashboardShell.tsx` (NEW FILE)
- Implement compact dashboard summary using `admin.dashboard`.

#### `src/components/admin/AdminSidebar.tsx`, `src/components/admin/AdminMobileNav.tsx` (NEW FILES)
- Restore admin navigation used by admin layout.
- Include links for Dashboard, Suivis, Clients, Products, Blog, CMS, Paramètres.

#### `src/components/admin/AdminCardSkeleton.tsx`, `src/components/admin/AdminTableSkeleton.tsx` (NEW FILES)
- Add minimal skeleton components required by existing admin pages.

#### Missing Existing Shell Compatibility Files (NEW FILES)
- Add minimal compatibility shells for currently missing imports so typecheck can progress:
  - `src/components/admin/requests/AdminRequestsShell.tsx`
  - `src/components/admin/request-detail/AdminRequestHeaderShell.tsx`
  - `src/components/admin/request-detail/AdminRequestInfoShell.tsx`
  - `src/components/admin/request-detail/AdminRequestStatusShell.tsx`
  - `src/components/admin/request-detail/AdminRequestHistoryShell.tsx`
  - `src/components/admin/request-detail/AdminRequestShareShell.tsx`
  - `src/components/admin/request-detail/AdminRequestTrajectoryShell.tsx`
  - `src/components/admin/request-detail/AdminRequestNotificationsShell.tsx`
  - `src/components/journeys/admin/JourneyAdminPanel.tsx`
  - `src/components/journeys/client/JourneySearch.tsx`
  - `src/components/journeys/client/JourneyTrackingClient.tsx`
- Scope these to restoring missing imports only; no unrelated feature expansion.

#### `src/app/(admin)/dashboard/admin/page.tsx`
- Add Products card to `ADMIN_CARDS` near `src/app/(admin)/dashboard/admin/page.tsx:20`.

#### `src/app/sitemap.ts`
- Add dynamic product URLs by calling `catalog.products`, alongside existing dynamic blog URLs at `src/app/sitemap.ts:17`.

### Testing Strategy

- Run `npm run db:generate` after schema edits. This is generation, not dependency installation.
- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npx prisma validate` or `npm run check:all` if lint/typecheck are green enough.
- No dev server launch.
- No dependency installation.
- No test suite run is possible because `package.json:9-27` has no `test` script and no app test files were found.

### Acceptance Criteria Mapping

- [ ] AC1: Landing static runtime content moved through `SiteContent`, `site.content`, and updated home components.
- [ ] AC2: Product models, catalog operations, admin products page, `Products`, `ProductDetail`, and product route changes.
- [ ] AC3: `ProductTestimonial` model, admin testimonial operations/forms, landing testimonials and product detail testimonials.
- [ ] AC4: Existing `BlogPost` operations/admin retained; seed content and blog page copy use CMS where practical.
- [ ] AC5: `AdminClientsShell` and `admin.createUser`; no new public registration route.
- [ ] AC6: `aura.registry.ts` imports admin/catalog/site/related indexes; admin operations use `requireAdmin`.
- [ ] AC7: Validation commands exclude dev server and dependency installation.
- [ ] AC8: Validation results recorded in step 04 with exact failures if any remain.

### Risks & Considerations

- Prisma generation may touch generated client files under `src/generated/prisma`.
- Existing missing component imports are broader than the requested content feature; minimal compatibility shells are included only to avoid pre-existing compile blockers.
- Editing every marketing copy string through fixed CMS keys is more maintainable than storing opaque full-page HTML, but structured arrays will use JSON textarea fields in the existing CMS page.
- The product detail route keeps `generateStaticParams`; products added after build may depend on Next dynamic route behavior and deployment cache settings.

---
## Step Complete
**Status:** ✓ Complete
**Files planned:** 40+
**Tests planned:** 0 new test files; validation via lint, typecheck, Prisma validate
**Next:** step-03-execute.md

---

## Implementation Plan Addendum: Rewrite Admin Tracking Management

### Overview

Keep public/client tracking available, but remove the admin-side tracking management shortcuts and rebuild the admin experience around a complete shipment + journey workflow. Use `Request` for colis/package data and `Journey/JourneyStop/JourneyEvent` for the operational trajet, with Mapbox place search and strict one-mode transport.

### Prerequisites

- [ ] Do not install dependencies or launch a server.
- [ ] Keep `.env` usage intact; validation may require Prisma to read it.
- [ ] Use Mapbox GL JS patterns confirmed through Context7: GeoJSON line sources/layers, markers, and animated point updates.

### File Changes

#### `src/features/admin/shared/tracking-schemas.ts` (NEW FILE)
- Create dedicated schemas for rewritten admin tracking instead of extending legacy `schemas.ts:1-240`.
- Export schemas/types for list params, create shipment, update shipment, and request status note.
- Include package fields required by user: `packageWeightKg`, `packageVolumeM3`, `packageCount`, `productDescription`, recipient/contact/address, and `transportMode`.

#### `src/features/admin/server/tracking.ts` (NEW FILE)
- Add `admin.trackingDashboard` replacing dashboard-specific tracking metrics from `dashboard.ts:1-49`.
- Add `admin.trackingShipments` replacing legacy list from `requests.ts:1-44`.
- Add `admin.trackingShipment` replacing stub detail dependencies from request detail components.
- Add `admin.createShipment` replacing `createRequest.ts:1-58` with full colis fields and initial status event/notification.
- Add `admin.updateShipment` for admin edits to colis/recipient/admin notes/status basics.
- Add `admin.addShipmentStatusNote` for customs/issues/status notes that are not route stop confirmations.
- Ensure every operation uses `requireAdmin()` like existing admin patterns in `users.ts:1-49`.

#### `src/features/admin/index.ts`
- Remove exports for legacy admin management operations identified in `index.ts:1-3`: `adminUpdateStatus`, `adminSaveTrajectory`, `adminControlStepTimer`.
- Remove `adminCreateRequest`/`adminRequests` exports from legacy files and export the new tracking operations.
- Keep unrelated admin exports for users/products/blog/CMS/settings.

#### `src/features/admin/server/createRequest.ts`
- Delete; replaced by `src/features/admin/server/tracking.ts`.

#### `src/features/admin/server/requests.ts`
- Delete; replaced by `src/features/admin/server/tracking.ts`.

#### `src/features/admin/server/updateStatus.ts`
- Delete; replaced by `admin.addShipmentStatusNote` and journey status operations.

#### `src/features/admin/server/saveTrajectory.ts`
- Delete; admin trajectory management must use `JourneyStop`, not legacy `TrajectoryStep`.

#### `src/features/admin/server/stepTimer.ts`
- Delete; automatic movement must be based on journey stops/ETAs, not legacy step timers.

#### `src/features/journeys/shared/schemas.ts`
- Strengthen `journeyIssueSchema` from lines 107-110 with problem type/title/visibility fields.
- Strengthen `journeyGeocodeSchema` from lines 112-115 to require transport type for admin searches.

#### `src/features/journeys/server/geocodeJourneyPlace.ts`
- Replace simple hint-only search from lines 23-32 with airport/port-aware Mapbox search.
- Return only selected real place candidates with coordinates; filter labels/categories by allowed node keywords for `AERIEN` or `MARITIME`.

#### `src/features/journeys/server/adminSavePlan.ts`
- Enforce request transport mode compatibility (`AVION` -> `AERIEN`, `BATEAU` -> `MARITIME`) using the request loaded at lines 22-29.
- Reject stops that are not Mapbox-selected port/airport nodes.
- Keep existing draft/planned mutation behavior from lines 33-145, but use stronger validation and request sync.

#### `src/features/journeys/server/adminPublish.ts`
- Sync `Request.latestStatusMessage` when publishing at lines 40-48.
- Ensure public share path uses `/voyage/{publicToken}` through notification helper.

#### `src/features/journeys/server/adminStart.ts`
- Sync `Request.status = EN_COURS` and latest message when journey starts at lines 41-59.

#### `src/features/journeys/server/adminConfirmNextStop.ts`
- Sync `Request.status = TERMINE` on final arrival and `EN_COURS` otherwise at lines 39-64.

#### `src/features/journeys/server/adminJourneyState.ts`
- Extend problem operation from lines 76-105 to accept issue type/title/message and sync request status/problem type.
- Sync request pause/resume status in pause/resume operations from lines 19-74.

#### `src/components/admin/AdminSidebar.tsx`
- Rewrite visual admin navigation from lines 1-43 into an operational dashboard shell nav, with labels focused on tracking, clients, content, settings.

#### `src/components/admin/AdminMobileNav.tsx`
- Rewrite mobile nav from lines 1-40 for the new admin layout and keep touch targets simple.

#### `src/app/(admin)/dashboard/admin/layout.tsx`
- Replace current thin layout from lines 1-38 with a more complete admin workspace: sidebar, top header, content rail, mobile nav.

#### `src/components/admin-dashboard/AdminDashboardShell.tsx`
- Replace current four-card dashboard from lines 1-57 with tracking metrics, urgent issues, recent shipments, and links to create/manage shipments using `admin.trackingDashboard`.

#### `src/app/(admin)/dashboard/admin/page.tsx`
- Replace current quick-card page from lines 1-60 with rewritten dashboard content and fewer generic cards.

#### `src/app/(admin)/dashboard/admin/requests/page.tsx`
- Replace current request list page from lines 1-26 with dedicated tracking shipments page using new shell.

#### `src/components/admin/tracking/AdminShipmentsShell.tsx` (NEW FILE)
- Create full list/table with search/status filters, package details, client, destination, journey status, and actions.
- Use `admin.trackingShipments`.

#### `src/app/(admin)/dashboard/admin/requests/nouveau/page.tsx`
- Replace current create form from lines 1-232 with a complete colis creation workflow.
- Include existing client selector, inline manual client creation, recipient fields, package count/weight/volume/description, transport mode, and admin notes.
- Use `admin.users`, `admin.createUser`, `catalog.countries`, and `admin.createShipment`.

#### `src/app/(admin)/dashboard/admin/requests/[id]/page.tsx`
- Replace stub-composed detail page from lines 1-40 with a single dedicated detail component.

#### `src/components/admin/tracking/AdminShipmentDetail.tsx` (NEW FILE)
- Create admin shipment detail with package summary, client/recipient, issue/status notes, journey summary, timeline, and action link to trajet editor.
- Use `admin.trackingShipment`, `admin.updateShipment`, and `admin.addShipmentStatusNote`.

#### `src/app/(admin)/dashboard/admin/requests/[id]/journey/page.tsx`
- Keep route path but render the new dedicated journey workspace instead of stub panel from lines 1-13.

#### `src/components/journeys/admin/JourneyAdminPanel.tsx`
- Rewrite stub from lines 1-17 into complete admin trajet editor:
  - Load shipment + journey data.
  - Vehicle/vessel name and speed settings.
  - Stop list with Mapbox search per stop.
  - Enforce one mode: airports only for air, ports only for sea.
  - Save/publish/start/confirm next/pause/resume/report issue/update ETA.
  - Display public client tracking link after publish.

#### `src/components/journeys/shared/route-utils.ts` (NEW FILE)
- Add reusable helpers for journey stop ordering, line features, interpolation between stops, status labels, and transport conversion.
- Used by admin and client journey map components.

#### `src/components/journeys/admin/JourneyAdminMap.tsx` (NEW FILE)
- Create dedicated admin Mapbox preview using `react-map-gl/mapbox`, markers, route line source/layer, and selected stop highlighting.

#### `src/components/journeys/client/JourneySearch.tsx`
- Replace stub from lines 1-12 with a real request-number lookup form using `journey.publicLookup`, then navigate to `/voyage/{token}`.

#### `src/components/journeys/client/JourneyTrackingClient.tsx`
- Replace stub from lines 1-17 with full client journey view using `journey.publicGet`, polling, status cards, package route/timeline, issue/customs display, and Mapbox movement.

#### `src/components/journeys/client/JourneyClientMap.tsx` (NEW FILE)
- Create client Mapbox route map with line layer, port/airport markers, and automatic vehicle/vessel marker movement from current stop to next ETA.

#### `src/app/(client)/(public)/voyage/[token]/page.tsx`
- Keep public token route but rely on rewritten client component.

#### `src/app/(client)/(public)/voyage/page.tsx`
- Keep search route but rely on rewritten lookup component.

#### `src/app/(client)/(public)/tracking/[id]/page.tsx`
- Keep existing client tracking route available as requested; do not remove client tracking.

### Testing Strategy

- Run `npm run db:generate` after schema/client-affecting changes; if sandbox blocks Prisma cache writes, rerun with escalation and `.env` available.
- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npx prisma validate` or `npm run check:all` if feasible without launching a server.
- Manual static audit with `rg` to verify legacy admin operation names are removed from exports/usages: `admin.saveTrajectory`, `admin.updateStatus`, `admin.controlStepTimer`, `admin.createRequest`, `admin.requests`.

### AC Mapping

- [ ] AC9: Satisfied by keeping `src/app/(client)/(public)/tracking/[id]/page.tsx` and rebuilding admin pages/components.
- [ ] AC10: Satisfied by `tracking-schemas.ts`, `tracking.ts`, and `requests/nouveau/page.tsx`.
- [ ] AC11: Satisfied by `journey.geocode`, `adminSavePlan`, `JourneyAdminPanel`, and `JourneyAdminMap`.
- [ ] AC12: Satisfied by journey server operations and admin journey controls.
- [ ] AC13: Satisfied by `JourneyTrackingClient`, `JourneyClientMap`, and `/voyage` pages.
- [ ] AC14: Satisfied by rewritten admin layout/sidebar/mobile nav/dashboard/list/detail/editor pages.

### Risks & Considerations

- Mapbox Geocoding can vary by label/category; server-side keyword filtering will enforce airport/port-only labels, but admins may need to type specific terminal names.
- Existing Prisma generated client may be stale because product/testimonial models were added earlier; validation requires `prisma generate`.
- Public `/tracking/[id]` remains for compatibility because the user explicitly asked to keep client tracking.

---
## Step Complete
**Status:** ✓ Complete
**Files planned:** 31
**Tests planned:** 0 dedicated tests; validation via Prisma, lint, typecheck, and static usage audit
**Next:** step-03-execute.md
