# Step 01: Analyze

**Task:** Update landing page, product, and blog to be dynamic server-side using Aura framework; manage content through an admin dashboard; admin adds clients manually with no client registration; add products and blog articles; remove hardcoded data and static elements; manage testimonials for landing page and product details with form fields name, advice, star; do not launch a server or install dependencies.
**Started:** 2026-07-02T20:53:03Z

---

## Context Discovery

### Search Keywords

- Domain: landing, products, product detail, blog, testimonials, clients, admin dashboard, CMS.
- Technical: Aura operations, Prisma models, server components, App Router, `callAuraServer`, `useAuraQuery`, `useAuraMutation`.
- Actions: remove hardcoded data, add admin-managed content, add products/blog articles, manual client creation, keep `generateStaticParams`.

### Codebase Context

| File | Lines | Contains |
|------|-------|----------|
| `package.json` | 9-27 | Scripts: `lint`, `typecheck`, `check:all`, Prisma and Aura CLI commands. No `test` script. |
| `package.json` | 28-77 | Next 16.2.6, React 19.2.4, Prisma 7.8.0, Zod, TanStack Query, shadcn/Base UI/Hugeicons/lucide. |
| `README.md` | 24-49 | Local Aura documentation: Rails-like meta-framework over Next.js 16; server business code, typed operations, shared schemas/forms. |
| `README.md` | 66-96 | Aura layers: server runtime, domain operations, client hooks/forms, generated UI/pages. |
| `prisma/schema.prisma` | 74-130 | Aura auth models: `AuraUser`, credentials, sessions. |
| `prisma/schema.prisma` | 437-485 | Existing `AppSettings`, `SiteContent`, `BlogPost`, `AdminAccessKey`; no product/testimonial models. |
| `src/aura.registry.ts` | 3-5 | Only imports Aura auth, tracking, and blog feature modules. Admin operations are exported from `features/admin` but not registered here. |
| `src/aura/server/operation.ts` | 200-245 | Aura operation builder registers query/mutate operations with access, schemas, entities, and handler. |
| `src/aura/server/call.ts` | 21-31 | RSC/server components call Aura operations through `callAuraServer`. |
| `src/aura/client/hooks.ts` | 58-81, 94-181 | Client uses `useAuraQuery` and `useAuraMutation`, with entity/query invalidation and router refresh. |

### Public Pages

| File | Lines | Contains |
|------|-------|----------|
| `src/app/(client)/(public)/page.tsx` | 5-13 | Static landing metadata; renders `LandingPage` and server-rendered `BlogSection`. |
| `src/components/home/landing.tsx` | 1-22 | Landing composition: `SiteHeader`, `Hero`, `Products`, `Features`, `Benefits`, `Pricing`, `Faq`, blog section. |
| `src/components/home/header.tsx` | 2-8, 14-35, 41-70 | Hardcoded nav labels, brand, and phone number. |
| `src/components/home/hero.tsx` | 7-12, 31-35, 133-175 | Hardcoded hero stats, image URLs, badge, headline, and body copy. |
| `src/components/home/features.tsx` | 21-162 | Hardcoded stats, services, tracking mock steps, and landing testimonials. |
| `src/components/home/features.tsx` | 1123-1187 | Renders static stats and static `TESTIMONIALS`. |
| `src/components/home/landing-data.ts` | 1-15, 17-92 | Static asset paths, use cases, and FAQ entries. |
| `src/components/home/landing-data.ts` | 94-294 | Static exchange rate, products, gallery, and product reviews. |
| `src/components/home/products.tsx` | 3, 22-143 | Imports static `PRODUCTS` and `XAF_TO_USD_RATE`; renders product cards. |
| `src/app/(client)/(public)/produits/[slug]/page.tsx` | 9-17 | Has `generateStaticParams` from static `PRODUCTS`; product page does array lookup and `notFound()`. User clarified to keep static params. |
| `src/components/products/ProductDetail.tsx` | 4-5, 67-293 | Imports static product type/rate; renders product details and product reviews from `product.reviews`. |
| `src/components/home/blog-section.tsx` | 18-27 | Landing blog preview already fetches published blog posts server-side through `callAuraServer("blog.posts")`. |
| `src/app/(client)/(main)/blog/page.tsx` | 5-24 | Blog listing has hardcoded metadata/header copy but renders `BlogListShell`. |
| `src/app/(client)/(main)/blog/[slug]/page.tsx` | 27-43 | Blog metadata fetches `blog.postBySlug` server-side. |
| `src/features/blog/server/blogPosts.ts` | 5-35 | Public Aura operations `blog.posts` and `blog.postBySlug` query `BlogPost`. |
| `src/app/sitemap.ts` | 17-30 | Sitemap fetches dynamic blog URLs through `callAuraServer("blog.posts")`. |

