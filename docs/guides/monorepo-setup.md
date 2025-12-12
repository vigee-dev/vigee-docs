# Guide Complet : Monorepo Next.js + Laravel avec pnpm

## Prompt à copier pour Claude

::: tip Prérequis avant de lancer le prompt
1. **Créer manuellement** la structure `apps/web/` et y déplacer les fichiers frontend
2. **Configurer Vercel** : Root Directory = `apps/web` + "Include files outside root directory" activé
3. **Ajouter les secrets GitHub** (voir section "Configurer les secrets GitHub")
4. **Préparer le serveur** : supprimer le `.git` existant via SSH
:::

Copie ce prompt et colle-le dans Claude avec ton projet ouvert :

```
Je souhaite passer ce projet en monorepo pnpm (Next.js + Laravel).

## Structure cible
- apps/web/ → Next.js frontend (déploiement Vercel)
- apps/api/ → Laravel backend (déploiement rsync + SSH, pas de git sur le serveur)

## Ce que tu dois faire

1. **Créer/vérifier les fichiers de configuration racine :**
   - `package.json` (orchestrateur avec scripts dev:web, dev:api, build:web)
   - `pnpm-workspace.yaml` (avec apps/web et le design system si submodule)
   - `.npmrc` (shamefully-hoist=true, public-hoist-pattern[]=*)
   - `.gitignore` (node_modules, vendor, .next, .env, storage/*.key, etc.)

2. **Configurer le package.json de apps/web :**
   - Vérifier que le "name" correspond au filtre pnpm (ex: "mon-projet-web")

3. **Créer les GitHub Actions :**
   - `.github/workflows/ci-web.yml` pour le frontend (Vercel)
   - `.github/workflows/ci-api.yml` pour le backend avec rsync :
     ```
     uses: burnett01/rsync-deployments@6.0.0
     with:
       switches: -avzr --delete --exclude='.env' --exclude='vendor' --exclude='storage/logs/*' --exclude='storage/framework/cache/*' --exclude='storage/framework/sessions/*' --exclude='storage/framework/views/*' --exclude='storage/oauth-*.key' --exclude='composer.phar' --exclude='.git'
       path: apps/api/
     ```

4. **Si design system en submodule dans apps/web/ :**
   - Ajouter le chemin dans pnpm-workspace.yaml
   - Décommenter la step git submodule dans ci-web.yml

## Documentation de référence
https://docs.vigee.fr/guides/monorepo-setup.html

Commence par lire les fichiers existants pour comprendre la structure actuelle, puis effectue les modifications nécessaires.
```

---

## Objectif

Fusionner un projet **Next.js** (frontend) et **Laravel** (backend) dans un monorepo pnpm avec :

- Déploiement frontend via **Vercel**
- Déploiement backend via **rsync + SSH** (pas de git sur le serveur)
- Workflows GitHub Actions séparés par dossier
- Support du design system en submodule Git

## Structure cible

```
mon-projet/
├── apps/
│   ├── web/                              # Next.js frontend
│   │   ├── vigee-designsystem/           # Design system (submodule Git)
│   │   ├── app/
│   │   ├── package.json                  # name: "mon-projet-web"
│   │   ├── next.config.js
│   │   └── ...
│   └── api/                              # Laravel backend
│       ├── app/
│       ├── composer.json
│       ├── artisan
│       └── ...
├── packages/                             # Packages partagés (optionnel)
├── package.json                          # Orchestrateur racine
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .npmrc
├── .gitignore
└── .github/
    └── workflows/
        ├── ci-web.yml                    # Déploiement Vercel
        └── ci-api.yml                    # Déploiement rsync + SSH
```

---

## Étape 1 : Préparer le projet frontend existant

### 1.1 Créer la structure de dossiers

```bash
cd /chemin/vers/mon-projet-frontend
mkdir -p apps/web
```

### 1.2 Déplacer les fichiers frontend dans `apps/web/`

Déplacer **tous les fichiers** du frontend dans `apps/web/`, **SAUF** :

- `.git/` (ne jamais toucher)
- `.github/` (reste à la racine)
- `.gitmodules` (si submodule, reste à la racine)
- `node_modules/` (sera régénéré)
- `.next/` (sera régénéré)

### 1.3 Mettre à jour le nom du package

Dans `apps/web/package.json`, changer le nom :

