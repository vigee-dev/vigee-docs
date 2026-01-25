# ADR Agent

Architecture Decision Record. Documente les choix techniques significatifs et leur justification.

## Quand l'utiliser

- Choix d'une nouvelle librairie ou package
- Changement de pattern architectural
- Décision sur la structure de données
- Choix d'intégration (API tierce, service externe)

## Quand ne pas l'utiliser

- Décision triviale ou standard du projet
- Choix déjà documenté dans un ADR existant
- Implémentation sans alternative réelle

## Entrées requises

| Entrée | Source |
|--------|--------|
| Problème à résoudre | Feature Spec ou constat technique |
| Options identifiées | Recherche, expérience |
| Contraintes projet | Stack existante, budget, compétences |
| Contexte de décision | Urgence, réversibilité |

## Sortie attendue

```markdown
## ADR-[NNN]: [Titre de la décision]

### Statut
[Proposé | Accepté | Déprécié | Remplacé par ADR-XXX]

### Contexte
[Quel problème technique doit être résolu ?]

### Options considérées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| Option A | [+] | [-] |
| Option B | [+] | [-] |

### Décision
[Quelle option est retenue et pourquoi]

### Conséquences
**Positives :**
- [Impact positif]

**Négatives :**
- [Compromis accepté]

### Implémentation
[Actions concrètes pour appliquer la décision]
```

## Andon (STOP)

::: danger Conditions bloquantes
- Moins de 2 options analysées
- Aucune conséquence négative identifiée (signe d'analyse superficielle)
- Décision prise sans comprendre la stack existante
- Option choisie incompatible avec les contraintes projet
:::

## Checklist Done

```markdown
- [ ] Contexte clair : problème identifié
- [ ] Minimum 2 options comparées
- [ ] Avantages ET inconvénients listés pour chaque option
- [ ] Décision explicite avec justification
- [ ] Conséquences positives et négatives documentées
- [ ] Actions d'implémentation définies
```

## Exemple minimal

```markdown
## ADR-012: Choix du système de cache pour les données API

### Statut
Accepté

### Contexte
L'API Laravel renvoie des listes de produits qui changent rarement mais sont consultées fréquemment. Le temps de réponse moyen est de 800ms.

### Options considérées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| Redis | Rapide, TTL natif, scalable | Infra supplémentaire |
| Cache fichier Laravel | Zéro config, déjà dispo | Moins performant, pas distribué |
| Mémoire applicative | Ultra rapide | Perdu au redémarrage, par instance |

### Décision
**Cache fichier Laravel** car :
- Hébergement Hostinger sans Redis managé
- Volume de requêtes actuel ne justifie pas Redis
- Migration vers Redis possible plus tard sans refonte

### Conséquences
**Positives :**
- Zéro coût d'infrastructure
- Mise en place immédiate

**Négatives :**
- Performance inférieure à Redis (~50ms vs ~5ms)
- Invalidation manuelle si plusieurs instances

### Implémentation
- Utiliser `Cache::remember()` sur les endpoints listes
- TTL de 5 minutes pour les données produits
- Tag de cache par tenant si multi-tenant
```