### Admin And Manual Content

| File | Lines | Contains |
|------|-------|----------|
| `src/app/(admin)/dashboard/admin/layout.tsx` | 4-15 | Admin layout imports missing nav components, calls `auth.me`, redirects non-admins/anonymous users. |
| `src/app/(admin)/dashboard/admin/page.tsx` | 20-25, 28-58 | Admin cards include requests, clients, blog, CMS, settings. Imports missing dashboard shell/skeleton. |
| `src/app/(admin)/dashboard/admin/cms/page.tsx` | 27-63 | Existing CMS supports a small fixed set of sections/keys. |
| `src/app/(admin)/dashboard/admin/cms/page.tsx` | 65-214 | CMS uses `admin.listSiteContent`, `admin.saveSiteContent`, and `admin.publishAllSiteContent`. |
| `src/features/admin/server/siteContent.ts` | 11-97 | Admin-only Aura operations list/save/publish `SiteContent`. |
| `src/features/admin/shared/schemas.ts` | 148-164 | `SiteContent` save/publish Zod schemas. |
| `src/app/(admin)/dashboard/admin/blog/page.tsx` | 24-35, 70-90, 108-170 | Blog CRUD UI with dialog form: title, slug, HTML content, excerpt, image URL, tags, type, author, SEO, published toggle. |
| `src/features/admin/server/blogPosts.ts` | 6-34 | Admin blog list operation. |
| `src/features/admin/server/saveBlogPost.ts` | 7-37 | Admin blog save operation sanitizes HTML; update branch never sets `publishedAt` because `id` is truthy. |
| `src/features/admin/server/deleteBlogPost.ts` | 6-15 | Admin blog delete operation. |
| `src/app/(admin)/dashboard/admin/clients/page.tsx` | 1-19 | Clients page imports missing `AdminClientsShell` and `AdminTableSkeleton`. |
| `src/features/admin/server/createUser.ts` | 8-38 | Admin-only client creation operation creates `AuraUser` and password credential. |
| `src/features/admin/server/users.ts` | 7-49 | Admin-only paginated user list with search and request count. |
| `src/app/(admin)/dashboard/admin/parametres/page.tsx` | 11-57 | Existing settings form for WhatsApp and Evolution API instance ID. |
| `src/features/admin/server/settings.ts` | 7-30 | Admin-only settings get/update operations. |

### Current Missing Components

- `src/app/(admin)/dashboard/admin/layout.tsx:4-5` imports `@/components/admin/AdminSidebar` and `AdminMobileNav`, but no `src/components/admin*` files exist.
- `src/app/(admin)/dashboard/admin/page.tsx:4-5` imports `AdminDashboardShell` and `AdminCardSkeleton`, also absent.
- `src/app/(admin)/dashboard/admin/requests/page.tsx:3-4` imports `AdminRequestsShell` and `AdminTableSkeleton`, absent.
- `src/app/(admin)/dashboard/admin/clients/page.tsx:2-3` imports `AdminClientsShell` and `AdminTableSkeleton`, absent.
- Search found no tracked `src/components/admin`, `src/components/admin-dashboard`, or `src/components/admin-clients` files.

### Patterns Observed

- Aura domain operations live under `src/features/<domain>/server/*` and use `defineOperationFn(...).query()/mutate().params()/input().entities().use(requireAdmin()).auth()/public().handler(...)`.
- Public server components call Aura directly through `callAuraServer` and pass initial data into client shells when live refresh is needed.
- Client admin forms commonly use local `useState` plus `useAuraMutation`; the reusable `useAuraForm` exists in `src/aura/client/form.ts:25-72`.
- Existing admin content workflow separates draft and published content in `SiteContent`.
- Existing blog content is persisted in `BlogPost`, seeded with five published posts in `prisma/seed.ts:186-452`.
- Current public product/testimonial content is not persisted; it is hardcoded in `landing-data.ts` and `features.tsx`.
- No public registration route exists in the current `src/app` tree; search only found admin `createUser` and login/logout flows.

