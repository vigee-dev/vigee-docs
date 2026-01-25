# Agents

Les **Agents** sont des checklists structurées qui standardisent chaque étape du développement. Ils garantissent la qualité à la source et permettent un "stop-the-line" (andon) dès qu'un critère n'est pas rempli.

## Pourquoi ces agents ?

| Principe | Application |
|----------|-------------|
| **Standard Work** | Chaque agent impose un format de sortie reproductible |
| **Quality Gate** | Pas d'implémentation sans validation des prérequis |
| **Andon (STOP)** | Conditions bloquantes explicites pour arrêter avant de propager un défaut |

## Utilisation en développement solo

1. **Avant de coder** : exécuter les agents Foundations (Spec, ADR, Consistency)
2. **Pendant le build** : valider avec les agents Build (Domain, API, Frontend)
3. **Avant merge** : passer les agents Safety et Quality
4. **Avant déploiement** : finaliser avec les agents Delivery

## Matrice : Type de changement → Agents

Les agents entre parenthèses sont conditionnels selon le contexte.

| Type de changement | Agents requis |
|--------------------|---------------|
| Nouveau projet | Baseline → Spec |
| Nouvelle feature | Spec → (ADR) → Domain → API → Frontend → Security → Quality → Release → (Observability) → (Continuity) |
| Bug fix | Consistency → Quality → Release → (Observability si récurrent) |
| Refactoring | (ADR) → Consistency → Quality |
| Migration DB | Domain → Release → Observability → (Continuity si risque) |
| Ajout endpoint API | API → Security → Quality |
| Nouvelle page Next.js | Frontend → Quality |
| Mise en production | Release → Observability → (Continuity si trigger) |
| Upgrade dépendances | Dependencies → Quality → Release |

**Légende :**
- `(Agent)` = conditionnel : ADR si décision non triviale, Observability si flux critique/job/webhook, Continuity si trigger présent

## Liste des agents

### A. Foundations

| Agent | Description |
|-------|-------------|
| [Repository Baseline](/agents/repository-baseline) | Structure et standards de repo |
| [Feature Spec](/agents/feature-spec) | Spécification fonctionnelle 1-page |
| [ADR](/agents/adr) | Architecture Decision Record |
| [Codebase Consistency](/agents/codebase-consistency) | Vérification du standard work |

### B. Build

| Agent | Description |
|-------|-------------|
| [Domain & Database Model](/agents/domain-database) | Migrations Laravel, indices, contraintes |
| [API Contract](/agents/api-contract) | Endpoints, auth, erreurs, pagination |
| [Frontend Integration](/agents/frontend-integration) | Next.js : fetch, cache, erreurs, forms |

### C. Safety

| Agent | Description |
|-------|-------------|
| [Security Gate](/agents/security-gate) | OWASP + abus métier + authZ |
| [Data Protection Gate](/agents/data-protection) | RGPD : minimisation, rétention, export |

### D. Quality

| Agent | Description |
|-------|-------------|
| [Quality Gate](/agents/quality-gate) | Tests PHPUnit + Playwright |
| [Performance & Cost Gate](/agents/performance-gate) | N+1, indexes, caching, payload |

### E. Delivery

| Agent | Description |
|-------|-------------|
| [Release & Migration Plan](/agents/release-plan) | Déploiement CLI, migrations, rollback |
| [Observability Gate](/agents/observability-gate) | Logs structurés, corrélation, alertes |
| [Continuity Plan](/agents/continuity-plan) | Runbook : quoi faire quand ça casse |

### F. Maintenance

| Agent | Description |
|-------|-------------|
| [Dependencies & Upgrades](/agents/dependencies-upgrades) | Audit CVE, upgrades, compatibilité |