```json
{
  "name": "mon-projet-web",
  ...
}
```

---

## Étape 2 : Créer les fichiers de configuration racine

### 2.1 `package.json` (racine)

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

### 2.2 `pnpm-workspace.yaml` (racine)

```yaml
packages:
  - apps/web
  # Si design system en submodule dans apps/web :
  # - apps/web/vigee-designsystem

onlyBuiltDependencies:
  - "@sentry/cli"
  - sharp
```

### 2.3 `.npmrc` (racine)

```ini
shamefully-hoist=true
public-hoist-pattern[]=*
```

### 2.4 `.gitignore` (racine)

```gitignore
# Dependencies
node_modules/
vendor/

# Build
.next/
.turbo/
dist/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Laravel specific
apps/api/storage/*.key
apps/api/storage/logs/*
apps/api/bootstrap/cache/*

# pnpm
.pnpm-debug.log
```

---

## Étape 3 : Ajouter le backend Laravel

### Option A : Git Subtree (conserve l'historique)

```bash
cd /chemin/vers/mon-projet
git subtree add --prefix=apps/api https://github.com/mon-org/mon-projet-backend.git main --squash
```

### Option B : Copie simple (sans historique)

```bash
cp -r /chemin/vers/backend/* apps/api/
```

### 3.1 Supprimer le `.github` du backend

Le dossier `.github` importé avec le backend doit être supprimé :

```bash
rm -rf apps/api/.github
```

---

## Étape 4 : Configurer les GitHub Actions

### 4.1 Workflow Frontend : `.github/workflows/ci-web.yml`

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

      # Si tu as un submodule design system :
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

### 4.2 Workflow Backend : `.github/workflows/ci-api.yml`

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
          switches: -avzr --delete --exclude='.env' --exclude='vendor' --exclude='storage/logs/*' --exclude='storage/framework/cache/*' --exclude='storage/framework/sessions/*' --exclude='storage/framework/views/*' --exclude='storage/oauth-*.key' --exclude='composer.phar' --exclude='.git'
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
          switches: -avzr --delete --exclude='.env' --exclude='vendor' --exclude='storage/logs/*' --exclude='storage/framework/cache/*' --exclude='storage/framework/sessions/*' --exclude='storage/framework/views/*' --exclude='storage/oauth-*.key' --exclude='composer.phar' --exclude='.git'
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

---

## Étape 5 : Configurer Vercel

1. Aller dans **Settings** → **General**
2. **Root Directory** : `apps/web`
3. **Include files outside the root directory in the Build Step** : ✅ Activé

---

## Étape 6 : Configurer les secrets GitHub

Aller dans les paramètres du repository GitHub :

