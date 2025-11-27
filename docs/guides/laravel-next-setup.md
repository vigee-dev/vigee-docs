# Guide de Migration Monorepo pnpm - Next.js + Laravel

## Objectif

Fusionner un projet **Next.js** (frontend) et **Laravel** (backend) dans un monorepo pnpm avec :

- Déploiement frontend via **Vercel**
- Déploiement backend via **rsync + SSH** (Hostinger ou autre)
- Workflows GitHub Actions séparés par dossier (`apps/web/**` et `apps/api/**`)

## Structure cible

```
mon-projet/
├── apps/
│   ├── web/                    # Next.js (frontend)
│   │   ├── app/
│   │   ├── package.json        # name: "mon-projet-web"
│   │   ├── next.config.js
│   │   └── ...
│   └── api/                    # Laravel (backend)
│       ├── app/
│       ├── composer.json
│       ├── artisan
│       └── ...
├── package.json                # Orchestrateur racine
├── pnpm-workspace.yaml
├── .npmrc
├── .github/
│   └── workflows/
│       ├── ci-web.yml          # Déploiement Vercel
│       └── ci-api.yml          # Déploiement rsync + SSH
└── .gitignore
```

## Étapes de migration

### Étape 1 : Préparer le projet frontend existant

#### 1.1 Créer la structure de dossiers

```bash
cd /chemin/vers/mon-projet-frontend
mkdir -p apps/web
```

#### 1.2 Déplacer les fichiers frontend dans `apps/web/`

Glisser-déposer **tous les fichiers** du frontend dans `apps/web/`, **SAUF** :

- `.git/` (ne jamais toucher)
- `.github/` (reste à la racine)
- `.gitmodules` (si submodule, reste à la racine)
- `node_modules/` (sera régénéré)
- `.next/` (sera régénéré)

#### 1.3 Mettre à jour le nom du package

Dans `apps/web/package.json`, changer le nom :

```json
{
  "name": "mon-projet-web",
  ...
}
```

### Étape 2 : Créer les fichiers de configuration racine

#### 2.1 `package.json` (racine)

```json
{
  "name": "mon-projet",
  "private": true,
  "scripts": {
    "dev": "pnpm dev:web",
    "dev:web": "pnpm --filter mon-projet-web dev",
    "dev:api": "cd apps/api && php artisan serve --host=0.0.0.0 --port=8000",
    "build": "pnpm build:web",
    "build:web": "pnpm --filter mon-projet-web build",
    "lint": "pnpm lint:web",
    "lint:web": "pnpm --filter mon-projet-web lint",
    "test": "pnpm test:web",
    "test:web": "pnpm --filter mon-projet-web test"
  },
  "packageManager": "pnpm@9.0.0"
}
```

#### 2.2 `pnpm-workspace.yaml` (racine)

```yaml
packages:
  - apps/web
  # Si tu as un submodule design system :
  # - apps/web/app/components/mon-designsystem

onlyBuiltDependencies:
  - "@sentry/cli"
  - sharp
```

#### 2.3 `.npmrc` (racine)

```ini
shamefully-hoist=true
public-hoist-pattern[]=*
```

### Étape 3 : Ajouter le backend Laravel

#### Option A : Git Subtree (conserve l'historique)

```bash
cd /chemin/vers/mon-projet
git subtree add --prefix=apps/api https://github.com/mon-org/mon-projet-backend.git main --squash
```

#### Option B : Copie simple (sans historique)

```bash
cp -r /chemin/vers/backend/* apps/api/
```

#### 3.1 Supprimer le `.github` du backend

Le dossier `.github` importé avec le backend doit être supprimé (les workflows sont à la racine) :

```bash
rm -rf apps/api/.github
```

### Étape 4 : Configurer les GitHub Actions

#### 4.1 Workflow Frontend : `.github/workflows/ci-web.yml`

