# Security Gate Agent

Vérifie la sécurité : OWASP Top 10, abus métier et contrôle d'accès (AuthZ).

## Quand l'utiliser

- Avant merge d'une feature avec données utilisateur
- Ajout d'endpoint API
- Manipulation de fichiers uploadés
- Tout formulaire avec input utilisateur

## Quand ne pas l'utiliser

- Modification de style ou UI pure
- Documentation
- Configuration d'environnement (mais vérifier les secrets)

## Entrées requises

| Entrée | Source |
|--------|--------|
| Code source | Fichiers modifiés |
| API Contract | Endpoints, auth requise |
| Feature Spec | Règles métier, rôles |
| Routes/Policies | Fichiers Laravel |

## Sortie attendue

```markdown
## Security Gate: [Nom du module]

### OWASP Check

| Catégorie | Statut | Vérification |
|-----------|--------|--------------|
| A01 - Broken Access Control | OK/KO | [Détail] |
| A02 - Crypto Failures | OK/KO | [Détail] |
| A03 - Injection | OK/KO | [Détail] |
| A04 - Insecure Design | OK/KO | [Détail] |
| A05 - Security Misconfiguration | OK/KO | [Détail] |
| A06 - Vulnerable Components | OK/KO | [Détail] |
| A07 - Auth Failures | OK/KO | [Détail] |
| A08 - Data Integrity | OK/KO | [Détail] |
| A09 - Logging Failures | OK/KO | [Détail] |
| A10 - SSRF | OK/KO | [Détail] |

### Contrôle d'accès (AuthZ)

| Ressource | Action | Règle appliquée |
|-----------|--------|-----------------|
| Invoice | view | Owner only (Policy) |
| Invoice | delete | Owner + Admin |

**Standard Laravel :**
- Policy obligatoire pour chaque ressource protégée (`Policies/InvoicePolicy.php`)
- FormRequest `authorize()` doit déléguer à la Policy ou être cohérent avec elle
- Controller : `$this->authorize('view', $invoice)` ou via FormRequest

### Permissions frontend = backend

Le frontend **ne décide jamais** des autorisations : il reflète les permissions du backend.

| Règle | Explication |
|-------|-------------|
| Backend = source de vérité | Toutes les permissions sont définies et vérifiées côté serveur |
| Frontend = miroir | Le frontend affiche/masque les éléments selon les permissions reçues de l'API |
| Pas de hardcode | Interdit : `if (user.role === 'admin')` côté frontend |
| API permissions | L'API expose les abilities via `/api/me` ou endpoint dédié |

**Pattern recommandé :**
```typescript
// Frontend Next.js - utiliser les permissions de l'API
const { can } = usePermissions(); // hook qui consomme /api/me

// Bon : permission vient de l'API
{can('invoices.create') && <CreateButton />}

// Mauvais : hardcode de rôle
{user.role === 'admin' && <CreateButton />}
```

### Abus métier

| Scénario d'abus | Mitigation |
|-----------------|------------|
| [Scénario 1] | [Protection] |

### Actions correctives
- [ ] [Action si KO]

### Verdict
[PASS | FAIL]
```

## Andon (STOP)

::: danger Conditions bloquantes
- Endpoint sans middleware auth sur données privées
- Query SQL construite par concaténation (injection)
- Input utilisateur affiché sans échappement (XSS)
- Upload de fichier sans validation de type
- Secret/token hardcodé dans le code
- Pas de Policy Laravel sur ressource protégée
- FormRequest `authorize()` incohérent avec la Policy
- AuthZ implicite (pas de `$this->authorize()` ni Policy check)
- CORS permissif (`*`) en production
- Frontend hardcode des rôles/permissions au lieu de consommer l'API (`if role === 'admin'`)
- Permissions UI non synchronisées avec les Policies backend
:::

## Checklist Done

```markdown
- [ ] Tous les endpoints protégés par middleware auth
- [ ] Policies Laravel sur chaque ressource sensible
- [ ] Policy + FormRequest authorize() cohérents
- [ ] Test minimal d'autorisation (accès refusé si non owner)
- [ ] Validation FormRequest sur tous les inputs
- [ ] Pas de SQL brut avec variables utilisateur
- [ ] Upload : validation MIME + taille + extension
- [ ] Pas de secret dans le code source
- [ ] CORS configuré par domaine autorisé
- [ ] Rate limiting sur endpoints sensibles
- [ ] Logs d'accès sur actions critiques
- [ ] Permissions frontend consomment l'API (pas de hardcode de rôles)
- [ ] API expose les abilities utilisateur (`/api/me` ou équivalent)
```

## Exemple minimal

```markdown
## Security Gate: Module Export PDF

### OWASP Check

| Catégorie | Statut | Vérification |
|-----------|--------|--------------|
| A01 - Broken Access Control | OK | Policy InvoicePolicy@view |
| A03 - Injection | OK | Pas de SQL dynamique |
| A07 - Auth Failures | OK | Middleware auth:sanctum |

### Contrôle d'accès (AuthZ)

| Ressource | Action | Règle appliquée |
|-----------|--------|-----------------|
| Invoice | downloadPdf | InvoicePolicy::view (owner) |

### Abus métier

| Scénario d'abus | Mitigation |
|-----------------|------------|
| Téléchargement massif de PDF | Rate limit 10/min |
| Accès facture autre utilisateur | Policy check user_id |

### Actions correctives
- [x] Aucune action requise

### Verdict
PASS
```

## Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security Best Practices](https://laravel.com/docs/security)
