# Template CLAUDE.md

Fichier de configuration à placer à la racine de chaque projet pour guider Claude Code.

## Quand l'utiliser

- Initialisation d'un nouveau projet
- Ajout de Claude Code sur un projet existant
- Standardisation des pratiques d'équipe

## Quand ne pas l'utiliser

- Projet one-shot sans maintenance
- Prototype jetable

## Entrées requises

| Entrée | Source |
|--------|--------|
| Stack technique | Architecture du projet |
| Conventions existantes | Standards de code |
| Agents applicables | Selon type de projet |

## Sortie attendue

Créer un fichier `CLAUDE.md` à la racine du projet avec le contenu ci-dessous.

## Template à copier

````markdown
# Project Rules

Docs: https://docs.vigee.fr
Agents (standards qualité): https://docs.vigee.fr/agents/

## Stack

- Backend: Laravel (API only) — déploiement Hostinger Cloud via CLI
- Frontend: Next.js — déploiement Vercel via CLI
- Mode: dev solo, approche full-stack fonctionnelle

## Règle d'or

Si ce n'est pas **testable**, **loggable** et **rollbackable**, ce n'est pas "done".

---

## 1) Simplicité structurelle

- Une responsabilité par module/fichier. Pas de fichiers "fourre-tout".
- Pas de magie : conventions explicites, configuration documentée.
- Préférer une duplication minimale à une abstraction prématurée.
- Toute complexité doit justifier un bénéfice clair (sécurité, perf, maintenabilité).

## 2) Limites de taille

- Fichier < 300 lignes (hors tests/fixtures). Au-delà : split obligatoire.
- Fonction < 40 lignes. Au-delà : extraire (ou justifier par un commentaire bref).
- Contrôleurs Laravel : orchestration uniquement (authZ + appel services), aucune logique métier.
- Composants React : UI + orchestration légère ; logique extraite vers hooks/utilitaires.

## 3) Pureté et effets de bord

- Fonctions pures par défaut (entrée → sortie). Effets de bord isolés.
- Toute IO (DB, HTTP, filesystem) derrière une frontière claire (service/repository/client).
- Éviter de mélanger lecture/écriture dans une même opération, sauf nécessité explicite.

## 4) Frontières et architecture

- Backend = source de vérité métier : règles, permissions, invariants côté serveur.
- Frontend = consommateur : pas de règles métier critiques dispersées côté client.
- Une seule source de vérité par règle : éviter "double validation" divergente.

## 5) Données & migrations

- Migration à risque = 2 temps : add/backfill/switch/remove.
- Index obligatoires pour toute liste filtrée/triée/paginée.
- Pagination obligatoire pour toute liste (aucun endpoint non borné).
- Soft delete seulement si nécessité métier ; sinon suppression réelle + audit si besoin.
- Pas de colonnes JSON "fourre-tout" sans justification.

## 6) API Contracts

- Validation systématique via FormRequest Laravel (pas de validation inline).
- Erreurs API standardisées (structure unique, codes cohérents).
- AuthN/AuthZ explicites : aucune route "implicitement protégée".
- **Compat ascendante obligatoire** :
  - Suppression de champ : interdit sans dépréciation (1 version min).
  - Renommage : exposer ancien + nouveau pendant 1 version.
  - Nouveau champ requis : fournir une valeur par défaut.
  - Changement de type : breaking → versioning API (`/v2/`).

## 7) Scribe (documentation API)

- Source principale des schémas : **FormRequest** (règles de validation).
- Interdiction de recopier les schémas JSON si Scribe peut les déduire des règles.
- Si la validation ne suffit pas : compléter via `bodyParameters()`/annotations, minimalement.
- Toute route ajoutée ou modifiée doit rester documentable.
- "Done" inclut la génération/maj de la doc Scribe.

## 8) Sécurité (OWASP)

