# Codebase Consistency Agent

Vérifie que le code respecte les conventions établies du projet. Standard Work : chaque modification doit s'intégrer sans créer de dette.

## Quand l'utiliser

- Avant chaque commit significatif
- Review de code (auto-review avant PR)
- Intégration de code généré par IA
- Après refactoring

## Quand ne pas l'utiliser

- Commit de configuration pure (`.env.example`, CI)
- Documentation uniquement
- Assets statiques

## Entrées requises

| Entrée | Source |
|--------|--------|
| Fichiers modifiés | `git diff --name-only` |
| Standards du projet | `/conventions/coding-standards`, `.editorconfig` |
| Structure existante | Arborescence du repo |
| Patterns en place | Code existant similaire |

## Sortie attendue

```markdown
## Consistency Check: [Feature/PR]

### Fichiers analysés
- `app/Http/Controllers/InvoiceController.php`
- `resources/views/invoices/show.blade.php`

### Conformité

| Critère | Statut | Détail |
|---------|--------|--------|
| Nommage | OK / KO | [Commentaire si KO] |
| Structure dossiers | OK / KO | [Commentaire si KO] |
| Patterns existants | OK / KO | [Commentaire si KO] |
| Formatage | OK / KO | [Commentaire si KO] |
| Imports/Use | OK / KO | [Commentaire si KO] |

### Actions correctives
- [ ] [Action 1 si KO]
- [ ] [Action 2 si KO]

### Verdict
[PASS | FAIL avec blockers]
```

## Andon (STOP)

::: danger Conditions bloquantes
- Nouveau pattern introduit sans ADR
- Nommage incohérent avec l'existant (ex: `getUser` vs `fetchUser`)
- Fichier placé dans le mauvais dossier
- Code dupliqué d'un module existant
- Import/namespace incorrect
:::

## Checklist Done

```markdown
- [ ] Nommage cohérent (classes, méthodes, variables)
- [ ] Structure de dossiers respectée
- [ ] Patterns existants réutilisés (pas de réinvention)
- [ ] Formatage conforme (PSR-12 Laravel, Prettier Next.js)
- [ ] Pas de code dupliqué
- [ ] Imports ordonnés et sans unused
- [ ] Types/annotations cohérents avec le reste du projet
```

## Exemple minimal

```markdown
## Consistency Check: Ajout InvoiceExportController

### Fichiers analysés
- `app/Http/Controllers/InvoiceExportController.php`
- `app/Services/InvoiceExportService.php`
- `routes/api.php`

### Conformité

| Critère | Statut | Détail |
|---------|--------|--------|
| Nommage | OK | Suit pattern `[Entity][Action]Controller` |
| Structure dossiers | OK | Controller dans `Http/Controllers` |
| Patterns existants | KO | Pas de Service utilisé, logique dans Controller |
| Formatage | OK | PSR-12 respecté |
| Imports/Use | OK | Namespaces corrects |

### Actions correctives
- [ ] Extraire la logique PDF dans `InvoiceExportService`
- [ ] Injecter le service dans le controller

### Verdict
FAIL - Pattern Service manquant (voir modules similaires : `ReportExportService`)
```

## Référence

Voir [Standards de code](/conventions/coding-standards) pour les conventions détaillées.
