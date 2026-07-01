# CI/CD — Gitea Actions + Coolify

## Architecture

```
Push Git → Gitea → Gitea Actions (runner) → Build Docker image → Push to Gitea Registry → Coolify pulls image → Deploy
```

- **Git** : Gitea auto-hébergé
- **CI** : Gitea Actions (act_runner) sur le même VPS
- **Registry** : Gitea Container Registry intégré
- **CD** : Coolify pull l'image depuis le registry

---

## 1. Installation du Runner

### 1.1 Obtenir le token d'enregistrement

Gitea → Admin Panel (bouclier) → Actions → Runners → **Create Runner**

### 1.2 Lancer le conteneur runner

```bash
docker run -d \
  --name gitea-runner \
  --restart always \
  -v /opt/gitea-runner:/data \
  -v /var/run/docker.sock:/var/run/docker.sock \
  gitea/act_runner:latest
```

### 1.3 Enregistrer le runner

```bash
docker exec -it gitea-runner sh -c "
./act_runner register \
  --instance https://gitea.example.com \
  --token TON_TOKEN \
  --name mon-runner \
  --labels ubuntu-latest:docker://gitea/runner-images:ubuntu-latest \
  --no-interactive
"
```

Ou via env vars :

```bash
docker run --rm \
  -v /opt/gitea-runner:/data \
  -e GITEA_INSTANCE_URL=https://gitea.example.com \
  -e GITEA_RUNNER_REGISTRATION_TOKEN=TON_TOKEN \
  -e GITEA_RUNNER_NAME=mon-runner \
  -e GITEA_RUNNER_LABELS=ubuntu-latest:docker://gitea/runner-images:ubuntu-latest \
  gitea/act_runner:latest register --no-interactive
```

### 1.4 Config réseau (obligatoire si runner et Gitea sur le même serveur)

Les conteneurs jobs (créés par le runner) ne résolvent pas le nom de domaine public de Gitea. Créer `/opt/gitea-runner/config.yaml` :

```yaml
log:
  level: info
runner:
  file: /data/.runner
container:
  options: --add-host=gitea-ij4qdjcopnguemv8fjdxltn0.jc-import-express.online:10.0.5.2
cache:
  enabled: true
  dir: /data/cache
```

> **10.0.5.2** = IP interne du conteneur Gitea. À adapter.

Redémarrer le runner après changement du config.

### 1.5 Vérifier

```bash
docker logs gitea-runner
# Doit afficher : "runner: mon-runner, with labels: [ubuntu-latest], declare successfully"
```

---

## 2. Workflow CI

Fichier : `.gitea/workflows/build.yml`

```yaml
name: Build & Push Docker Image

on:
  push:
    branches: [main]

jobs:
  docker:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Build Docker image
        run: |
          docker build \
            --build-arg DATABASE_URL=postgresql://ci:ci@localhost:5432/ci \
            -t monapp/app:${{ github.sha }} \
            -t monapp/app:latest \
            .

      - name: Push to Gitea Container Registry
        run: |
          echo "TON_TOKEN" | docker login gitea.example.com -u monuser --password-stdin
          docker tag monapp/app:latest gitea.example.com/monuser/monrepo:${{ github.sha }}
          docker tag monapp/app:latest gitea.example.com/monuser/monrepo:latest
          docker push gitea.example.com/monuser/monrepo:${{ github.sha }}
          docker push gitea.example.com/monuser/monrepo:latest
```

> **`${{ secrets.GITHUB_TOKEN }}`** : Token automatiquement généré par Gitea pour chaque job (ne pas créer de secret manuellement).

---

## 3. Coolify — Pull depuis le Registry

1. Coolify → Application → **Build Pack** → `Docker Image`
2. **Image** : `gitea.example.com/monuser/monrepo:latest`
3. **Credentials** (si registry privé) :
   - Username : `monuser`
   - Password : le token API Gitea
4. **Watchtower** ou **Webhook** pour auto-deploy

### Webhook Coolify ← Gitea

Coolify génère une URL webhook (dans l'app → Webhooks). Ajouter dans Gitea :

Gitea → Repo → Settings → Webhooks → **Add Webhook** :
- URL : celle de Coolify
- Secret : optionnel
- Trigger : Push Events

---

## 4. Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| `exitcode 127` | Image runner sans Node.js | Utiliser `gitea/runner-images:ubuntu-latest` |
| `Could not resolve host` | DNS réseau Docker | Ajouter `--add-host` dans `config.yaml` |
| `403` sur clone | Token invalide | Utiliser `${{ secrets.GITHUB_TOKEN }}` |
| `exit code 255` Coolify | Timeout SSH Coolify | Passer en `Docker Image` (pas de build côté Coolify) |

### Images runner disponibles (gitea/runner-images)

| Tag | Base | Taille | Outils |
|---|---|---|---|
| `ubuntu-latest` | `catthehacker/ubuntu:act-24.04` | ~550MB | git, node, docker, tar |
| `ubuntu-latest-slim` | `node:20-bookworm-slim` | ~250MB | node, npm |
| `ubuntu-22.04` | `catthehacker/ubuntu:act-22.04` | ~500MB | git, node, docker, tar |

Privilégier `ubuntu-latest` pour les builds Docker.

---

## 5. Gitea Container Registry

Activer dans `app.ini` :

```ini
[packages]
ENABLED = true
```

L'image est disponible à : `gitea.example.com/monuser/monrepo:latest`

Pour push depuis un poste local :

```bash
echo "TOKEN" | docker login gitea.example.com -u monuser --password-stdin
docker build -t gitea.example.com/monuser/monrepo:latest .
docker push gitea.example.com/monuser/monrepo:latest
```
