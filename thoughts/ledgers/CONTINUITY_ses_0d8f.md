---
session: ses_0d8f
updated: 2026-07-03T08:21:35.552Z
---

# Session Summary

## Goal
Map the complete architecture of the tracking and journey systems — how `tracking/[id]/page.tsx` fetches data, integrates `DhlTrackingDrawer`, and how the new journey system's types, schemas, and `journey.publicGet` operation overlap with the older tracking components.

## Constraints & Preferences
- Use exact file paths and identifiers throughout
- Focus only on the files listed — no irrelevant context
- Preserve all details needed to continue working with these two systems (old tracking vs. new journey)

## Progress
### Done
- [x] **Read `tracking/[id]/page.tsx`** — Server component that:
  - Calls `callAuraServer({ operationName: "tracking.getByRequestPublic", params: { requestId } })` for metadata and initial data
  - Wraps `<TrackingPageClient initialData={data} ... operationName="tracking.getByRequestPublic">` in `<Suspense fallback={<TrackingSkeleton />}>`
  - Converts `callAuraServer` result's `TrajectoryStep[]` to fit `TrackingData` type (maps `stepType` → `legMode` via helper, ensures lat/lng fallback `0,0`)
  - The `generateMetadata` calls the same operation but only reads `requestNumber`
- [x] **Read `TrackingPageClient.tsx`** — Client component that:
  - Takes `initialData`, `requestId`, `mapboxToken`, `backHref`, `operationName` (can be `"tracking.getByRequest"` or `"tracking.getByRequestPublic"`)
  - Polls via `useAuraQuery` with `refetchInterval: 15_000` (15s) using the given `operationName`
  - Renders `<DhlTrackingMap>` and `<DhlTrackingDrawer>` side by side
  - Manages `selectedStepId` state passed to both map and drawer
- [x] **Read `DhlTrackingDrawer.tsx`** (1439 lines) — Heavy client drawer with:
  - Props: `steps`, `events`, `requestNumber`, `status`, `problemType`, `latestMessage`, `requestId`, `selectedStepId`, plus optional journey details: `customerName`, `recipientName`, `originName`, `destinationName`, and `setOpen` flag
  - Three tabs: **"Étapes"** (step timeline), **"Événements"** (event feed with Détails sub-link to `/request/{id}`), **"Détails"** (request/journey info)
  - Step cards show icons by `stepType`: `DEPART` → MapPin, `ESCALE` → Navigation, `DESTINATION` → MapPinned
  - Leg icons between steps: `TRUCK` → Truck, `PLANE` → Plane, `BOAT` → Ship
  - Timers displayed when `timerDurationHours` exists with pause/play states
  - Uses `getRequestStatusLabel`, `getTrajectoryStepTypeLabel`, `getRequestProblemLabel` from `@/lib/displayLabels`
- [x] **Read `DhlTrackingMap.tsx`** — Client map with:
  - Props: `steps`, `mapboxToken`, `transportMode`, `requestId`, `backHref`, `onRefresh`, `onStepSelect`
  - Uses `useMultiModalRoute` to build route geometry per leg mode (TRUCK→Mapbox Directions API, PLANE/BOAT→great-circle via `@turf/great-circle`)
  - Uses `useVehiclePosition` for animated vehicle marker interpolation
  - Shows colored route layers (completed/current/future) and step markers
