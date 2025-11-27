# Déploiement

Guide de déploiement pour les applications Vigee.

## Environnements

| Environnement | URL | Branch |
|---------------|-----|--------|
| Development | localhost | feature/* |
| Staging | staging.vigee.com | develop |
| Production | vigee.com | main |

## Déploiement automatique

Le déploiement est automatisé via GitHub Actions.

::: tip
Les merges sur `main` déclenchent automatiquement un déploiement en production.
:::

## Déploiement manuel

```bash
# Build de production
pnpm build

# Déployer
pnpm deploy
```