- Principe du moindre privilège.
- Policies/Gates obligatoires sur chaque ressource sensible.
- Rate limiting sur endpoints à risque (auth, recherche, export, webhooks).
- Uploads : whitelist type/size, stockage isolé.
- Secrets : jamais dans le repo. `.env` non commité. Rotation possible.

## 9) Protection des données (RGPD)

- Minimisation : collecter uniquement ce qui est nécessaire.
- Rétention : durée explicite (ou politique claire).
- Export/suppression : prévoir un chemin si données personnelles significatives.
- Logs : ne jamais logger de secrets ou données sensibles en clair.

## 10) Observabilité

- Logs structurés avec corrélation (requestId/correlationId si possible).
- Erreurs attendues ≠ silence : réponse propre + log utile.
- Audit log minimal pour actions sensibles (rôles, export, suppression, auth).

## 11) Tests

- Backend : tests sur règles métier critiques + permissions (PHPUnit/Pest).
- Frontend : Playwright sur 2–3 parcours critiques (happy path + auth/permissions).
- Chaque bug corrigé doit ajouter un test de non-régression quand pertinent.
- Pas de tests cosmétiques : chaque test protège un risque réel.

## 12) Qualité de code

- Nommage précis : éviter `data`, `info`, `item`, `helper`.
- Pas d'optimisation prématurée sauf contrainte identifiée.
- Refactor uniquement si gain clair, et protégé par des tests.

## 13) Déploiement

- Déploiement CLI documenté et reproductible.
- Pré-check avant release : env, migrations, caches, queue/cron, smoke test.
- Rollback défini pour toute release non triviale.

## 14) Discipline de décision (ADR)

- Toute décision non triviale : ADR court (contexte / options / décision / conséquences / rollback).
- Toute incertitude significative doit être écrite (risque) plutôt que masquée.

## 15) Plan de continuité (runbook)

Le plan de continuité n'est pas créé "pour faire sérieux". Il est **exigé** uniquement quand le risque opérationnel augmente.

### Fichier standard

- Source de vérité unique : `/ops/continuity.md` (ou `docs/ops/continuity.md` selon conventions).
- Une section par capability critique (auth, billing, webhooks, imports, jobs, stockage fichiers, etc.).
- Éviter la multiplication de fichiers "par feature".

### Triggers (obligatoire si au moins un est vrai)

- Changement DB à risque (migration/backfill/suppression, transformation de données)
- Dépendance externe critique (paiement, email transactionnel, stockage, signature, webhooks)
- Process métier non réversible (facturation, signature, droits/roles, clôture/validation)
- Charge/volume pouvant dégrader la prod (listes/recherche, jobs longs, fichiers)
- Surface sécurité accrue (auth, permissions, PII)
- Ajout/modif de cron/queue/jobs ou configuration sensible

### Contenu minimal d'une section

- **What can go wrong** (3 bullets max)
- **Detection** (symptômes + logs/alertes)
- **Rollback** (procédure exacte)
- **Data recovery** (si applicable : backup, re-run, idempotence)
- **Runbook** (3 actions/commandes max)

## 16) Dependencies & Upgrades

- Audit CVE hebdomadaire (`composer audit`, `pnpm audit`).
- Upgrade majeur = lecture changelog + matrice de compatibilité obligatoire.
- Jamais d'upgrade sans tests passants (unit + E2E).
- Lock files (`composer.lock`, `pnpm-lock.yaml`) toujours versionnés.
- Rollback = revert des lock files + redeploy.

## 17) Repository Baseline

Chaque repo doit avoir une structure standard :

```
/
├── scripts/
│   ├── deploy-backend.sh
│   ├── deploy-frontend.sh
│   ├── backup-db.sh
│   └── smoke.sh
├── docs/ops/continuity.md
├── .editorconfig
├── .env.example
├── CLAUDE.md
└── README.md
```

- Scripts de déploiement fonctionnels et testés.
- CI minimale (tests sur PR).
- Branch protection sur main.

---

## Andon (STOP) — Conditions de blocage

STOP si l'un de ces critères est vrai :