**[Settings → Secrets and variables → Actions](https://github.com/vigee-dev/mba-web/settings/secrets/actions)**

Et ajouter les secrets suivants :

### Frontend (Vercel)

| Secret                | Description                 |
| --------------------- | --------------------------- |
| `VERCEL_TOKEN`        | Token Vercel                |
| `VERCEL_ORG_ID`       | ID de l'organisation Vercel |
| `VERCEL_PROJECT_ID`   | ID du projet Vercel         |
| `NEXT_PUBLIC_API_URL` | URL de l'API                |
| `NEXTAUTH_SECRET`     | Secret NextAuth             |

### Backend (SSH/rsync)

| Secret            | Description                             |
| ----------------- | --------------------------------------- |
| `SSH_HOST`        | Adresse IP du serveur                   |
| `SSH_PORT`        | Port SSH (souvent 22 ou 65002)          |
| `SSH_USER`        | Utilisateur SSH                         |
| `SSH_PRIVATE_KEY` | Clé privée SSH                          |
| `ENV_DEV_BASE64`  | Fichier .env encodé en base64 pour DEV  |
| `ENV_PROD_BASE64` | Fichier .env encodé en base64 pour PROD |

### Encoder un fichier .env en base64

```bash
cat .env | base64 -w 0
# ou sur macOS :
cat .env | base64
```

---

## Étape 7 : Préparer le serveur (première fois)

En SSH sur le serveur, supprimer le lien git existant si présent :

```bash
cd ~/chemin/vers/backend
rm -rf .git
```

Cela garantit que seul rsync est utilisé pour le déploiement.

---

## Étape 8 : Design system en submodule

Si le design system est un submodule Git dans `apps/web/` :

### Ajouter le submodule

```bash
cd apps/web
git submodule add https://github.com/vigee-dev/vigee-designsystem.git
```

### Mettre à jour le `.gitmodules` à la racine

```ini
[submodule "apps/web/vigee-designsystem"]
    path = apps/web/vigee-designsystem
    url = https://github.com/vigee-dev/vigee-designsystem.git
```

### Mettre à jour `pnpm-workspace.yaml`

```yaml
packages:
  - apps/web
  - apps/web/vigee-designsystem

onlyBuiltDependencies:
  - "@sentry/cli"
  - sharp
```

### Mettre à jour le submodule

```bash
cd apps/web/vigee-designsystem
git pull origin main
cd ../../..
git add apps/web/vigee-designsystem
git commit -m "chore: update design system"
```

---

## Étape 9 : Commit et push

```bash
git add .
git commit -m "chore: migrate to pnpm monorepo"
git push origin dev
```

---

## Résumé des exclusions rsync

Le déploiement backend via rsync exclut automatiquement :

| Exclusion                       | Raison                                      |
| ------------------------------- | ------------------------------------------- |
| `.env`                          | Fichier de configuration sensible           |
| `vendor`                        | Dépendances Composer (réinstallées serveur) |
| `storage/logs/*`                | Logs Laravel                                |
| `storage/framework/cache/*`     | Cache Laravel                               |
| `storage/framework/sessions/*`  | Sessions Laravel                            |
| `storage/framework/views/*`     | Vues compilées                              |
| `storage/oauth-*.key`           | Clés OAuth (Laravel Passport)               |
| `composer.phar`                 | Binaire Composer local                      |
| `.git`                          | Historique Git                              |

---

## Fonctionnement des déploiements

| Action                             | Workflow déclenché         |
| ---------------------------------- | -------------------------- |
| Push dans `apps/web/**`            | `ci-web.yml` → Vercel      |
| Push dans `apps/api/**`            | `ci-api.yml` → rsync + SSH |
| Push dans les deux                 | Les deux workflows         |
| Push ailleurs (racine, docs, etc.) | Aucun workflow             |

---

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

### Git Subtree (synchroniser le backend si besoin)

```bash
# Tirer les mises à jour du repo backend original
git subtree pull --prefix=apps/api https://github.com/mon-org/backend.git main --squash

# Pousser vers le repo backend original (optionnel)
git subtree push --prefix=apps/api https://github.com/mon-org/backend.git main
```

---

## Checklist de migration

- [ ] Créer `apps/web/` et déplacer le frontend
- [ ] Renommer le package dans `apps/web/package.json`
- [ ] Créer `package.json` racine
- [ ] Créer `pnpm-workspace.yaml`
- [ ] Créer `.npmrc`
- [ ] Créer/mettre à jour `.gitignore`
- [ ] Ajouter le backend dans `apps/api/` (subtree ou copie)
- [ ] Supprimer `apps/api/.github/` si présent
- [ ] Créer `.github/workflows/ci-web.yml`
- [ ] Créer `.github/workflows/ci-api.yml`
- [ ] Configurer Vercel (Root Directory + Include files)
- [ ] Ajouter les secrets GitHub
- [ ] Supprimer `.git` sur le serveur (SSH)
- [ ] Configurer le submodule design system si nécessaire
- [ ] Tester `pnpm install` localement
- [ ] Push sur `dev` et vérifier les workflows
- [ ] Push sur `main` et vérifier en production
- [ ] Archiver l'ancien repo backend sur GitHub

---

## Notes importantes

::: warning Exclusions rsync
Le rsync exclut automatiquement les fichiers sensibles et générés. Ne jamais modifier ces exclusions sans raison.
:::

::: info Fichier .env
Le .env est recréé à chaque déploiement via le secret `ENV_*_BASE64`. Il n'est jamais versionné.
:::

::: tip Workflows conditionnels
Les workflows ne se déclenchent que si les fichiers correspondants changent (paths filter).
:::

::: warning Configuration Vercel
Vercel doit avoir "Include files outside root directory" activé pour accéder aux fichiers racine du monorepo.
:::

::: danger Pas de git sur le serveur
Le serveur de production/staging ne doit PAS avoir de dossier `.git`. Seul rsync est utilisé pour le déploiement.
:::
