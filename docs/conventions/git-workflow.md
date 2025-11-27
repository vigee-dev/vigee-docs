# Workflow Git

## Branches

| Branche | Usage |
|---------|-------|
| `main` | Production |
| `dev` | Développement / Staging |
| `feature/*` | Nouvelles fonctionnalités |
| `fix/*` | Corrections de bugs |
| `hotfix/*` | Corrections urgentes en production |

## Flux de travail

```
feature/ma-feature
        │
        ▼
       dev ──────────► staging
        │
        ▼
      main ──────────► production
```

## Conventions de commit

Format : `type(scope): description`

### Types

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage (pas de changement de code) |
| `refactor` | Refactoring |
| `test` | Ajout/modification de tests |
| `chore` | Maintenance |

### Exemples

```bash
feat(auth): add OAuth2 login
fix(api): handle null response
docs(readme): update installation steps
chore(deps): update dependencies
```

## Pull Requests

1. Créer une branche depuis `dev`
2. Développer la fonctionnalité
3. Ouvrir une PR vers `dev`
4. Code review
5. Merge après approbation

### Template de PR

```markdown
## Description
Brève description des changements

## Type de changement
- [ ] Nouvelle fonctionnalité
- [ ] Correction de bug
- [ ] Breaking change

## Checklist
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Build vérifié localement
```
