# Configurer un pnpm Workspace

Guide pour configurer un workspace pnpm dans un monorepo Next.js + Laravel.

## Structure monorepo

```
mon-projet/
├── apps/
│   ├── web/                              # Next.js frontend
│   │   ├── vigee-designsystem/           # Design system (submodule)
│   │   ├── app/
│   │   ├── package.json
│   │   └── ...
│   └── api/                              # Laravel backend
├── packages/                             # Packages partagés (optionnel)
├── package.json                          # Orchestrateur racine
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .npmrc
└── .gitignore
```

## 1. Créer le fichier pnpm-workspace.yaml

À la racine du projet :

```yaml
packages:
  - apps/web
  # Si design system en submodule dans apps/web :
  # - apps/web/vigee-designsystem

onlyBuiltDependencies:
  - "@sentry/cli"
  - sharp
```

::: info onlyBuiltDependencies
Cette section évite les builds automatiques de dépendances natives (Sentry CLI, sharp) qui peuvent échouer en CI.
:::

## 2. Créer le fichier .npmrc

À la racine du projet :

```ini
shamefully-hoist=true
public-hoist-pattern[]=*
```

| Option | Description |
|--------|-------------|
| `shamefully-hoist=true` | Hoist les dépendances à la racine (compatibilité avec certains packages) |
| `public-hoist-pattern[]=*` | Expose tous les packages hoistés |

## 3. Créer le package.json racine

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

## 4. Configurer le package.json du frontend

Dans `apps/web/package.json`, assure-toi que le `name` correspond au filtre :

```json
{
  "name": "mon-projet-web",
  ...
}
```

## 5. Nettoyer et réinstaller

```bash
# Supprimer les anciens fichiers de lock et node_modules
rm -rf node_modules package-lock.json
rm -rf apps/web/node_modules apps/web/package-lock.json

# Réinstaller avec pnpm
pnpm install
```

## Design system en submodule

Si le design system est un submodule Git :

### Ajouter le submodule

```bash
cd apps/web
git submodule add https://github.com/vigee-dev/vigee-designsystem.git
```

### Mettre à jour le submodule

```bash
cd apps/web/vigee-designsystem
git pull origin main
cd ../../..
git add apps/web/vigee-designsystem
git commit -m "chore: update design system"
```

### Configuration pnpm-workspace.yaml avec submodule

```yaml
packages:
  - apps/web
  - apps/web/vigee-designsystem
```

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `pnpm install` | Installe toutes les dépendances du workspace |
| `pnpm add <pkg> -w` | Ajoute une dépendance à la racine |
| `pnpm add <pkg> --filter <workspace>` | Ajoute une dépendance à un package |
| `pnpm -r run build` | Exécute `build` dans tous les packages |
| `pnpm --filter <workspace> run dev` | Exécute une commande dans un package |

## Voir aussi

- [Guide de migration complet](/guides/laravel-next-setup)
- [Vue d'ensemble monorepo](/guides/monorepo-setup)
