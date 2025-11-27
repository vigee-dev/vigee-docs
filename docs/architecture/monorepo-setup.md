# Architecture Monorepo

## Vue d'ensemble

Le projet Vigee utilise une architecture monorepo avec pnpm workspaces.

## Structure

```
vigee/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Laravel backend
├── packages/         # Packages partagés (optionnel)
├── package.json
└── pnpm-workspace.yaml
```

## Avantages du monorepo

- **Cohérence** : Toutes les dépendances sont gérées au même endroit
- **Partage de code** : Packages internes facilement partageables
- **CI/CD simplifié** : Un seul repo à configurer
- **Versioning unifié** : Tout le projet évolue ensemble

## Technologies

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 14+ |
| Backend | Laravel 11+ |
| Package Manager | pnpm |
| Déploiement Frontend | Vercel |
| Déploiement Backend | rsync + SSH |

## Voir aussi

- [Guide de setup complet](/guides/laravel-next-setup)
