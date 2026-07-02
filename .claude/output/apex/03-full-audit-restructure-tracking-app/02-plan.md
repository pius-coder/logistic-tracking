# Step 02: Plan

**Task:** Full audit and restructure tracking app - remove AI features, setup admin with blog, ensure all redirects work, verify all features
**Started:** 2026-07-01T15:30:55Z

---

## Implementation Plan

### Overview
Fix broken links and redirects, remove dead admin nav cards, fix footer URLs, add custom not-found page, and add missing admin request/client detail pages to ensure all features work coherently.

---

### File Changes

#### Phase 1: Fix Admin Dashboard Nav Cards

##### `src/app/(admin)/dashboard/admin/page.tsx`
- Remove 5 dead nav cards: `/dashboard/admin/produits`, `/dashboard/admin/categories`, `/dashboard/admin/paiements`, `/dashboard/admin/avis`, `/dashboard/admin/pays`
- These routes have no page.tsx files and lead to 404s
- Keep only: requests, clients, blog, cms, parametres (5 cards matching the sidebar)

##### `src/components/admin/AdminMobileNav.tsx`
- Verify mobile nav only shows existing admin routes

#### Phase 2: Fix Footer Broken Links

##### `src/components/layout/AppLayout.tsx`
- Fix `/conditions-general` → `/conditions-generales` (missing 'es') at line ~646
- Remove `/catalogue` link (page does not exist) from footer menu
- Keep: Accueil, Suivi, Blog
- Fix `/tracking` link → redirect to `/` (tracking search page doesn't exist at root, should go to landing page hero)

#### Phase 3: Add Custom 404 Page

##### `src/app/not-found.tsx` (NEW FILE)
- Create French 404 page with "Page non trouvée" message
- Include link back to home page
- Follow same design language as error.tsx

#### Phase 4: Add Admin Missing Detail Pages (Stubs)

##### `src/app/(admin)/dashboard/admin/requests/[id]/page.tsx` (NEW FILE)
- Create route for request detail
- Reuse existing `AdminRequestHeaderShell`, `AdminRequestInfoShell`, etc.

##### `src/app/(admin)/dashboard/admin/clients/[id]/page.tsx` (NEW FILE)
- Create route for client detail
- Reuse existing `admin.userById` operation

#### Phase 5: Verify All Redirects

- Proxy.ts: protected paths redirect to `/login?redirect=...` ✅
- Proxy.ts: auth pages redirect to `/dashboard` if session exists ✅
- Admin layout: not admin → `/dashboard`, not logged in → `/login` ✅
- Main layout: onboarding incomplete → `/onboarding` ✅
- Onboarding layout: onboarding complete → `/` ✅
- Logout page: → `/login` ✅

All redirects are already coherent. No changes needed.

#### Phase 6: Verify Blog System

- Landing page: BlogSection renders ✅
- Blog list: `/blog` page works ✅
- Blog detail: `/blog/[slug]` page works ✅
- Admin CRUD: `/dashboard/admin/blog` page works ✅
- No changes needed.

---

### Acceptance Criteria Mapping
- [x] AC1: AI features removed (already done)
- [x] AC2: Blog system functional (already working)
- [ ] AC3: All admin routes redirect correctly
- [ ] AC4: Dead admin nav links removed
- [ ] AC5: All redirects use correct Next.js 16 patterns
- [x] AC6: Async params API compliance (already correct)
- [x] AC7: Tracking features work for auth/public users (already correct)
- [x] AC8: Landing page renders with blog section (already correct)
- [x] AC9: Auth flow works (already correct)
- [ ] AC10: No broken links or dead code
- [ ] AC11: Custom 404 page for better UX

---

## Step Complete
**Status:** ✓ Complete
**Files planned:** 5 (2 modify, 3 new)
**Next:** step-03-execute.md
