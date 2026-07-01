# Aura — Documentation Complète v1

> Meta-framework Rails-like pour Next.js 16, pensé pour les humains et les agents IA.

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Architecture](#2-architecture)
3. [Structure du projet](#3-structure-du-projet)
4. [Couche Serveur](#4-couche-serveur)
5. [Couche Client](#5-couche-client)
6. [Authentification Aura](#6-authentification-aura)
7. [Notifications](#7-notifications)
8. [Cron](#8-cron)
9. [CLI](#9-cli)
10. [Sécurité](#10-sécurité)
11. [Conventions et bonnes pratiques](#11-conventions-et-bonnes-pratiques)
12. [Référence API](#12-référence-api)

---

## 1. Introduction

Aura est un meta-framework Rails-like construit au-dessus de Next.js 16. Son objectif est d'imposer une architecture claire, productive et **convention over configuration**, afin qu'un développeur ou un agent IA n'ait pas à choisir entre plusieurs manières de faire la même chose.

### Promesses d'Aura

- Le code métier vit côté serveur par défaut
- Le client n'importe jamais de code serveur
- Les opérations sont typées et validées
- Les formulaires utilisent les mêmes schémas que les opérations
- L'authentification est fournie dès la v1 (téléphone + mot de passe + OTP)
- Les règles métier avancées passent par `defineCommonFn` et `.use()`
- Les notifications passent par `defineNotificationFn`
- Le CLI génère les fichiers au bon endroit, avec la bonne forme

### Stack Technique

- **Next.js 16** App Router
- **TypeScript** strict
- **Bun** runtime
- **Prisma 7** + PostgreSQL (`@prisma/adapter-pg`)
- **shadcn/ui** + Tailwind CSS
- **TanStack Query**
- **nuqs** (URL params)
- **React Hook Form** + Zod
- **Zustand**
- **bcryptjs**

---

## 2. Architecture

Aura est pensé de bas niveau vers haut niveau en 7 couches :

### 2.1 Couche 0 — Platform
Responsabilités : Next.js 16, App Router, TypeScript, Bun, Prisma 7, PostgreSQL, Tailwind/shadcn.

### 2.2 Couche 1 — Transport Security (`src/proxy.ts`)
Responsabilités : Origin check, CSRF, cookies, headers, CORS fermé, méthodes HTTP, redirections auth optimistes, request id, security headers (CSP, X-Frame-Options, etc.).

**Règle d'or** : Cette couche ne fait pas de logique métier. Aucune requête DB, aucune validation métier.

### 2.3 Couche 2 — Aura Runtime (`src/aura/server`)
Responsabilités :
- `defineOperationFn` — définition des opérations
- `defineCommonFn` — middlewares réutilisables
- `createAuraContext` — contexte serveur par requête
- Validation `input` / `params`
- Erreurs standardisées
- Logs structurés
- Bridge client/serveur
- Runner RSC direct

### 2.4 Couche 3 — Auth Core (`src/aura/server/auth`)
Responsabilités : Téléphone + indicatif, mot de passe (bcryptjs), OTP, sessions opaques, cookies, invalidation sessions, rate limiting auth, notifications OTP.

### 2.5 Couche 4 — Domain (`src/features/<domain>`)
Responsabilités : Opérations métier, Prisma queries, règles `.use()`, ownership métier, notifications métier, cron métier.

### 2.6 Couche 5 — Client DX (`src/aura/client`)
Responsabilités :
- `AuraClientProvider`
- `AuraHydration` / `AuraHydrationBoundary`
- `AuraGuard`
- `useAuraQuery` / `useAuraMutation`
- `useAuraForm`
- `useAuraParams`
- `useStepperForm`
- Affichage auto des bumps
- Invalidation automatique

### 2.7 Couche 6 — UI Générée (`src/app`)
Responsabilités : Pages auth, dashboards, CRUD UI, composants shadcn.

---

## 3. Structure du projet

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Groupe de routes auth
│   │   ├── login/
│   │   ├── login/verify/
│   │   ├── register/
│   │   ├── verify-phone/
│   │   ├── reset-password/
│   │   ├── reset-password/verify/
│   │   └── logout/
│   ├── account/
│   │   ├── security/
│   │   └── sessions/
│   ├── dashboard/
│   ├── api/
│   │   ├── aura/[[...aura]]/     # Bridge Aura public
│   │   └── aura-internal/[[...aura]]/  # Endpoints internes (cron/worker)
│   ├── layout.tsx
│   ├── providers.tsx
│   └── page.tsx
├── aura/
│   ├── core/                     # Types purs, erreurs, enveloppes
│   │   ├── envelope.ts
│   │   └── errors.ts
│   ├── server/                   # Runtime serveur uniquement
│   │   ├── index.ts              # Exports publics serveur
│   │   ├── operation.ts          # defineOperationFn, defineCommonFn
│   │   ├── registry.ts           # Registre des opérations
│   │   ├── context.ts            # Types AuraContext
│   │   ├── create-context.ts     # Factory ctx par requête
│   │   ├── runner.ts             # Bridge runner
│   │   ├── call.ts               # RSC direct runner
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── logger.ts             # Logger structuré JSON
│   │   ├── bump.ts               # Store de bumps (toasts serveur)
│   │   ├── notifications.ts      # defineNotificationFn
│   │   ├── rate-limit.ts         # Rate limiting DB
│   │   ├── cron.ts               # defineCronFn, runAuraCron
│   │   ├── outbox.ts             # Process Outbox events
│   │   ├── params.ts             # loadAuraParams (serveur)
│   │   ├── hydration.tsx         # AuraHydration (RSC prefetch)
│   │   ├── json.ts               # toPrismaJson
│   │   ├── crypto.ts             # Tokens, hash, HMAC
│   │   ├── auth/                 # Auth core
│   │   │   ├── operations.ts     # Toutes les opérations auth
│   │   │   ├── session.ts        # Sessions opaques
│   │   │   ├── otp.ts            # OTP challenges
│   │   │   ├── password.ts       # bcryptjs
│   │   │   ├── phone.ts          # Normalisation téléphone
│   │   │   └── notifications.ts  # auth.phoneOtp
│   │   └── transport/
│   │       ├── cookies.ts        # Parse/set cookies
│   │       └── csrf.ts           # Token CSRF
│   ├── client/                   # Runtime client uniquement
│   │   ├── index.ts              # Exports publics
│   │   ├── provider.tsx          # AuraClientProvider (RQ + config)
│   │   ├── transport.ts          # callAuraOperation, config
│   │   ├── hooks.ts              # useAuraQuery, useAuraMutation
│   │   ├── form.ts               # useAuraForm
│   │   ├── params.ts             # useAuraParams (nuqs)
│   │   ├── stepper.ts            # useStepperForm
│   │   ├── hydration-boundary.tsx # AuraHydrationBoundary (client)
│   │   └── guard.tsx             # AuraGuard (auth + fallback)
│   ├── server/storage/           # Stockage abstrait
│   │   ├── types.ts              # Interfaces AuraStorage
│   │   ├── index.ts              # Factory + registry drivers
│   │   ├── filesystem.ts         # Driver local
│   │   └── s3.ts                 # Driver S3/SeaweedFS
│   ├── shared/                   # Code safe client + serveur
│   │   ├── auth-schemas.ts       # Zod schemas auth
│   │   ├── auth-types.ts         # Types auth partagés
│   │   ├── notification-schemas.ts
│   │   ├── manifest.ts           # Types manifest client
│   │   └── params.ts             # defineAuraParams
│   ├── auth/
│   │   └── components/
│   │       ├── forms.tsx         # Formulaires auth
│   │       └── sessions.tsx      # Composant révocation sessions
│   └── cli/                      # CLI
│       ├── doctor.ts             # Vérifications structure
│       ├── cron.ts               # Exécution manuelle cron
│       ├── outbox.ts             # Traitement outbox
│       └── make.ts               # Générateurs de fichiers
├── features/<domain>/            # Domaines métier (convention)
│   ├── shared/
│   │   └── schemas.ts
│   ├── server/
│   │   └── <operation>.ts
│   └── index.ts
├── proxy.ts                      # Next.js proxy (middleware)
├── aura.registry.ts              # Import des modules + exports registry
└── generated/prisma/             # Client Prisma 7 généré
```

---

## 4. Couche Serveur

### 4.1 `defineOperationFn`

Primitive centrale d'Aura. Remplace la création manuelle de routes API, validations, hooks, etc.

```typescript
import { defineOperationFn } from "@/aura/server/operation";
import { z } from "zod";

const mySchema = z.object({ name: z.string().min(1) });

export const todoCreate = defineOperationFn("todo.create")
  .mutate()                         // ou .query()
  .input(mySchema)                  // payload métier
  .params(myParamsSchema)           // search params (optionnel)
  .entities(["Todo"])               // entités concernées
  .auth()                           // ou .public() ou .internal()
  .use(requireAuth(), rateLimit("todo.create"))  // middlewares
  .handler(async ({ ctx, input, params, req }) => {
    // Logique métier ici
    ctx.bump.success("Tâche créée");
    return { id: "..." };
  });
```

#### DSL disponible

| Méthode | Description |
|---|---|
| `.query()` | Opération de lecture |
| `.mutate()` | Opération de modification |
| `.input(schema)` | Schéma Zod du payload |
| `.params(schema)` | Schéma Zod des search params |
| `.entities([...])` | Entités Prisma lues/modifiées |
| `.auth()` | Requiert une session |
| `.public()` | Opération publique |
| `.internal()` | Non exposée au client |
| `.use(...commonFns)` | Chaîne de middlewares |
| `.handler(fn)` | Handler métier final |

### 4.2 `defineCommonFn`

Primitive de middleware. Peut lire/enrichir le contexte, refuser l'appel, charger des ressources.

```typescript
import { defineCommonFn } from "@/aura/server/operation";

export const requireRole = (role: string) =>
  defineCommonFn(`requireRole(${role})`)
    .run(({ ctx, operation }) => {
      if (!ctx.user || ctx.user.role !== role) {
        throw new AuraError("FORBIDDEN", "Rôle insuffisant.");
      }
    });
```

### 4.3 Contexte Aura (`ctx`)

Créé à chaque requête, appel RSC, cron ou test.

```typescript
interface AuraContext {
  db: PrismaClient;
  session: AuraSessionData | null;
  user: AuraUser | null;
  auth: {
    setSessionCookie(token: string, expiresAt: Date): void;
    clearSessionCookie(): void;
  };
  notify: NotificationDispatcher;   // ctx.notify.via("name").send(...)
  bump: {
    add(variant, title, description?): void;
    success(title, description?): void;
    info(title, description?): void;
    warning(title, description?): void;
    error(title, description?): void;
    all(): AuraBump[];
  };
  log: AuraLogger;                  // debug, info, warn, error
  audit: AuraAuditContext;           // record(action, metadata)
  requestId: string;
  source: "bridge" | "rsc" | "cron" | "internal" | "test";
  request: { ip?, userAgent?, origin? };
  cookies: { set: AuraCookieMutation[] };
  storage: AuraStorage;            // ctx.storage.upload(...), ctx.storage.delete(...)
}
```

### 4.4 `defineNotificationFn`

Définit une notification typée et sa logique d'envoi.

```typescript
import { defineNotificationFn } from "@/aura/server/notifications";

export const smsNotification = defineNotificationFn("sms.send")
  .payload(z.object({ phone: z.string(), message: z.string() }))
  .handler(async ({ ctx, payload }) => {
    // Logique d'envoi
    ctx.log.info("SMS envoyé", payload);
  });
```

Appel dans une opération :
```typescript
await ctx.notify.via("sms.send").send({ phone: "+225...", message: "Hello" });
```

### 4.5 Enveloppe Aura

Toute réponse bridge suit cette structure :

**Succès :**
```json
{
  "ok": true,
  "data": { ... },
  "meta": {
    "requestId": "...",
    "bumps": [{ "variant": "success", "title": "..." }],
    "invalidates": ["Todo"],
    "refresh": true
  }
}
```

**Erreur :**
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "status": 400,
    "fieldErrors": { "name": ["Champ requis"] },
    "requestId": "..."
  }
}
```

### 4.6 Rate Limiting

```typescript
import { enforceRateLimit } from "@/aura/server/rate-limit";

await enforceRateLimit(ctx.db, {
  key: `auth:login:${ip}:${phone}`,
  limit: 8,
  windowSeconds: 60 * 15,
});
```

Utilise la table `AuraRateLimitBucket` en DB.

### 4.7 RSC Direct Calls

Les Server Components appellent Aura sans HTTP :

```typescript
import { callAuraServer } from "@/aura/server/call";

const result = await callAuraServer({
  operationName: "auth.me",
  source: "rsc",
});
```

### 4.8 `loadAuraParams` (serveur)

Parse et valide les search params côté serveur avec nuqs :

```typescript
import { loadAuraParams } from "@/aura/server/params";

const params = await loadAuraParams(todoListParams, searchParams);
```

---

## 5. Couche Client

### 5.1 `AuraClientProvider`

Configure TanStack Query + transport Aura dans le layout client.

```tsx
// src/app/providers.tsx
import { AuraClientProvider } from "@/aura/client";

<AuraClientProvider config={{ csrfCookieName: "aura_csrf" }}>
  {children}
  <Toaster richColors closeButton />
</AuraClientProvider>
```

### 5.1a `AuraHydration`

Wrapper **serveur** (RSC) qui préfecthe des données TanStack Query côté serveur et les hydrate automatiquement côté client.

```tsx
// Page serveur
import { AuraHydration } from "@/aura/server";
import { callAuraServer } from "@/aura/server/call";

export default async function TodoPage() {
  return (
    <AuraHydration
      prefetch={async (queryClient) => {
        await queryClient.prefetchQuery({
          queryKey: ["aura", "todo.list"],
          queryFn: () => callAuraServer({ operationName: "todo.list", source: "rsc" }),
        });
      }}
    >
      <TodoListClient />
    </AuraHydration>
  );
}
```

Le composant client à l'intérieur peut alors utiliser `useAuraQuery("todo.list")` — les données sont déjà dans le cache, aucun fetch supplémentaire n'est nécessaire au montage.

### 5.2 `useAuraQuery`

```tsx
const { data, isLoading } = useAuraQuery("todo.list", {
  params: { page: 1 },
  showBumps: true,    // auto-afficher les toasts serveur
});
```

### 5.3 `useAuraMutation`

```tsx
const mutation = useAuraMutation("todo.create", {
  invalidate: ["todo.list"],   // auto-invalide, ou utilise entities serveur
  refresh: true,               // router.refresh() après succès
  showBumps: true,
  onSuccess(data) { ... },
});

mutation.mutate({ name: "Acheter du lait" });
```

### 5.4 `useAuraForm`

Formulaire connecté directement à une opération Aura. Le schéma Zod est la source unique.

```tsx
const { form, handleSubmit, mutation } = useAuraForm({
  operationName: "auth.register",
  schema: authRegisterInputSchema,
  defaultValues: { countryCode: "+225", phoneNumber: "", password: "" },
});

// Les erreurs serveur (fieldErrors) sont automatiquement mappées sur les champs
<form onSubmit={handleSubmit}>...</form>
```

### 5.5 `useAuraParams`

Synchronise les search params URL avec Zod + nuqs.

```typescript
// shared/params.ts
import { defineAuraParams } from "@/aura/shared/params";
import { parseAsInteger, parseAsString } from "nuqs";

export const todoListParams = defineAuraParams({
  schema: z.object({ page: z.number().default(1), q: z.string().optional() }),
  parsers: { page: parseAsInteger.withDefault(1), q: parseAsString },
});
```

**Client :**
```tsx
const [params, setParams] = useAuraParams(todoListParams);
// params.page → number
// setParams({ page: 2 }) → met à jour l'URL
```

**Serveur :**
```typescript
const params = await loadAuraParams(todoListParams, searchParams);
```

### 5.6 `useStepperForm`

Formulaire multi-étapes avec persistance Zustand (localStorage, client-only).

```tsx
const stepper = useStepperForm({
  operationName: "onboarding.submit",
  stepperKey: "onboarding",
  steps: [
    { name: "Profil", schema: profileSchema },
    { name: "Entreprise", schema: companySchema },
    { name: "Confirmation", schema: confirmSchema },
  ],
});

// stepper.step → index actuel
// stepper.goToStep(0)
// stepper.nextStep(values) → valide et avance
// stepper.isLastStep → true sur la dernière étape
```

### 5.7 `AuraGuard`

Wrapper client qui sécurise l'affichage d'un composant en vérifiant l'authentification. Affiche un fallback pendant le chargement ou si l'utilisateur n'est pas connecté. Peut rediriger automatiquement.

```tsx
import { AuraGuard } from "@/aura/client";

// Redirection automatique
<AuraGuard redirectTo="/login">
  <DashboardContent />
</AuraGuard>

// Fallbacks personnalisés
<AuraGuard
  loadingFallback={<Skeleton />}
  unauthenticatedFallback={<LoginPrompt />}
>
  <ProtectedContent />
</AuraGuard>
```

Props :
- `redirectTo?: string` — URL de redirection si non authentifié
- `loadingFallback?: ReactNode` — affiché pendant `auth.me` pending
- `unauthenticatedFallback?: ReactNode` — affiché si `auth.me` erreur (et pas de redirect)
- `authOperationName?: string` — opération de vérification (défaut `"auth.me"`)

---

## 6. Authentification Aura

### 6.1 Modèle d'identité

L'identité principale est le **téléphone normalisé E.164**.

```
AuraUser
├── AuraPhoneIdentity (countryCode, nationalNumber, phoneE164, verifiedAt)
├── AuraPasswordCredential (passwordHash)
└── AuraSession[]
```

### 6.2 Flux d'authentification

**Inscription :**
1. `auth.register` (indicatif, numéro, mot de passe)
2. Normalisation téléphone + vérification unicité
3. Hashage bcrypt du mot de passe
4. Création user non vérifié
5. Création OTP `register_phone`
6. Envoi via `auth.phoneOtp`
7. Redirection vers `/verify-phone`

**Vérification inscription :**
1. `auth.verifyPhone` (challengeId, code)
2. Vérification OTP (hash, expiration, attempts)
3. Marquage téléphone vérifié
4. Création session opaque
5. Cookie HttpOnly `aura_session`

**Connexion :**
1. `auth.login` (indicatif, numéro, mot de passe)
2. Vérification mot de passe bcrypt
3. Création OTP `login_phone`
4. Redirection vers `/login/verify`

**Reset mot de passe :**
1. `auth.requestPasswordReset` (indicatif, numéro)
2. Réponse générique (ne pas révéler l'existence du compte)
3. OTP `reset_password` si compte existe
4. `auth.resetPassword` (challengeId, code, nouveau password)
5. Invalide toutes les sessions, crée nouvelle session

### 6.3 Sessions opaques

- Token random long (32 bytes base64url)
- Token brut uniquement dans cookie HttpOnly
- Hash SHA-256 stocké en DB
- Cookie : `HttpOnly`, `Secure` (prod), `SameSite=Lax`, `Path=/`
- Expiration : 30 jours
- `sessionVersion` sur `AuraUser` : invalide les sessions lors de changements sensibles

### 6.4 Rate limiting auth

Tous les endpoints auth sont protégés :
- `auth.register` : 5 / 15min par IP + téléphone
- `auth.login` : 8 / 15min par IP + téléphone
- `auth.verifyPhone` / `auth.verifyLoginOtp` : 10 / heure par IP + challengeId
- `auth.requestPasswordReset` : 3 / heure par IP + téléphone
- `auth.resetPassword` : 10 / heure par IP + challengeId

### 6.5 Opérations auth disponibles

| Opération | Type | Accès | Description |
|---|---|---|---|
| `auth.register` | mutate | public | Inscription téléphone + password |
| `auth.verifyPhone` | mutate | public | Vérification OTP inscription |
| `auth.login` | mutate | public | Connexion téléphone + password |
| `auth.verifyLoginOtp` | mutate | public | Vérification OTP connexion |
| `auth.requestPasswordReset` | mutate | public | Demande reset password |
| `auth.resetPassword` | mutate | public | Confirmation reset + nouveau password |
| `auth.logout` | mutate | auth | Déconnexion session courante |
| `auth.me` | query | auth | Informations utilisateur courant |
| `auth.listSessions` | query | auth | Liste des sessions actives |
| `auth.revokeAllSessions` | mutate | auth | Révoquer toutes les sessions |

### 6.6 Notification OTP

Aura réserve le nom `auth.phoneOtp`.

**Développement** : le code OTP est logué en console avec un warning.
**Production** : requiert `AURA_OTP_WEBHOOK_URL` ou `AURA_ALLOW_CONSOLE_OTP_IN_PROD=true`.

Le webhook reçoit :
```json
{ "phoneE164": "...", "code": "12345678", "purpose": "register_phone", "expiresAt": "2024-..." }
```

---

## 7. Notifications

### 7.1 `defineNotificationFn`

```typescript
import { defineNotificationFn } from "@/aura/server/notifications";

export const myNotification = defineNotificationFn({
  name: "my.channel",
  payload: z.object({ ... }),
  handler: async ({ ctx, payload }) => {
    // Envoi réel (webhook, SMS, email, etc.)
  },
});
```

### 7.2 Tables notification

- `AuraNotification` — notifications durables en DB
- `AuraNotificationDelivery` — traçabilité des livraisons (optionnel)
- `AuraOutboxEvent` — envoi différé/fiable avec retry

### 7.3 Outbox Processor

Traite les événements `AuraOutboxEvent` en background :
- Verrouillage avec timeout (éviter les conflits entre workers)
- Retry exponentiel (`2^attempts` minutes, max 60)
- Max attempts configurable (défaut 5)
- Dispatch automatique via notification handlers

```bash
# Manuel
bun aura:outbox

# Ou via cron
bun aura:cron run outbox.processor
```

---

## 8. Cron

### 8.1 `defineCronFn`

```typescript
import { defineCronFn } from "@/aura/server/cron";

export const dailyReportJob = defineCronFn("report.daily")
  .schedule("0 0 * * *")  // Expression cron (informative)
  .handler(async (ctx) => {
    ctx.log.info("Génération rapport quotidien");
    // Logique métier
  },
});
```

### 8.2 Modes d'exécution

| Mode | Commande |
|---|---|
| **CLI manuel** | `bun aura:cron run report.daily` |
| **Endpoint interne** | `POST /api/aura-internal` avec header `x-aura-internal-secret` |
| **pg_cron** | Appeler l'endpoint interne depuis PostgreSQL |
| **Worker Bun/Node** | Script externe qui appelle l'endpoint interne |

### 8.3 Sécurité

- Les jobs cron ne sont **jamais** publics
- `ctx.source = "cron"`
- Chaque run écrit dans `AuraJobRun` : jobName, startedAt, finishedAt, status, attempts, error, requestId

### 8.4 Endpoint interne

```bash
curl -X POST http://localhost:3000/api/aura-internal \
  -H "Content-Type: application/json" \
  -H "x-aura-internal-secret: $AURA_INTERNAL_SECRET" \
  -d '{"jobName": "report.daily"}'
```

---

## 9. CLI

### 9.1 `aura:doctor`

Vérifie la santé du projet :

```bash
bun aura:doctor
```

Vérifie : proxy.ts, bridge route, registry, Prisma, client généré, auth ops, env vars, OTP provider, scripts package.json.

### 9.2 `aura:make`

Génère des fichiers au bon endroit :

```bash
# Opération
bun aura:make operation todo.create

# Query (lecture avec params)
bun aura:make query todo.list

# Notification
bun aura:make notification email.send

# Cron
bun aura:make cron report.daily
```

### 9.3 `aura:cron`

Exécute un job manuellement :

```bash
bun aura:cron run report.daily
```

### 9.4 `aura:outbox`

Traite les événements outbox :

```bash
bun aura:outbox
```

---

## 10. Sécurité

### 10.1 `proxy.ts`

Le proxy gère :
- **Origin check** pour méthodes non-GET sur `/api/aura`
- **CSRF** : cookie `aura_csrf` + header `x-aura-csrf`, vérification HMAC
- **Redirections auth** : protégé → login, auth → dashboard
- **Security headers** :
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy`

### 10.2 Séparation client/serveur

| Zone | Peut importer | Ne doit PAS importer |
|---|---|---|
| `server/` | Prisma, cookies, `server-only`, handlers, registry, ctx | — |
| `client/` | Hooks, shadcn, manifest, schemas shared, types générés | Prisma, handlers, registry, secrets, `server-only` |
| `shared/` | Schemas, parsers, types, constantes | DB, cookies, secrets, logger serveur |

### 10.3 Erreurs standardisées

Codes Aura :
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` / `SESSION_EXPIRED` / `SESSION_REVOKED` (401)
- `FORBIDDEN` / `CSRF_ERROR` / `INVALID_ORIGIN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMITED` (429)
- `OTP_INVALID` / `OTP_EXPIRED` (400)
- `INTERNAL_ERROR` (500)

Les erreurs Zod sont converties en `fieldErrors` pour le mapping formulaire.

### 10.4 Audit

Toutes les opérations auth enregistrent un log audit dans `AuraAuditLog` :
- actorUserId
- action
- operation
- requestId
- source
- metadata

---

## 11. Conventions et bonnes pratiques

### 11.1 Nommage des opérations

Format : `domaine.action` (dotted identifiers)

```
auth.register
todo.create
todo.list
todo.update
todo.delete
```

### 11.2 Marqueurs d'accès obligatoires

Chaque opération doit déclarer `.auth()`, `.public()` ou `.internal()`.
Sans marqueur, l'opération lève une erreur au build.

### 11.3 Une source de vérité pour les validations

Le schéma `input` de l'opération sert à :
- Valider côté client (React Hook Form)
- Valider côté serveur (bridge)
- Typer les inputs
- Mapper les erreurs serveur vers les champs

### 11.4 Formulaires

Toujours utiliser `useAuraForm` avec le schéma Zod de l'opération. Ne jamais créer un schéma de formulaire séparé.

### 11.5 Invalidation

Déclarer les `.entities([...])` sur chaque opération. Les mutations invalident automatiquement les queries qui lisent les mêmes entités.

### 11.6 Bump vs Notification

- **Bump** = toast éphémère retourné au client (`ctx.bump.success(...)`)
- **Notification** = message durable en DB ou envoyé via provider externe (`ctx.notify.via(...).send(...)`)

---

## 12. Référence API

### 12.1 Types Core

```typescript
// AuraError
type AuraErrorCode =
  | "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND"
  | "CONFLICT" | "RATE_LIMITED" | "CSRF_ERROR" | "INVALID_ORIGIN"
  | "SESSION_EXPIRED" | "SESSION_REVOKED" | "OTP_INVALID" | "OTP_EXPIRED"
  | "INTERNAL_ERROR" | "BAD_REQUEST";

class AuraError extends Error {
  readonly code: AuraErrorCode;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;
}

// Envelope
type AuraBumpVariant = "success" | "info" | "warning" | "error";
interface AuraBump { variant: AuraBumpVariant; title: string; description?: string; }

interface AuraSuccessEnvelope<TData> {
  ok: true; data: TData;
  meta: { requestId: string; bumps: AuraBump[]; invalidates: string[]; refresh: boolean; };
}
```

## 13. Stockage (`ctx.storage`)

Aura fournit un système de stockage abstrait via `ctx.storage`, avec deux drivers : **filesystem** (par défaut) et **S3/SeaweedFS**.

### 13.1 Configuration

**Filesystem (défaut) :**
```bash
AURA_STORAGE_DRIVER="filesystem"
AURA_STORAGE_PATH="storage/files"
AURA_STORAGE_PUBLIC_PREFIX="/api/files"
```

**S3 / SeaweedFS :**
```bash
AURA_STORAGE_DRIVER="s3"
AURA_S3_ENDPOINT="https://s3.example.com"
AURA_S3_ACCESS_KEY_ID="..."
AURA_S3_SECRET_ACCESS_KEY="..."
AURA_S3_BUCKET_NAME="aura-media"
AURA_S3_ALLOW_SELF_SIGNED="false"
```

### 13.2 Table `AuraFile`

Tous les uploads sont persistés en base :
- `id`, `name`, `key` (unique), `url` (publique)
- `mimeType`, `size`, `prefix`, `storage` (driver utilisé)
- `metadata` (JSON optionnel)

### 13.3 Upload dans une opération

```typescript
const result = await ctx.storage.upload({
  data: "data:image/png;base64,iVBORw0KGgo...",  // data URL ou Buffer
  fileName: "avatar.png",
  prefix: "avatars",                               // dossier logique
  metadata: { userId: ctx.user.id },
});

// result → { id, key, url, mimeType, size }
ctx.bump.success("Fichier uploadé", result.url);
```

### 13.4 Suppression

```typescript
await ctx.storage.delete(result.url);
// ou par clé
await ctx.storage.delete("avatars/abc123-avatar.png");
```

### 13.5 Driver personnalisé

```typescript
import { registerStorageDriver } from "@/aura/server/storage";

registerStorageDriver({
  name: "custom",
  async upload(args) { /* ... */ },
  async delete(keyOrUrl) { /* ... */ },
});
```

### 13.6 Sécurité filesystem

- La route `/api/files/[...path]` sert les fichiers locaux
- Protection contre path traversal (`..` interdit)
- Mime type détecté par extension
- Cache-Control : `public, max-age=86400`

---

### 12.2 Hooks Client

```typescript
// useAuraQuery
function useAuraQuery<TData>(operationName: string, options?: {
  input?: unknown;
  params?: unknown;
  showBumps?: boolean;  // default true
  ...UseQueryOptions
});

// useAuraMutation
function useAuraMutation<TInput, TData>(operationName: string, options?: {
  params?: unknown;
  invalidate?: string[];
  refresh?: boolean;     // default true
  showBumps?: boolean;   // default true
  ...UseMutationOptions
});

// useAuraForm
function useAuraForm<TValues, TData>(options: {
  operationName: string;
  schema: z.ZodType<TValues>;
  defaultValues?: Partial<TValues>;
  mutation?: UseAuraMutationOptions<TValues, TData>;
});

// useAuraParams
function useAuraParams<TSchema>(definition: AuraParamsDefinition<TSchema>): readonly [
  z.infer<TSchema>,
  (values: Partial<z.infer<TSchema>>) => void
];

// useStepperForm
function useStepperForm<TValues, TData>(options: {
  operationName: string;
  stepperKey: string;
  steps: Array<{ name: string; schema: z.ZodType<TValues> }>;
});

// AuraHydration (RSC)
function AuraHydration(props: {
  prefetch: (queryClient: QueryClient) => Promise<void>;
  children: ReactNode;
});

// AuraGuard (client)
function AuraGuard(props: {
  children: ReactNode;
  redirectTo?: string;
  loadingFallback?: ReactNode;
  unauthenticatedFallback?: ReactNode;
  authOperationName?: string;
});
```

### 12.3 Serveur

```typescript
// defineOperationFn
function defineOperationFn<TName extends string>(name: TName): RootStage<TName>;

// defineCommonFn
function defineCommonFn<TInput, TParams>(name: string): {
  run(fn: (args: CommonFnArgs<TInput, TParams>) => Promise<void> | void): DefinedCommonFn<TInput, TParams>;
};

// defineNotificationFn
function defineNotificationFn<TPayload>(name: string): {
  payload<TSchema extends z.ZodType>(schema: TSchema): { handler(fn: NotificationHandler<z.infer<TSchema>>): AuraNotificationDefinition<z.infer<TSchema>> };
};

// defineCronFn
function defineCronFn(name: string): {
  schedule(cronExpr: string): { handler(fn: (ctx: AuraContext) => Promise<void>): AuraCronJob };
  handler(fn: (ctx: AuraContext) => Promise<void>): AuraCronJob;
};

// createAuraContext
async function createAuraContext(options: {
  request?: Request;
  source: AuraSource;
  requestId?: string;
}): Promise<AuraContext>;

// callAuraServer
async function callAuraServer<TData>(options: {
  operationName: string;
  input?: unknown;
  params?: unknown;
  source?: AuraSource;
}): Promise<TData>;

// ctx.storage
interface AuraStorage {
  upload(args: { data: Buffer | string; fileName: string; prefix: string; metadata?: Record<string, unknown> }): Promise<{ id, key, url, mimeType, size }>;
  delete(keyOrUrl: string): Promise<void>;
}

// registerStorageDriver
function registerStorageDriver(driver: AuraStorageDriver): void;
```

---

## Environnement

Variables requises :

```bash
DATABASE_URL="postgresql://..."
AURA_APP_URL="http://localhost:3000"
AURA_INTERNAL_SECRET="change-me"
AURA_SESSION_COOKIE_NAME="aura_session"
AURA_CSRF_COOKIE_NAME="aura_csrf"
AURA_BCRYPT_ROUNDS="10"        # dev: 10, prod: 12
```

Variables optionnelles :

```bash
DIRECT_URL="postgresql://..."
AURA_OTP_WEBHOOK_URL="https://..."
AURA_OTP_WEBHOOK_SECRET="..."
AURA_ALLOWED_ORIGINS="https://app.com,api.app.com"
AURA_ALLOW_CONSOLE_OTP_IN_PROD="false"

# Storage
AURA_STORAGE_DRIVER="filesystem"          # "filesystem" | "s3"
AURA_STORAGE_PATH="storage/files"
AURA_STORAGE_PUBLIC_PREFIX="/api/files"

# S3 / SeaweedFS (si AURA_STORAGE_DRIVER="s3")
AURA_S3_ENDPOINT=""
AURA_S3_INTERNAL_ENDPOINT=""
AURA_S3_PUBLIC_ENDPOINT=""
AURA_S3_ACCESS_KEY_ID=""
AURA_S3_SECRET_ACCESS_KEY=""
AURA_S3_BUCKET_NAME="aura-media"
AURA_S3_REGION="us-east-1"
AURA_S3_ALLOW_SELF_SIGNED="false"
```

---

*Aura v1 — Functional Core*
*Next.js 16, Prisma 7, TypeScript strict*
# logistic-tracking