- [ ] Changement DB sans plan de migration + rollback
- [ ] Endpoint sensible sans authZ explicite (policy/gate) + tests minimaux
- [ ] Endpoint de liste sans pagination/limites
- [ ] Validation dispersée (pas de FormRequest) sur un endpoint non trivial
- [ ] Doc API impossible à générer/mettre à jour (Scribe) pour un endpoint touché
- [ ] Aucune trace exploitable (logs) pour un flux critique
- [ ] Aucun test ajouté là où le risque augmente clairement
- [ ] Trigger de continuité présent mais aucun plan/section ajouté ou mis à jour

---

## Gates obligatoires (Vigee Agents)

Les agents entre parenthèses sont conditionnels.

| Situation | Agents à exécuter |
|-----------|-------------------|
| Nouveau projet | [Repository Baseline](https://docs.vigee.fr/agents/repository-baseline) |
| Nouvelle feature | [Feature Spec](https://docs.vigee.fr/agents/feature-spec) → ([ADR](https://docs.vigee.fr/agents/adr)) → [API Contract](https://docs.vigee.fr/agents/api-contract) → ([Continuity](https://docs.vigee.fr/agents/continuity-plan)) |
| Modification DB | [Domain DB](https://docs.vigee.fr/agents/domain-database) → [Release Plan](https://docs.vigee.fr/agents/release-plan) → ([Continuity](https://docs.vigee.fr/agents/continuity-plan)) |
| Nouvel endpoint | [API Contract](https://docs.vigee.fr/agents/api-contract) → [Security Gate](https://docs.vigee.fr/agents/security-gate) |
| Données personnelles | [Data Protection](https://docs.vigee.fr/agents/data-protection) |
| Avant merge | [Quality Gate](https://docs.vigee.fr/agents/quality-gate) → [Codebase Consistency](https://docs.vigee.fr/agents/codebase-consistency) |
| Mise en prod | [Release Plan](https://docs.vigee.fr/agents/release-plan) → ([Observability](https://docs.vigee.fr/agents/observability-gate)) → ([Continuity](https://docs.vigee.fr/agents/continuity-plan)) |
| Upgrade dépendances | [Dependencies & Upgrades](https://docs.vigee.fr/agents/dependencies-upgrades) |

**Légende** : `(Agent)` = si décision non triviale (ADR), si flux critique (Observability), si trigger présent (Continuity).

---

## Usage quotidien

1. Pour une feature/module : Spec 1-page → API Contract → Security Gate (si sensible) → Quality Gate → Release Plan (si DB)
2. Tout ce qui dépasse 1h de dev ou touche la data mérite un ADR court
3. En cas de doute, consulter les [Agents](https://docs.vigee.fr/agents/)

---

## Checklist PR

```markdown
- [ ] Tests passent (`php artisan test` + `pnpm test:e2e`)
- [ ] Pas de régression
- [ ] Code formaté (PSR-12 + Prettier)
- [ ] Migrations réversibles
- [ ] Doc Scribe à jour si API modifiée
- [ ] Logs suffisants pour diagnostiquer
```
````

## Andon (STOP)

::: danger Conditions bloquantes
- Template copié sans adaptation au projet
- Liens vers agents inexistants
- Conventions en contradiction avec le projet existant
:::

## Checklist Done

```markdown
- [ ] Fichier CLAUDE.md créé à la racine
- [ ] Stack correctement décrite
- [ ] Agents pertinents référencés
- [ ] Conventions alignées avec le projet
- [ ] Commandes adaptées au projet
```

## Personnalisation

Adapter le template selon votre contexte :

| Si votre projet... | Modifier... |
|--------------------|-------------|
| Utilise Passport au lieu de Sanctum | Section Auth |
| N'a pas de frontend | Retirer sections Next.js et Playwright |
| Utilise Jest au lieu de Playwright | Section Tests |
| A des scripts de déploiement custom | Section Commandes |
| N'utilise pas Scribe | Retirer section 7 |
