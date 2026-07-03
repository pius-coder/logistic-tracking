# APEX Task: 05-dynamic-admin-content-management

**Created:** 2026-07-02T20:53:03Z
**Task:** Update landing page, product, and blog to be dynamic server-side using Aura framework; manage content through an admin dashboard; admin adds clients manually with no client registration; add products and blog articles; remove hardcoded data and static elements; manage testimonials for landing page and product details with form fields name, advice, star; do not launch a server or install dependencies.

---

## Configuration

| Flag | Value |
|------|-------|
| Auto mode (`-a`) | true |
| Save mode (`-s`) | true |
| Economy mode (`-e`) | false |
| Branch mode (`-b`) | true |
| Interactive mode (`-i`) | false |
| Branch name | feat/05-dynamic-admin-content-management |

---

## User Request

```
 -s -b -t -a -x Update all the laning page, product, blog to setup it ynimic server side an using the aura framework manageable through an admin page to add client manually no client registration, add some product, an blog articles remove all hardcided data, all static elemnt to be managed by the amin in their dashboard, also for testimonial on lading page and product details (admin can add it manually for testimonial (form with name, advice, star) dint launch a server or install eps and installation instance id running
```

---

## Acceptance Criteria

- [ ] AC1: Landing page content that is currently static is loaded from server-side/admin-managed data where practical.
- [ ] AC2: Products are persisted/admin-manageable and no longer sourced from hardcoded `PRODUCTS`; product details use server-side data while keeping `generateStaticParams`.
- [ ] AC3: Product testimonials/reviews are admin-manageable with name, advice/comment, and star rating fields, and render on landing/product detail surfaces.
- [ ] AC4: Blog articles remain admin-manageable through Aura/Prisma and include seeded sample articles; hardcoded blog display copy is managed or centralized through admin-managed content.
- [ ] AC5: Clients are added manually by admins only; no public client registration is introduced.
- [ ] AC6: Aura admin operations are registered and protected by admin auth.
- [ ] AC7: No project dependencies are installed and no dev server is launched.
- [ ] AC8: Available non-server validation commands pass or failures are reported with exact blockers.

## Clarifications

- User later clarified: keep `generateStaticParams`.

---

## Progress

| Step | Status | Timestamp |
|------|--------|-----------|
| 00-init | ⏸ Pending | |
| 01-analyze | ✓ Complete | 2026-07-03T04:32:47Z |
| 02-plan | ✓ Complete | 2026-07-03T04:40:33Z |
| 03-execute | ⏳ In Progress | 2026-07-03T04:40:41Z |
| 04-validate | ⏸ Pending | |
