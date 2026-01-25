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

Le repo applicatif **DOIT** contenir `docs/ops/continuity.md` (source de vérité unique, versionnée).

- Si absent, il doit être créé à l'initialisation du projet avec un template minimal.
- Le projet **DOIT** exposer une page admin `/admin/continuity` qui affiche ce Markdown.

Ajouter ou mettre à jour une section dans `docs/ops/continuity.md` :

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

### Page admin obligatoire : /admin/continuity

Chaque projet **DOIT** exposer cette page :

| Critère | Exigence |
|---------|----------|
| URL | `/admin/continuity` (existe dans tous les projets) |
| Accès | Admin-only (rediriger vers login ou 403/404 si non admin, **jamais public**) |
| Source | Afficher `docs/ops/continuity.md` depuis le filesystem du build (pas de duplication) |
| Rendu | Texte brut accepté ; si rendu Markdown, **interdire tout HTML raw** (pas de `rehype-raw`) |
| Auto-update | Tout changement dans `docs/ops/continuity.md` visible après commit + redeploy |

::: warning Sécurité du runbook
- **Aucun secret** dans `docs/ops/continuity.md` (pas de tokens, clés API, mots de passe)
- Le fichier est versionné et potentiellement visible par tous les contributeurs du repo
- Utiliser des références (`voir .env`, `Dashboard Stripe`) plutôt que des valeurs
:::

## Andon (STOP)

::: danger Conditions bloquantes
- `docs/ops/continuity.md` n'existe pas (ou template minimal absent)
- `/admin/continuity` n'existe pas dans le projet
- `/admin/continuity` n'est pas protégé admin (accessible publiquement)
- Runbook contient des secrets (tokens, clés, mots de passe en clair)
- Rendu Markdown permet HTML brut (`rehype-raw` activé)
- Trigger présent mais aucune section continuity ajoutée/mise à jour
- Runbook avec plus de 3 étapes sans feature flag/circuit breaker prévu
- Pas de procédure de rollback testée (staging, dry-run ou plan documenté)
- Backup inexistant ou non vérifié pour données critiques
- Dépendance externe sans fallback ni monitoring
:::

## Checklist Done

```markdown
- [ ] `docs/ops/continuity.md` existe (créé si nécessaire) et respecte le template
- [ ] `/admin/continuity` existe et est admin-only
- [ ] `/admin/continuity` affiche le contenu du Markdown (pas de duplication)
- [ ] Trigger identifié et documenté
- [ ] Section capability ajoutée/mise à jour dans `docs/ops/continuity.md`
- [ ] What can go wrong : 3 risques max, réalistes
- [ ] Detection : symptômes + logs/alertes identifiés
- [ ] Rollback : procédure testée (staging, dry-run, ou plan documenté si staging impossible)
- [ ] Data recovery : backup vérifié, idempotence confirmée si re-run
- [ ] Runbook : 3 actions max (si > 3 : prévoir feature flag/circuit breaker)
- [ ] Aucun secret présent ; rendu safe (pas de HTML raw)
```

## Exemple minimal

Contenu de `docs/ops/continuity.md` pour la capability "Webhooks" :

```markdown
# Plan de continuité

## Webhooks (Stripe, Resend)

### What can go wrong
- Webhook Stripe échoue → paiement reçu mais non crédité en DB
- Double webhook → double crédit (si pas d'idempotence)
- Endpoint webhook down → événements perdus pendant l'indisponibilité

### Detection
| Symptôme | Log/Alerte |
|----------|------------|
| Paiement client non visible | Absence `webhook.received` dans logs |
| Double crédit | 2 entrées même `event_id` |
| Webhook timeout | `504` dans logs + alerte provider |

### Rollback
| Situation | Procédure |
|-----------|-----------|
| Webhook raté | Replay via dashboard provider |
| Double traitement | Reverser manuellement + fix idempotence |
| Endpoint cassé | Rollback code + redeploy |

### Data recovery
- Backup : quotidien, 30 jours, S3
- Re-run : Oui, webhook idempotent sur `event_id`
- Données perdues : Aucune si replay < 30 jours

### Runbook
1. Vérifier statut provider : Dashboard Stripe/Resend → Events
2. Checker logs : `grep "webhook" storage/logs/laravel.log | tail -50`
3. Replay événement : Dashboard provider → Webhooks → Retry
```

**La page `/admin/continuity` affiche ce fichier tel quel.**

## Organisation du fichier docs/ops/continuity.md

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

## Webhooks
[...]

## Stockage fichiers (S3)
[...]
```

::: tip
Une section par capability critique. Pas de fichier par feature. Garder lean.
:::
