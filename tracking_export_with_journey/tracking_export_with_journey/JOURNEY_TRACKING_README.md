# JC Journey Tracking — module simplifié Mapbox

Ce dossier contient un module complet à intégrer dans le projet actuel. Il remplace la logique complexe `TrajectoryStep + timers` par un système beaucoup plus simple :

1. l’administrateur choisit un voyage **maritime** ou **aérien** ;
2. il recherche le départ et la destination avec Mapbox ;
3. il ajoute, supprime ou réordonne des escales ;
4. il publie le voyage ;
5. il confirme ensuite les escales dans l’ordre ;
6. le client reçoit les nouvelles données par **polling toutes les 10 secondes**, sans WebSocket.

## Ce que le module inclut

- configuration du navire ou du vol ;
- recherche Mapbox des ports/aéroports ;
- coordonnées récupérées automatiquement ;
- départ et destination protégés ;
- ajout/suppression/réorganisation des escales ;
- ETA par escale ;
- carte Mapbox sombre et premium ;
- ligne géodésique entre les ports/aéroports ;
- publication séparée du démarrage ;
- confirmation de la prochaine escale uniquement ;
- fin automatique après la destination ;
- pause, reprise et signalement d’incident ;
- modification d’ETA ;
- notifications JC existantes ;
- lien client public basé sur un token aléatoire ;
- recherche publique par numéro de suivi ;
- progression, distances, vitesse, ETA et historique côté client ;
- position animée explicitement indiquée comme **estimée**.

---

## 1. Copier les fichiers

Copier les dossiers `src/features/journeys`, `src/components/journeys` et les nouvelles routes `src/app/.../voyage` dans le projet.

## 2. Mettre à jour Prisma

Dans le modèle `Request`, ajouter :

```prisma
journey Journey?
```

Copier ensuite les enums et modèles contenus dans :

```text
prisma/journey-tracking.patch.prisma
```

Puis exécuter :

```bash
bunx prisma format
bunx prisma migrate dev --name add_simplified_journey_tracking
bunx prisma generate
```

## 3. Enregistrer les opérations Aura

Dans `src/aura.registry.ts`, ajouter :

```ts
import "@/features/journeys/index";
```

Le fichier doit donc contenir notamment :

```ts
import "@/features/admin/index";
import "@/features/tracking/index";
import "@/features/journeys/index";
```

## 4. Configurer Mapbox

Le projet doit contenir :

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk_xxxxxxxxxxxxxxxxx
```

Le token est utilisé pour :

- la recherche des lieux ;
- l’affichage de la carte ;
- le centrage automatique.

L’administrateur ne saisit jamais de latitude ou longitude.

## 5. Ajouter l’accès dans la fiche admin

Ajouter par exemple dans l’en-tête de la demande :

```tsx
<Link
  href={`/dashboard/admin/requests/${request.id}/journey`}
  className="inline-flex min-h-11 items-center rounded-[14px] bg-[#091827] px-5 text-sm font-semibold text-white"
>
  Gérer le voyage
</Link>
```

La page fournie est :

```text
/dashboard/admin/requests/[id]/journey
```

## 6. Accès client

La recherche publique est disponible à :

```text
/voyage
```

Après recherche, le client est redirigé vers :

```text
/voyage/<publicToken>
```

Le token public est aléatoire et distinct de l’identifiant Prisma de la demande.

---

# Flow administratif obtenu

## A. Préparer le trajet

L’administrateur saisit :

- type maritime ou aérien ;
- nom du navire ou numéro de vol ;
- vitesse moyenne facultative ;
- port/aéroport de départ ;
- port/aéroport de destination ;
- escales facultatives ;
- ETA facultative de chaque étape.

Il clique sur **Enregistrer le trajet**. Le statut reste `BROUILLON`.

## B. Publier

L’administrateur clique sur **Publier le voyage**.

Le statut devient `PLANIFIE` et le client peut voir la carte. Le véhicule ne commence pas à bouger.

## C. Démarrer

L’administrateur clique sur **Confirmer le départ**.

- le départ est marqué comme atteint ;
- le statut devient `EN_COURS` ;
- la prochaine escale devient active ;
- l’historique et la notification sont créés.

## D. Confirmer les escales

L’interface ne propose qu’une seule action principale :

```text
Confirmer l’arrivée à <prochaine escale>
```

Il est impossible de sauter une escale. Lorsque la destination est confirmée, le voyage devient automatiquement `TERMINE`.

---

# « Temps réel » sans WebSocket

Le module utilise deux mécanismes :

1. **polling Aura toutes les 10 secondes** : les mises à jour admin apparaissent chez le client en moins de 10 secondes ;
2. **interpolation locale toutes les 30 secondes** : lorsque le départ réel et l’ETA suivante existent, l’icône navire/avion avance visuellement entre les deux points.

Cette position est affichée comme :

```text
Position estimée
```

Elle ne doit pas être présentée comme une position GPS réelle.

Pour réduire ou augmenter le délai, modifier :

```ts
refetchInterval: 10_000
```

dans `JourneyTrackingClient.tsx` et `JourneyAdminPanel.tsx`.

---

# Différence avec l’ancien système

| Ancien système | Nouveau module |
|---|---|
| coordonnées manuelles | recherche Mapbox |
| timer sur chaque étape | aucune gestion de timer |
| étape et segment confondus | liste simple d’escales |
| démarrage automatique à la sauvegarde | publier puis démarrer |
| statut modifié séparément | statut dérivé des actions |
| validation possible dans le désordre | prochaine escale uniquement |
| sauvegarde destructrice | mise à jour avec IDs stables |
| URL publique avec ID interne | token public aléatoire |
| deux moteurs de progression | calcul centralisé |
| position annoncée comme réelle | position estimée et étiquetée |

---

# Que faire de l’ancien code ?

Pendant l’intégration, les deux systèmes peuvent coexister. Une fois le nouveau module validé :

- masquer `AdminTrajectoryEditor` ;
- masquer `AdminStepTimerControls` ;
- masquer `AdminStatusUpdater` pour le suivi du voyage ;
- remplacer `DhlTrackingMap` et `DhlTrackingDrawer` par `JourneyTrackingClient` ;
- conserver les anciennes tables temporairement pour ne pas casser les données existantes ;
- migrer ou archiver les anciens suivis plus tard.

Ne supprimez pas immédiatement les colonnes timer de `TrajectoryStep` avant d’avoir vérifié les anciennes demandes.

---

# Dépendances

Le projet actuel semble déjà utiliser la majorité de ces paquets :

```bash
bun add react-map-gl mapbox-gl lucide-react sonner zod @turf/great-circle @turf/helpers
```

Le module suppose également que les chemins suivants existent déjà :

```text
@/aura/client
@/aura/server/operation
@/features/admin/server/common
```

---

# Limitation cartographique assumée

Mapbox ne fournit pas une route maritime exacte ni le couloir aérien réellement emprunté. Le module dessine une ligne géodésique entre les escales. C’est approprié pour une démonstration scolaire et une visualisation de progression, mais ce n’est pas une donnée AIS ou aéronautique réelle.

---

# Vérifications recommandées

Tester au minimum :

1. création d’un voyage avec seulement départ et destination ;
2. ajout de deux escales ;
3. changement d’ordre des escales ;
4. publication sans démarrage automatique ;
5. départ ;
6. confirmation des escales dans l’ordre ;
7. blocage d’une confirmation hors ordre ;
8. mise à jour d’ETA ;
9. incident puis reprise ;
10. actualisation du client en moins de 10 secondes ;
11. destination confirmée et statut final à 100 %.
