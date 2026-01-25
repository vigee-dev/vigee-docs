# Continuity Plan Agent

Documente "quoi faire quand ça casse" et "comment revenir en arrière au niveau métier". Ce n'est pas de l'observabilité : c'est un runbook opérationnel.

## Quand l'utiliser

Obligatoire si **au moins un trigger** est vrai :

- Changement DB à risque (migration, backfill, suppression, transformation)
- Dépendance externe critique (paiement, email transactionnel, stockage, signature, webhooks)
- Process métier non réversible (facturation, signature, droits/rôles, clôture/validation)
- Charge/volume pouvant dégrader la prod (listes/recherche, jobs longs, fichiers volumineux)
- Surface sécurité accrue (auth, permissions, PII)
- Ajout/modification de cron, queue, jobs ou configuration sensible

## Quand ne pas l'utiliser

- Feature mineure sans impact data ni dépendance externe
- Bug fix simple sans risque de régression métier
- Modification UI uniquement

## Entrées requises

| Entrée | Source |
|--------|--------|
| Feature Spec | Flux métier, cas d'erreur |
| Domain & Database | Migrations, données impactées |
| API Contract | Dépendances externes |
| Release Plan | Étapes de déploiement |

## Sortie attendue

Ajouter ou mettre à jour une section dans `/docs/ops/continuity.md` (source de vérité unique).

```markdown
## [Nom de la capability]

### What can go wrong
- [Risque 1 : ex. "Webhook Stripe échoue, paiement non enregistré"]
- [Risque 2 : ex. "Job d'import timeout sur fichier > 10MB"]
- [Risque 3 : ex. "Migration corrompt les données existantes"]

### Detection
| Symptôme | Log/Alerte |
|----------|------------|
| Paiement non crédité | `payment.failed` dans logs + absence en DB |
| Import bloqué | Job `ProcessImport` en status `failed` |
| Données incohérentes | Requête de vérification : `SELECT ... WHERE ...` |

### Rollback
| Situation | Procédure |
|-----------|-----------|
| Migration échouée | `php artisan migrate:rollback --step=1` |
| Données corrompues | Restaurer backup + re-run migration corrigée |
| Webhook défaillant | Désactiver endpoint + replay manuel |

### Data recovery
- Backup : [fréquence, rétention, localisation]
- Re-run possible : [Oui/Non, conditions d'idempotence]
- Données perdues : [Quoi, impact métier, mitigation]

### Runbook (3 actions max)
1. [Action immédiate : ex. "Mettre en maintenance"]
2. [Diagnostic : ex. "Vérifier logs : `tail -f storage/logs/laravel.log | grep payment`"]
3. [Correction : ex. "Relancer le job : `php artisan queue:retry {id}`"]

> **Si > 3 actions nécessaires** : c'est un signal que la feature nécessite un feature flag, circuit breaker ou mode maintenance dédié. Simplifier l'architecture avant de documenter un runbook trop complexe.
```

## Andon (STOP)

::: danger Conditions bloquantes
- Trigger présent mais aucune section continuity ajoutée
- Runbook avec plus de 3 étapes sans feature flag/circuit breaker prévu
- Pas de procédure de rollback testée (staging, dry-run ou plan documenté)
- Backup inexistant ou non vérifié pour données critiques
- Dépendance externe sans fallback ni monitoring
:::

## Checklist Done

```markdown
- [ ] Trigger identifié et documenté
- [ ] Section ajoutée/mise à jour dans `/docs/ops/continuity.md`
- [ ] What can go wrong : 3 risques max, réalistes
- [ ] Detection : symptômes + logs/alertes identifiés
- [ ] Rollback : procédure testée (staging, dry-run, ou plan documenté si staging impossible)
- [ ] Data recovery : backup vérifié, idempotence confirmée si re-run
- [ ] Runbook : 3 actions max (si > 3 : prévoir feature flag/circuit breaker)
```

## Exemple minimal

```markdown
## Paiements Stripe

### What can go wrong
- Webhook Stripe échoue → paiement reçu mais non crédité en DB
- Double webhook → double crédit (si pas d'idempotence)
- Clé API expirée → tous les paiements échouent

### Detection
| Symptôme | Log/Alerte |
|----------|------------|
| Paiement client non visible | Absence `payment.succeeded` dans logs |
| Double crédit | 2 entrées même `stripe_payment_id` |
| Tous paiements KO | `Stripe API error 401` dans logs |

### Rollback
| Situation | Procédure |
|-----------|-----------|
| Webhook raté | Replay via dashboard Stripe |
| Double crédit | Reverser manuellement + fix idempotence |
| Clé expirée | Rotation clé dans `.env` + redeploy |

### Data recovery
- Backup : quotidien, 30 jours, S3
- Re-run : Oui, webhook idempotent sur `stripe_payment_id`
- Données perdues : Aucune si replay < 30 jours

### Runbook
1. Vérifier statut Stripe : `curl https://status.stripe.com/api/v2/status.json`
2. Checker logs : `grep "stripe" storage/logs/laravel.log | tail -50`
3. Replay webhook : Dashboard Stripe → Webhooks → Retry
```

## Organisation du fichier continuity.md

```markdown
# Plan de continuité

## Auth & Sessions
[...]

## Paiements (Stripe)
[...]

## Emails transactionnels
[...]

## Jobs & Queues
[...]

## Imports / Exports
[...]

## Stockage fichiers (S3)
[...]
```

::: tip
Une section par capability critique. Pas de fichier par feature. Garder lean.
:::
