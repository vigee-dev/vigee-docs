# Feature Spec Agent

Spécification fonctionnelle condensée en une page. Définit le "quoi" et le "pourquoi" avant toute implémentation.

## Quand l'utiliser

- Nouvelle fonctionnalité demandée par un client
- Ajout d'un module métier complet
- Évolution significative d'un comportement existant

## Quand ne pas l'utiliser

- Bug fix simple
- Refactoring technique sans changement fonctionnel
- Ajout de dépendance ou mise à jour de librairie

## Entrées requises

| Entrée | Source |
|--------|--------|
| Demande client ou ticket | Email, Notion, verbal |
| Contexte métier | Domaine d'activité du client |
| Contraintes connues | Budget, délai, dépendances |
| Utilisateurs cibles | Rôles et permissions existants |

## Sortie attendue

```markdown
## Feature Spec: [Nom de la feature]

### Contexte
[2-3 phrases max sur le besoin métier]

### Objectif
[1 phrase : "Permettre à [utilisateur] de [action] afin de [bénéfice]"]

### Périmètre
**Inclus :**
- [Fonctionnalité 1]
- [Fonctionnalité 2]

**Exclus :**
- [Ce qui n'est pas couvert]

### Règles métier
| Règle | Description |
|-------|-------------|
| RM-01 | [Description de la règle] |

### Critères d'acceptation
- [ ] [Critère testable 1]
- [ ] [Critère testable 2]

### Dépendances
- [Module/API/Service requis]

### Questions ouvertes
- [Question en attente de réponse]
```

## Andon (STOP)

::: danger Conditions bloquantes
- Objectif flou ou non validé par le client
- Périmètre non borné ("et aussi...", "on verra")
- Aucun critère d'acceptation défini
- Dépendance critique non disponible
:::

## Checklist Done

```markdown
- [ ] Objectif rédigé en une phrase (qui + quoi + pourquoi)
- [ ] Périmètre explicite : inclus ET exclus
- [ ] Règles métier listées et numérotées
- [ ] Critères d'acceptation testables (min. 3)
- [ ] Dépendances identifiées
- [ ] Spec validée par le client ou PO
```

## Exemple minimal

```markdown
## Feature Spec: Export PDF des factures

### Contexte
Le client souhaite télécharger ses factures au format PDF depuis son espace.

### Objectif
Permettre à un utilisateur connecté de télécharger une facture en PDF afin de la conserver ou l'envoyer à son comptable.

### Périmètre
**Inclus :**
- Bouton "Télécharger PDF" sur la liste des factures
- Génération PDF côté serveur (Laravel)

**Exclus :**
- Envoi automatique par email
- Personnalisation du template PDF

### Règles métier
| Règle | Description |
|-------|-------------|
| RM-01 | Seul le propriétaire de la facture peut la télécharger |
| RM-02 | Le PDF reprend les données de la facture sans modification |

### Critères d'acceptation
- [ ] Le bouton apparaît sur chaque ligne de facture
- [ ] Le PDF contient : numéro, date, lignes, total TTC
- [ ] Un utilisateur ne peut pas télécharger la facture d'un autre

### Dépendances
- Package `barryvdh/laravel-dompdf` (déjà installé)

### Questions ouvertes
- Faut-il un filigrane "COPIE" ?
```