```yaml
name: "[MonProjet] Web - Deploy"

on:
  push:
    branches:
      - main
      - dev
    paths:
      - "apps/web/**"
      - "pnpm-workspace.yaml"
      - "package.json"
  pull_request:
    branches:
      - main
      - dev
    paths:
      - "apps/web/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      # Si tu as un submodule :
      # - name: Update git submodules
      #   run: |
      #     cd ../..
      #     git submodule update --init --recursive

      - name: Set environment variables
        run: |
          echo "NEXT_PUBLIC_API_URL=${{ secrets.NEXT_PUBLIC_API_URL }}" >> $GITHUB_ENV
          echo "NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}" >> $GITHUB_ENV
          # Ajouter autres variables...

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
          cache-dependency-path: apps/web/pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build
        env:
          NODE_OPTIONS: --max-old-space-size=8192

      - name: Deploy to Vercel
        if: github.event_name == 'push'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/web
          scope: mon-org
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

#### 4.2 Workflow Backend : `.github/workflows/ci-api.yml`

```yaml
name: "[MonProjet] API - Deploy"

on:
  push:
    branches:
      - dev
      - main
    paths:
      - "apps/api/**"

jobs:
  deploy-dev:
    name: "Deploy DEV"
    if: github.ref == 'refs/heads/dev'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy via rsync
        uses: burnett01/rsync-deployments@6.0.0
        with:
          switches: -avzr --delete --exclude='.env' --exclude='vendor' --exclude='storage/logs/*' --exclude='storage/framework/cache/*' --exclude='storage/framework/sessions/*' --exclude='storage/framework/views/*' --exclude='.git'
          path: apps/api/
          remote_path: ~/chemin/vers/backend-dev/
          remote_host: ${{ secrets.SSH_HOST }}
          remote_port: ${{ secrets.SSH_PORT }}
          remote_user: ${{ secrets.SSH_USER }}
          remote_key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Run Laravel commands
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          port: ${{ secrets.SSH_PORT }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/chemin/vers/backend-dev

            echo "${{ secrets.ENV_DEV_BASE64 }}" | base64 -d > .env

            ~/composer2 install --no-dev --optimize-autoloader
            php artisan migrate --force
            php artisan config:clear
            php artisan route:clear
            php artisan cache:clear

  deploy-prod:
    name: "Deploy PROD"
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy via rsync
        uses: burnett01/rsync-deployments@6.0.0
        with:
          switches: -avzr --delete --exclude='.env' --exclude='vendor' --exclude='storage/logs/*' --exclude='storage/framework/cache/*' --exclude='storage/framework/sessions/*' --exclude='storage/framework/views/*' --exclude='.git'
          path: apps/api/
          remote_path: ~/chemin/vers/backend-prod/
          remote_host: ${{ secrets.SSH_HOST }}
          remote_port: ${{ secrets.SSH_PORT }}
          remote_user: ${{ secrets.SSH_USER }}
          remote_key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Run Laravel commands
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          port: ${{ secrets.SSH_PORT }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/chemin/vers/backend-prod

            echo "${{ secrets.ENV_PROD_BASE64 }}" | base64 -d > .env

            ~/composer2 install --no-dev --optimize-autoloader
            php artisan migrate --force
            php artisan config:clear
            php artisan route:clear
            php artisan cache:clear
```

### Étape 5 : Configurer Vercel

1. Aller dans **Settings** → **General**
2. **Root Directory** : `apps/web`
3. **Include files outside the root directory in the Build Step** : ✅ Activé

### Étape 6 : Configurer les secrets GitHub

Aller dans **Settings** → **Secrets and variables** → **Actions** et ajouter :

#### Frontend (Vercel)

| Secret                | Description                 |
| --------------------- | --------------------------- |
| `VERCEL_TOKEN`        | Token Vercel                |
| `VERCEL_ORG_ID`       | ID de l'organisation Vercel |
| `VERCEL_PROJECT_ID`   | ID du projet Vercel         |
| `NEXT_PUBLIC_API_URL` | URL de l'API                |
| `NEXTAUTH_SECRET`     | Secret NextAuth             |

#### Backend (SSH/rsync)

| Secret            | Description                             |
| ----------------- | --------------------------------------- |
| `SSH_HOST`        | Adresse IP du serveur                   |
| `SSH_PORT`        | Port SSH (souvent 22 ou 65002)          |
| `SSH_USER`        | Utilisateur SSH                         |
| `SSH_PRIVATE_KEY` | Clé privée SSH                          |
| `ENV_DEV_BASE64`  | Fichier .env encodé en base64 pour DEV  |
| `ENV_PROD_BASE64` | Fichier .env encodé en base64 pour PROD |

#### Encoder un fichier .env en base64

```bash
cat .env | base64 -w 0
# ou sur macOS :
cat .env | base64
```

### Étape 7 : Préparer le serveur (première fois)

En SSH sur le serveur, supprimer le lien git existant si présent :

```bash
cd ~/chemin/vers/backend
rm -rf .git
```

Cela garantit que seul rsync est utilisé pour le déploiement.

### Étape 8 : Commit et push

```bash
git add .
git commit -m "chore: migrate to pnpm monorepo"
git push origin dev
```

## Fonctionnement des déploiements

| Action                             | Workflow déclenché         |
| ---------------------------------- | -------------------------- |
| Push dans `apps/web/**`            | `ci-web.yml` → Vercel      |
| Push dans `apps/api/**`            | `ci-api.yml` → rsync + SSH |
| Push dans les deux                 | Les deux workflows         |
| Push ailleurs (racine, docs, etc.) | Aucun workflow             |

## Commandes utiles

### Développement local

```bash
# Installer les dépendances (depuis la racine)
pnpm install

# Lancer le frontend
pnpm dev:web

# Lancer le backend
pnpm dev:api

# Build frontend
pnpm build:web
```

### Git Submodule (si design system)

```bash
# Mettre à jour le submodule
cd apps/web/app/components/mon-designsystem
git pull origin main
cd ../../../../..
git add apps/web/app/components/mon-designsystem
git commit -m "chore: update design system"
```

### Git Subtree (synchroniser le backend si besoin)

```bash
# Tirer les mises à jour du repo backend original
git subtree pull --prefix=apps/api https://github.com/mon-org/backend.git main --squash

# Pousser vers le repo backend original (optionnel)
git subtree push --prefix=apps/api https://github.com/mon-org/backend.git main
```

## Vérification sur le serveur

```bash
# Vérifier les fichiers récemment modifiés
ls -lt | head -10

# Vérifier Laravel
php artisan --version
php artisan migrate:status

# Vérifier qu'il n'y a plus de .git
ls -la .git  # Doit retourner "No such file or directory"
```

## Checklist de migration

- [ ] Créer `apps/web/` et déplacer le frontend
- [ ] Renommer le package dans `apps/web/package.json`
- [ ] Créer `package.json` racine
- [ ] Créer `pnpm-workspace.yaml`
- [ ] Créer `.npmrc`
- [ ] Ajouter le backend dans `apps/api/` (subtree ou copie)
- [ ] Supprimer `apps/api/.github/` si présent
- [ ] Créer `.github/workflows/ci-web.yml`
- [ ] Créer `.github/workflows/ci-api.yml`
- [ ] Configurer Vercel (Root Directory + Include files)
- [ ] Ajouter les secrets GitHub
- [ ] Supprimer `.git` sur le serveur (SSH)
- [ ] Tester `pnpm install` localement
- [ ] Push sur `dev` et vérifier les workflows
- [ ] Push sur `main` et vérifier en production
- [ ] Archiver l'ancien repo backend sur GitHub

## Notes importantes

::: warning Exclusions rsync
rsync exclut automatiquement : `.env`, `vendor/`, `storage/logs/*`, `.git`
:::

::: info Fichier .env
Le .env est recréé à chaque déploiement via le secret `ENV_*_BASE64`
:::

::: tip Workflows conditionnels
Les workflows ne se déclenchent que si les fichiers correspondants changent (paths filter)
:::

::: warning Configuration Vercel
Vercel doit avoir "Include files outside root directory" activé
:::