- [x] **Read `TrackingSkeleton.tsx`** — Simple 36-line animated pulse skeleton mimicking the map + drawer layout
- [x] **Read `useMultiModalRoute.ts`** — Custom hook that builds `RouteLeg[]` from waypoints + leg modes, with retry logic and Mapbox Directions for TRUCK legs
- [x] **Read `useVehiclePosition.ts`** — Custom hook computing `VehicleState` (lat/lng/heading/remainingMs) from route legs and step timers using `@turf/along`, `@turf/length`, `@turf/bearing`
- [x] **Read `CopyMessageDialog.tsx`** — Simple dialog for copying WhatsApp message text
- [x] **Read `useSimpleGeocoder.ts`** — Debounced geocoding hook calling `"tracking.geocode"` operation
- [x] **Read `JourneyDto` type** in `src/features/journeys/shared/types.ts`:
  ```ts
  JourneyDto = {
    id, requestId, requestNumber, publicToken, customerName, recipientName,
    recipientPhone, transportMode: "AVION" | "BATEAU", productDescription,
    packageWeightKg, packageVolumeM3, packageCount,
    originCountry, destinationCountry: { id, name, iso2 } | null,
    vehicleName, transportType: JourneyTransportType, status: JourneyStatus,
    averageSpeed, speedUnit, publishedAt, startedAt, completedAt,
    latestMessage, problemMessage, updatedAt,
    stops: JourneyStopDto[], events: JourneyEventDto[]
  }
  ```
  Also exports: `JourneyTransportType = "MARITIME" | "AERIEN"`, `JourneyStatus`, `JourneyStopType`, `JourneySpeedUnit`, `JourneyStopDto`, `JourneyEventDto`, `JourneyGeocodingResult`
- [x] **Read schemas.ts** — Zod schemas mirroring the types with refinements on stop ordering (first must be DEPART, last must be DESTINATION), ETA validation, etc.
- [x] **Read `publicGetJourney.ts`** — Operation `"journey.publicGet"`:
  - `defineOperationFn("journey.publicGet").query().params(journeyPublicTokenSchema).entities([...]).public()`
  - Handler: `ctx.db.journey.findUnique({ where: { publicToken: params.token }, include: journeyInclude })`
  - Returns `serializeJourney(journey, false)` — includes all stops + events
  - Returns `null` if journey not found or status === "BROUILLON"
- [x] **Read `publicLookup.ts`** — Operation `"journey.publicLookup"`:
  - Looks up journey by `requestNumber` (min 3 chars), excludes BROUILLON
  - Returns `{ publicToken, requestNumber }` or null
  - Used to redirect from request number to public token
- [x] **Read shared journey components** in `src/components/journeys/shared/`:
  - **`JourneyMap.tsx`** — Client component, props: `stops: MapStop[]`, `transportType`, `mapboxToken`, `currentFromIndex`, `currentLegFraction`, `showEstimatedVehicle`, `onStopClick`, `className`. Uses `buildGreatCircleLine` + `coordinateAlongLine` from `journey-geometry.ts`
  - **`JourneyPlaceSearch.tsx`** — Client geocoding autocomplete calling `"journey.geocode"` operation with `transportType` param
  - **`route-utils.ts`** — Utility functions: `transportModeToJourneyType`, `orderedStops`, `buildRouteFeature` (GeoJSON LineString), `getJourneyProgress`, `getEstimatedArrivalAt`, status/stop label maps
  - **`journey-geometry.ts`** — Great-circle line builder (`buildGreatCircleLine`), Haversine `distanceKm`, leg splitting for progress indicator
- [x] **Confirmed there is only one tracking page** — only `tracking/[id]/page.tsx` exists under `(public)/tracking/`
- [x] **Confirmed `JourneyMap` is NOT used in the tracking system** — tracking uses `DhlTrackingMap` with `useMultiModalRoute` + `useVehiclePosition`; `JourneyMap` is purely for the admin journey builder

### In Progress
- [ ] No active work — this was a discovery session

### Blocked
- (none)

## Key Decisions
- **(Legacy tracking separate from new journey)**: The tracking system (`DhlTrackingDrawer`/`DhlTrackingMap`) operates on `TrajectoryStep[]` + `StatusEvent[]` from `"tracking.getByRequestPublic"`. The new journey system (`JourneyDto`, `JourneyMap`, `journey.publicGet`) operates on `JourneyStopDto[]` + `JourneyEventDto[]`. They share NO components. This is deliberate — the tracking system appears to predate the journey system and covers the old data model.
- **(Server-side data strategy)**: `tracking/[id]/page.tsx` fetches via `callAuraServer` from the RSC layer (not an API route). This is the Aura framework pattern — operations defined server-side are callable directly from the server component with `source: "rsc"`. The client then polls the same operation via `useAuraQuery`.
- **(Public vs admin operations)**: Both systems expose public operations (`tracking.getByRequestPublic` / `journey.publicGet`) and admin operations (`tracking.getByRequest` / `adminGetJourney`). The `operationName` prop on `TrackingPageClient` makes this configurable.