### Documentation Insights

- Context7 lookup for `Aura` returned unrelated public projects; this repo’s Aura framework is local and documented in `README.md`.
- Context7 resolved Next.js to `/vercel/next.js`; docs fetch was interrupted by the user after clarifying "keep static Params". No additional external docs were used after that interruption.

### Validation Context

- Available scripts: `npm run lint`, `npm run typecheck`, `npm run check:all`, `npm run build`, Prisma commands in `package.json:9-27`.
- No app-local `test` script or test files were found.
- User explicitly requested no dependency installation and no server launch.

## Scope Addendum: Admin Tracking Rebuild

The user clarified that the public/client tracking surface must be kept, but admin-side tracking management must be removed and recreated without legacy UI shortcuts.

### Documentation

- Context7 resolved Mapbox GL JS to `/mapbox/mapbox-gl-js`.
- Mapbox docs confirm the current primitives needed for this implementation: initialize a map with `new mapboxgl.Map`, add GeoJSON line sources/layers for routes, add markers/popups for selected points, update a point source during animation, and fit/select rendered place features. The codebase already has `mapbox-gl` and `react-map-gl` dependencies in `package.json:47-48`.

### Data Model

| File | Lines | Contains |
|------|-------|----------|
| `prisma/schema.prisma` | 27-30 | `TransportMode` allows only `AVION` or `BATEAU`. |
| `prisma/schema.prisma` | 43-50 | `RequestProblemType` includes customs (`DOUANE`) plus police, documentation, logistics delay, payment, and other issue types. |
| `prisma/schema.prisma` | 237-269 | `Request` stores client, package count, weight kg, volume m3, product description, transport mode, status, issue type, notes, notifications, and one optional journey. |
| `prisma/schema.prisma` | 275-299 | Legacy `TrajectoryStep` model stores old admin tracking steps and timers. |
| `prisma/schema.prisma` | 334-397 | `Journey` model stores vehicle/vessel name, transport type (`MARITIME`/`AERIEN`), journey status, speed, published/started/completed timestamps, latest/probem messages. |
| `prisma/schema.prisma` | 399-418 | `JourneyStop` stores Mapbox place id, coordinates, stop type, ETA, reached timestamp, and note. |
| `prisma/schema.prisma` | 420-434 | `JourneyEvent` stores admin/client visible timeline events. |

### Existing Admin Tracking Management To Replace

| File | Lines | Contains |
|------|-------|----------|
| `src/app/(admin)/dashboard/admin/requests/page.tsx` | 1-26 | Admin request list shell entry. |
| `src/components/admin/requests/AdminRequestsShell.tsx` | 1-42 | Minimal legacy list UI. |
| `src/app/(admin)/dashboard/admin/requests/nouveau/page.tsx` | 1-232 | Minimal create request form; does not capture weight, volume, product description, full recipient/cargo details. |
| `src/app/(admin)/dashboard/admin/requests/[id]/page.tsx` | 1-40 | Detail page composed of stub components. |
| `src/components/admin/request-detail/AdminRequest*.tsx` | multiple | Stub/detail cards for header, info, status, share, history, notifications, trajectory. |
| `src/app/(admin)/dashboard/admin/requests/[id]/journey/page.tsx` | 1-13 | Journey page passes request id/token into stub panel. |
| `src/components/journeys/admin/JourneyAdminPanel.tsx` | 1-17 | Stub admin trajectory panel. |
| `src/features/admin/server/createRequest.ts` | 1-58 | Admin create request does not persist package weight/volume/product description. |
| `src/features/admin/server/requests.ts` | 1-44 | Admin requests list returns basic request records. |
| `src/features/admin/server/updateStatus.ts` | 1-58 | Legacy request status operation points to `/tracking/{request.id}`. |
| `src/features/admin/server/saveTrajectory.ts` | 1-67 | Legacy trajectory operation writes `TrajectoryStep`. |
| `src/features/admin/server/stepTimer.ts` | 1-116 | Legacy timer operation controls `TrajectoryStep` timers. |

### Existing Journey Operations

