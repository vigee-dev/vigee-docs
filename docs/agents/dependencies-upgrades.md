# Dependencies & Upgrades Gate Agent

Gère les mises à jour de dépendances : packages Composer/npm, versions PHP/Node, frameworks. Évite les régressions silencieuses.

## Quand l'utiliser

- Mise à jour majeure de Laravel ou Next.js
- Upgrade de package avec breaking changes
- Alerte CVE sur une dépendance
- Migration de version PHP ou Node.js
- Mise à jour groupée de dépendances (audit périodique)

## Quand ne pas l'utiliser

- Patch de sécurité mineur sans breaking change
- Ajout d'une nouvelle dépendance (voir ADR)
- Mise à jour de devDependencies sans impact build

## Entrées requises

| Entrée | Source |
|--------|--------|
| Liste des packages à upgrader | `composer outdated`, `pnpm outdated` |
| Changelogs / Release notes | GitHub, packagist, npm |
| CVE connues | `composer audit`, `pnpm audit` |
| Matrice de compatibilité | Documentation officielle |

## Sortie attendue

```markdown
## Upgrade Plan: [Package(s) concerné(s)]

### Scope

| Package | Version actuelle | Version cible | Type |
|---------|------------------|---------------|------|
| laravel/framework | 10.x | 11.x | Major |
| next | 14.x | 15.x | Major |

### Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Breaking change API X | Moyen | Adapter les appels |
| Deprecation Y | Faible | Refactor progressif |

### CVE / Sécurité

| CVE | Sévérité | Package | Corrigé en |
|-----|----------|---------|------------|
| CVE-2024-XXXX | High | package-x | 2.1.0 |

### Matrice de compatibilité

| Composant | Version requise | Version actuelle | OK |
|-----------|-----------------|------------------|-----|
| PHP | >= 8.2 | 8.1 | Non |
| Node | >= 20 | 20.x | Oui |
| MySQL | >= 8.0 | 8.0 | Oui |

### Plan de test

- [ ] Build backend (`composer install && php artisan test`)
- [ ] Build frontend (`pnpm install && pnpm build`)
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Smoke test manuel sur staging

### Stratégie de rollback

| Situation | Action |
|-----------|--------|
| Tests échouent | Revert composer.lock / pnpm-lock.yaml |
| Bug en staging | Revert + hotfix |
| Bug en prod | Rollback deploy + revert |

### Checklist Done

- [ ] Changelogs lus et breaking changes identifiés
- [ ] Matrice de compatibilité vérifiée
- [ ] CVE corrigées
- [ ] Tests passent (unit + E2E)
- [ ] Staging validé
- [ ] Documentation mise à jour si nécessaire
```

## Andon (STOP)

::: danger Conditions bloquantes
- Upgrade majeur sans lecture du changelog
- Version PHP/Node incompatible avec l'hébergement
- CVE critique non adressée
- Tests qui échouent après upgrade
- Pas de rollback possible (lock files non versionnés)
:::

## Checklist Done

```markdown
- [ ] Audit des outdated/CVE effectué
- [ ] Changelogs et breaking changes documentés
- [ ] Matrice de compatibilité validée
- [ ] Plan de test exécuté (build + tests + smoke)
- [ ] Staging validé avant prod
- [ ] Lock files commités
- [ ] Rollback testé ou documenté
```

## Exemple minimal

```markdown
## Upgrade Plan: Laravel 10 → 11

### Scope

| Package | Version actuelle | Version cible | Type |
|---------|------------------|---------------|------|
| laravel/framework | 10.48 | 11.0 | Major |

### Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Suppression helpers obsolètes | Moyen | Rechercher usages, remplacer |
| Nouveau système de config | Faible | Suivre upgrade guide |

### Matrice de compatibilité

| Composant | Version requise | Version actuelle | OK |
|-----------|-----------------|------------------|-----|
| PHP | >= 8.2 | 8.2 | Oui |
| Composer | >= 2.2 | 2.7 | Oui |

### Plan de test

- [x] `composer update laravel/framework`
- [x] `php artisan test` (147 tests, 0 failures)
- [x] Smoke test /api/health
- [x] Staging 24h sans erreur

### Stratégie de rollback

| Situation | Action |
|-----------|--------|
| Bug post-deploy | `git revert` + redeploy composer.lock précédent |
```

## Fréquence recommandée

| Type | Fréquence |
|------|-----------|
| Audit CVE | Hebdomadaire (automatisable) |
| Minor updates | Mensuel |
| Major upgrades | Trimestriel ou selon roadmap |
