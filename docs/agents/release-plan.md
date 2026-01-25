# Release & Migration Plan Agent

Planifie le déploiement : migrations en 2 temps, scripts CLI, rollback.

## Quand l'utiliser

- Mise en production d'une feature
- Migration de base de données
- Changement d'infrastructure
- Déploiement nécessitant coordination

## Quand ne pas l'utiliser

- Fix hotfix simple sans migration
- Déploiement automatique sans risque
- Changement de configuration uniquement

## Entrées requises

| Entrée | Source |
|--------|--------|
| Feature complète | Code mergé sur main |
| Migrations DB | Fichiers migration Laravel |
| Dépendances | Services tiers, crons |
| Environnements | Staging validé, prod target |

## Sortie attendue

```markdown
## Release Plan: [Nom de la release]

### Informations

| Élément | Valeur |
|---------|--------|
| Version | v1.2.0 |
| Date prévue | YYYY-MM-DD |
| Durée estimée | 15 min |
| Risque | Faible / Moyen / Élevé |

### Pré-requis

- [ ] Tests passent sur staging
- [ ] Review de code approuvée
- [ ] Migration testée sur copie de prod
- [ ] Backup DB récent disponible

### Étapes de déploiement

#### Phase 1 : Préparation (avant deploy)
```bash
# Backup base de données
# Adapter à vos scripts existants
```

#### Phase 2 : Migration DB (si applicable)
```bash
# Connexion serveur
ssh user@server

# Mode maintenance (optionnel si migration longue)
php artisan down --retry=60

# Exécuter migrations
php artisan migrate --force

# Vérifier
php artisan migrate:status
```

#### Phase 3 : Déploiement code

**Laravel (Hostinger) :**
```bash
# Adapter à vos scripts de déploiement existants
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Next.js (Vercel) :**
```bash
# Déploiement automatique sur push main
# Ou manuel via CLI Vercel
vercel --prod
```

#### Phase 4 : Vérification post-deploy
```bash
# Désactiver maintenance
php artisan up

# Vérifier logs
tail -f storage/logs/laravel.log

# Test smoke
curl -I https://api.example.com/health
```

### Rollback

| Situation | Action |
|-----------|--------|
| Migration échouée | `php artisan migrate:rollback --step=1` |
| Bug critique post-deploy | Revert commit + redeploy |
| Vercel | Rollback via dashboard ou `vercel rollback` |

### Migration en 2 temps (si breaking change)

| Temps | Action |
|-------|--------|
| T1 | Ajouter nouvelle colonne (nullable) |
| T2 (après migration données) | Supprimer ancienne colonne |

### Checklist post-deploy

- [ ] Application accessible
- [ ] Logs sans erreur critique
- [ ] Fonctionnalité testée manuellement
- [ ] Monitoring OK (si applicable)
```

## Andon (STOP)

::: danger Conditions bloquantes
- Migration non testée sur environnement similaire
- Pas de plan de rollback
- Déploiement en période de forte charge
- Dépendance externe non disponible
- Backup non vérifié
:::

## Checklist Done

```markdown
- [ ] Migrations testées sur staging
- [ ] Plan de rollback documenté
- [ ] Backup DB effectué
- [ ] Créneau de déploiement choisi (faible trafic)
- [ ] Équipe notifiée (si applicable)
- [ ] Tests smoke définis
- [ ] Monitoring prêt à observer
```

## Exemple minimal

```markdown
## Release Plan: Export PDF Factures

### Informations

| Élément | Valeur |
|---------|--------|
| Version | v1.5.0 |
| Date prévue | 2024-02-15 |
| Durée estimée | 10 min |
| Risque | Faible |

### Pré-requis

- [x] Tests passent sur staging
- [x] Review approuvée
- [x] Pas de migration DB

### Étapes de déploiement

#### Phase 1 : Déploiement Laravel
```bash
ssh user@server
cd /var/www/app
git pull origin main
composer install --no-dev -o
php artisan config:cache
```

#### Phase 2 : Vérification
```bash
curl https://api.example.com/api/v1/invoices/1/pdf -H "Authorization: Bearer xxx" -o test.pdf
# Vérifier que le PDF est généré
```

### Rollback

| Situation | Action |
|-----------|--------|
| PDF ne se génère pas | `git revert HEAD && git push` |

### Checklist post-deploy

- [ ] Endpoint PDF répond 200
- [ ] PDF téléchargeable depuis le front
- [ ] Logs sans erreur
```

## Référence

Voir [Déploiement](/guides/deployment) pour les procédures standard.