## Next Steps
1. Decide whether the tracking system should be migrated to use `JourneyDto` (via `journey.publicGet`) instead of the current `"tracking.getByRequestPublic"` response
2. If migrating, map `JourneyDto.stops` → `TrajectoryStep[]` shape for `DhlTrackingDrawer` compatibility, or rewrite drawer to accept `JourneyStopDto[]`
3. Update `tracking/[id]/page.tsx` to call `journey.publicGet` if migration is desired
4. Otherwise, the two systems can coexist — no changes needed

## Critical Context
- **Operation mapping**: `tracking.getByRequestPublic` takes `{ requestId }` (the `id` param from URL) and returns `{ trajectorySteps, statusEvents }`. `journey.publicGet` takes `{ token }` (a `publicToken` string) and returns `JourneyDto` with `stops` and `events`.
- **Step data shape difference**: `TrajectoryStep` has `stepType` string (set to `locationName` "stepType") plus `legMode` inferred. `JourneyStopDto` has proper `stopType: "DEPART" | "ESCALE" | "DESTINATION"` and `estimatedArrivalAt`.
- **Event data shape difference**: `StatusEvent` has `status`, `problemType`, `title`, `message`, `createdByLabel`. `JourneyEventDto` has `eventType`, `title`, `message`, `createdAt` only (no creator label).
- **Both systems share Mapbox** and use `react-map-gl/mapbox`. Tracking uses `useMultiModalRoute` (Mapbox Directions for truck, great-circle for plane/boat). Journey uses pure `buildGreatCircleLine` (always great-circle, simpler).
- **No shared components** between `src/components/journeys/shared/` and `src/components/tracking/`. They are separate directories with no imports crossing between them.

## File Operations
### Read
- `/home/afreeserv/projects/logistic-tracking/src/app/(client)/(public)/tracking/[id]/page.tsx`
- `/home/afreeserv/projects/logistic-tracking/src/components/journeys/shared/JourneyMap.tsx`
- `/home/afreeserv/projects/logistic-tracking/src/components/journeys/shared/JourneyPlaceSearch.tsx`
- `/home/afreeserv/projects/logistic-tracking/src/components/journeys/shared/journey-geometry.ts`
- `/home/afreeserv/projects/logistic-tracking/src/components/journeys/shared/route-utils.ts`
- `/home/afreeserv/projects/logistic-tracking/src/components/tracking/CopyMessageDialog.tsx`
- `/home/afreeserv/projects/logistic-tracking/src/components/tracking/DhlTrackingDrawer.tsx`
- `/home/afreeserv/projects/logistic-tracking/src/components/tracking/DhlTrackingMap.tsx`
- `/home/afreeserv/projects/logistic-tracking/src/components/tracking/TrackingPageClient.tsx`
- `/home/afreeserv/projects/logistic-tracking/src/components/tracking/TrackingSkeleton.tsx`
- `/home/afreeserv/projects/logistic-tracking/src/components/tracking/useMultiModalRoute.ts`
- `/home/afreeserv/projects/logistic-tracking/src/components/tracking/useSimpleGeocoder.ts`
- `/home/afreeserv/projects/logistic-tracking/src/components/tracking/useVehiclePosition.ts`
- `/home/afreeserv/projects/logistic-tracking/src/features/journeys/server/publicGetJourney.ts`
- `/home/afreeserv/projects/logistic-tracking/src/features/journeys/server/publicLookup.ts`
- `/home/afreeserv/projects/logistic-tracking/src/features/journeys/shared/schemas.ts`
- `/home/afreeserv/projects/logistic-tracking/src/features/journeys/shared/types.ts`

### Modified
- (none)
