# Data Protection Gate Agent

Vérifie la conformité RGPD de base : minimisation des données, rétention, export et journalisation.

## Quand l'utiliser

- Nouvelle collecte de données personnelles
- Stockage de données sensibles
- Fonctionnalité d'export de données
- Mise en place de logs utilisateur

## Quand ne pas l'utiliser

- Données purement techniques (métriques serveur)
- Données anonymisées
- Environnement de développement local

## Entrées requises

| Entrée | Source |
|--------|--------|
| Domain Model | Données collectées |
| Feature Spec | Finalité du traitement |
| Politique de confidentialité | Engagements existants |
| Réglementation applicable | RGPD, CNIL |

## Sortie attendue

```markdown
## Data Protection Gate: [Nom du module]

### Données collectées

| Donnée | Type RGPD | Finalité | Base légale |
|--------|-----------|----------|-------------|
| email | Personnelle | Contact | Contrat |
| nom | Personnelle | Identification | Contrat |
| IP | Personnelle | Sécurité | Intérêt légitime |

### Minimisation

| Question | Réponse |
|----------|---------|
| Toutes les données sont nécessaires ? | Oui/Non |
| Données excessives identifiées ? | [Liste] |

### Rétention

| Donnée | Durée | Justification |
|--------|-------|---------------|
| Factures | 10 ans | Obligation légale |
| Logs connexion | 1 an | Sécurité |
| Compte supprimé | 30 jours | Délai annulation |

### Droits utilisateur

| Droit | Implémenté | Endpoint/Processus |
|-------|------------|-------------------|
| Accès | Oui/Non | GET /api/user/data |
| Rectification | Oui/Non | PUT /api/user |
| Suppression | Oui/Non | DELETE /api/user |
| Export | Oui/Non | GET /api/user/export |

### Actions correctives
- [ ] [Action si non conforme]

### Verdict
[PASS | FAIL]
```

## Andon (STOP)

::: danger Conditions bloquantes
- Collecte de donnée sans finalité définie
- Pas de durée de rétention prévue
- Données sensibles (santé, religion) sans consentement explicite
- Pas de possibilité de suppression de compte
- Export de données personnelles non sécurisé
- Logs contenant des données personnelles sans rétention
:::

## Checklist Done

```markdown
- [ ] Chaque donnée a une finalité documentée
- [ ] Base légale identifiée (contrat, consentement, intérêt légitime)
- [ ] Pas de donnée excessive collectée
- [ ] Durée de rétention définie par type de donnée
- [ ] Soft delete avec purge automatique planifiée
- [ ] Endpoint d'export des données personnelles
- [ ] Processus de suppression de compte fonctionnel
- [ ] Logs purgés selon durée de rétention
```

## Exemple minimal

```markdown
## Data Protection Gate: Module Inscription

### Données collectées

| Donnée | Type RGPD | Finalité | Base légale |
|--------|-----------|----------|-------------|
| email | Personnelle | Authentification | Contrat |
| password | Personnelle | Authentification | Contrat |
| nom | Personnelle | Personnalisation | Contrat |
| IP | Personnelle | Sécurité | Intérêt légitime |

### Minimisation

| Question | Réponse |
|----------|---------|
| Toutes les données sont nécessaires ? | Oui |
| Données excessives identifiées ? | Aucune |

### Rétention

| Donnée | Durée | Justification |
|--------|-------|---------------|
| Compte utilisateur | Durée du contrat + 3 ans | Prescription légale |
| Logs connexion | 1 an | Sécurité |

### Droits utilisateur

| Droit | Implémenté | Endpoint/Processus |
|-------|------------|-------------------|
| Accès | Oui | GET /api/user |
| Rectification | Oui | PUT /api/user |
| Suppression | Oui | DELETE /api/user (soft delete) |
| Export | Non | À implémenter |

### Actions correctives
- [ ] Implémenter GET /api/user/export (JSON)
- [ ] Ajouter job de purge des comptes soft-deleted > 30j

### Verdict
FAIL - Export non implémenté
```

## Ressources

- [Guide CNIL pour développeurs](https://www.cnil.fr/fr/guide-rgpd-du-developpeur)
- [RGPD - Droits des personnes](https://www.cnil.fr/fr/les-droits-pour-maitriser-vos-donnees-personnelles)
