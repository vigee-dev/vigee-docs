# Repository Baseline Agent

Standardise la création et la structure d'un nouveau repository. Garantit la cohérence entre projets dès le démarrage.

## Quand l'utiliser

- Création d'un nouveau projet client
- Fork ou clone d'un template interne
- Audit de conformité d'un repo existant
- Onboarding sur un projet legacy

## Quand ne pas l'utiliser

- Projet expérimental jetable
- POC de quelques jours
- Contribution à un projet open source externe

## Entrées requises

| Entrée | Source |
|--------|--------|
| Type de projet | Laravel API, Next.js, Monorepo |
| Conventions Vigee | Standards de code, workflow Git |
| Besoins CI/CD | GitHub Actions, déploiement cible |
| Besoins ops | Logs, monitoring, backups |

## Sortie attendue

```markdown
## Repository Baseline: [Nom du projet]

### Structure de base

```
/
├── .github/
│   └── workflows/
│       ├── ci.yml           # Tests + lint sur PR
│       └── deploy.yml       # Déploiement (si applicable)
├── docs/
│   └── ops/
│       └── continuity.md    # Plan de continuité
├── scripts/
│   ├── deploy-backend.sh    # Déploiement Laravel
│   ├── deploy-frontend.sh   # Déploiement Vercel
│   ├── backup-db.sh         # Backup base de données
│   └── smoke.sh             # Tests smoke post-deploy
├── .editorconfig            # Conventions éditeur
├── .env.example             # Variables d'environnement template
├── CLAUDE.md                # Rules pour Claude Code
├── README.md                # Documentation projet
└── [code source...]
```

### Fichiers obligatoires

| Fichier | Contenu | Template |
|---------|---------|----------|
| `.editorconfig` | Indentation, charset, EOL | Standard Vigee |
| `.env.example` | Variables sans secrets | Toutes les clés |
| `CLAUDE.md` | Project Rules | [Template](/agents/claude-template) |
| `README.md` | Setup, commands, architecture | Minimal |
| `docs/ops/continuity.md` | Runbook | Par capability |

### Scripts standard

| Script | Usage | Contenu minimal |
|--------|-------|-----------------|
| `scripts/deploy-backend.sh` | Déploiement Laravel | pull, composer, migrate, cache |
| `scripts/deploy-frontend.sh` | Déploiement Vercel | vercel --prod |
| `scripts/backup-db.sh` | Backup DB | mysqldump + storage |
| `scripts/smoke.sh` | Test post-deploy | curl health endpoints |

### CI minimale (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install
      - run: php artisan test
```

### Git Hooks (optionnel)

| Hook | Action |
|------|--------|
| pre-commit | Lint (pint, eslint) |
| commit-msg | Format conventionnel |

### Configuration initiale

- [ ] Repo créé sur GitHub (vigee-dev/nom-projet)
- [ ] Branch protection sur main (require PR, require CI)
- [ ] Secrets configurés (deploy keys, env vars)
- [ ] Équipe ajoutée avec permissions
```

## Andon (STOP)

::: danger Conditions bloquantes
- Repo sans `.env.example` (secrets potentiellement exposés)
- Repo sans `CLAUDE.md` (pas de standards)
- Repo sans CI (pas de filet de sécurité)
- Scripts de déploiement absents ou non testés
- Pas de plan de continuité pour projet critique
:::

## Checklist Done

```markdown
- [ ] Structure de dossiers conforme
- [ ] `.editorconfig` présent
- [ ] `.env.example` complet (sans secrets)
- [ ] `CLAUDE.md` adapté au projet
- [ ] `README.md` avec setup et commands
- [ ] Scripts de déploiement fonctionnels
- [ ] CI configurée et fonctionnelle
- [ ] Branch protection activée
- [ ] `docs/ops/continuity.md` si projet critique
```

## Exemple minimal

```markdown
## Repository Baseline: client-crm

### Structure

```
client-crm/
├── .github/workflows/ci.yml
├── backend/                  # Laravel API
├── frontend/                 # Next.js
├── scripts/
│   ├── deploy-backend.sh
│   ├── deploy-frontend.sh
│   └── smoke.sh
├── docs/ops/continuity.md
├── .editorconfig
├── .env.example
├── CLAUDE.md
└── README.md
```

### Fichiers créés

| Fichier | Status |
|---------|--------|
| `.editorconfig` | ✓ Copié depuis template |
| `.env.example` | ✓ Adapté au projet |
| `CLAUDE.md` | ✓ Stack Laravel + Next.js |
| `README.md` | ✓ Setup documenté |
| `ci.yml` | ✓ Tests backend + frontend |

### Scripts

```bash
# scripts/deploy-backend.sh
#!/bin/bash
set -e
cd /var/www/client-crm/backend
git pull origin main
composer install --no-dev -o
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

```bash
# scripts/smoke.sh
#!/bin/bash
curl -f https://api.client-crm.com/health || exit 1
curl -f https://client-crm.com || exit 1
echo "Smoke test passed"
```

### Checklist

- [x] Repo créé : vigee-dev/client-crm
- [x] Branch protection sur main
- [x] CI fonctionnelle
- [x] Deploy scripts testés
- [x] CLAUDE.md en place
```

## Templates disponibles

Référez-vous aux templates internes pour accélérer le bootstrap :
- Template Laravel API : structure, config, CI
- Template Next.js : App Router, conventions
- Template Monorepo : pnpm workspace, scripts partagés