| File | Lines | Contains |
|------|-------|----------|
| `src/features/journeys/shared/schemas.ts` | 3-15 | Journey transport/status/stop/speed enums. |
| `src/features/journeys/shared/schemas.ts` | 16-89 | Save plan validation for stops, sequence order, ETA ordering. |
| `src/features/journeys/server/adminSavePlan.ts` | 13-145 | Admin save plan creates/updates `Journey`, replaces stop order, writes events and notifications. |
| `src/features/journeys/server/adminPublish.ts` | 8-65 | Admin publishes a draft journey. |
| `src/features/journeys/server/adminStart.ts` | 8-68 | Admin starts a planned journey and marks departure reached. |
| `src/features/journeys/server/adminConfirmNextStop.ts` | 8-78 | Admin confirms next unreached stop and completes final destination. |
| `src/features/journeys/server/adminJourneyState.ts` | 19-105 | Admin pause, resume, and report problem operations. |
| `src/features/journeys/server/adminUpdateEta.ts` | 8-66 | Admin updates ETA with event/notification. |
| `src/features/journeys/server/geocodeJourneyPlace.ts` | 15-52 | Public Mapbox geocode operation with mode hint (`port` or `airport`). |
| `src/features/journeys/server/publicGetJourney.ts` | 8-24 | Public journey fetch hides drafts. |
| `src/features/journeys/server/publicLookup.ts` | 6-26 | Public lookup by request number. |

### Client Tracking To Keep

| File | Lines | Contains |
|------|-------|----------|
| `src/app/(client)/(public)/tracking/[id]/page.tsx` | 1-116 | Existing public/auth fallback tracking route using `TrackingPageClient`. User says to keep client tracking. |
| `src/components/tracking/TrackingPageClient.tsx` | 1-113 | Polling client wrapper around existing tracking map/drawer. |
| `src/components/tracking/DhlTrackingMap.tsx` | 31-36, 839-856 | Existing `react-map-gl/mapbox` map surface. |
| `src/components/tracking/useVehiclePosition.ts` | 1-156 | Existing automatic movement calculation across steps using reached timestamps/timers. |
| `src/app/(client)/(public)/voyage/page.tsx` | 1-4 | Stub journey search page. |
| `src/app/(client)/(public)/voyage/[token]/page.tsx` | 1-13 | Stub journey public page. |
| `src/components/journeys/client/JourneySearch.tsx` | 1-12 | Stub search form. |
| `src/components/journeys/client/JourneyTrackingClient.tsx` | 1-17 | Stub public journey client. |

### Updated Acceptance Criteria

- [ ] AC9: Keep the client/public tracking experience available, but replace admin tracking management rather than reusing legacy admin trajectory/timer UI.
- [ ] AC10: Admin can manually create/select a client, create a colis with recipient, weight kg, volume m3, package count, description, and transport method.
- [ ] AC11: Admin trajectory editor uses Mapbox real-place search and stores only airport nodes for air journeys or port nodes for maritime journeys; no mixed boat/plane journey is exposed.
- [ ] AC12: Admin stores aircraft/vessel name, speed details, ETA per stop, notes, and can publish/start/pause/resume/report issues/confirm next stop/update ETA.
- [ ] AC13: Client journey view shows route, nodes, timeline, status, issue/customs states, and automatic movement from stop to stop.
- [ ] AC14: Admin dashboard layout is rewritten into a complete operational dashboard with dedicated tracking components for non-developer admins.

## Inferred Acceptance Criteria

- [ ] AC1: Landing page content that is currently static is loaded from server-side/admin-managed data where practical.
- [ ] AC2: Products are persisted/admin-manageable and no longer sourced from hardcoded `PRODUCTS`; product details use server-side data while keeping `generateStaticParams`.
- [ ] AC3: Product testimonials/reviews are admin-manageable with name, advice/comment, and star rating fields, and render on landing/product detail surfaces.
- [ ] AC4: Blog articles remain admin-manageable through Aura/Prisma and include seeded sample articles; hardcoded blog display copy is managed or centralized through admin-managed content.
- [ ] AC5: Clients are added manually by admins only; no public client registration is introduced.
- [ ] AC6: Aura admin operations are registered and protected by admin auth.
- [ ] AC7: No project dependencies are installed and no dev server is launched.
- [ ] AC8: Available non-server validation commands pass or failures are reported with exact blockers.
