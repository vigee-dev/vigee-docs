# API Contract Agent

Définit le contrat d'API : endpoints, authentification, format des erreurs, pagination et rate limiting.

## Quand l'utiliser

- Nouveau endpoint REST
- Modification de la signature d'un endpoint existant
- Ajout d'un nouveau type de ressource
- Intégration avec le frontend Next.js

## Quand ne pas l'utiliser

- Modification interne sans impact sur l'API
- Changement de logique métier à signature identique
- Refactoring de code backend uniquement

## Entrées requises

| Entrée | Source |
|--------|--------|
| Feature Spec | Actions utilisateur, données requises |
| Domain Model | Entités, attributs exposés |
| Auth existante | Sanctum, Passport, ou sessions |
| Conventions API | Versioning, nommage existant |

## Sortie attendue

```markdown
## API Contract: [Nom du module]

### Endpoints

| Méthode | URI | Description | Auth |
|---------|-----|-------------|------|
| GET | /api/v1/invoices | Liste des factures | Sanctum |
| GET | /api/v1/invoices/{id} | Détail facture | Sanctum |
| POST | /api/v1/invoices | Créer facture | Sanctum |
| PUT | /api/v1/invoices/{id} | Modifier facture | Sanctum |
| DELETE | /api/v1/invoices/{id} | Supprimer facture | Sanctum |

### Request/Response

#### GET /api/v1/invoices

**Query params :**
| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| page | int | 1 | Numéro de page |
| per_page | int | 15 | Items par page (max 100) |
| status | string | - | Filtre par statut |

**Response 200 :**
```json
{
  "data": [
    {
      "id": 1,
      "number": "INV-2024-001",
      "total_amount": "150.00",
      "status": "paid",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 72
  }
}
```

### Erreurs

| Code | Situation | Body |
|------|-----------|------|
| 401 | Non authentifié | `{"message": "Unauthenticated."}` |
| 403 | Non autorisé | `{"message": "This action is unauthorized."}` |
| 404 | Ressource inexistante | `{"message": "Invoice not found."}` |
| 422 | Validation échouée | `{"message": "...", "errors": {...}}` |

### Validation (FormRequest)

| Champ | Règles |
|-------|--------|
| number | required, string, max:20, unique:invoices |
| total_amount | required, numeric, min:0 |
| status | required, in:draft,sent,paid |

### Rate Limiting
- Authentifié : 60 requêtes/minute
- Endpoint sensible : adapter selon besoin

### Compatibilité ascendante

| Règle | Application |
|-------|-------------|
| Suppression de champ | Interdit sans deprecation préalable |
| Renommage de champ | Exposer les deux pendant 1 version |
| Nouveau champ requis | Fournir une valeur par défaut |
| Changement de type | Breaking → versioning API |

### Documentation Scribe

| Critère | Vérifié |
|---------|---------|
| FormRequest utilisé | Oui / Non |
| Règles de validation complètes | Oui / Non |
| Doc générable (`php artisan scribe:generate`) | Oui / Non |
| Exemples de response documentés | Oui / Non |
```

## Andon (STOP)

::: danger Conditions bloquantes
- Endpoint sans authentification sur données privées
- Pas de validation sur les inputs utilisateur
- Réponse non paginée sur collection potentiellement grande
- Pas de gestion d'erreur 404/403 explicite
- Exposition de données sensibles (password, tokens)
:::

## Checklist Done

```markdown
- [ ] Tous les endpoints listés avec méthode et URI
- [ ] Auth spécifiée pour chaque endpoint
- [ ] Format request/response documenté
- [ ] Pagination sur les listes (meta inclus)
- [ ] Codes d'erreur et messages définis
- [ ] Validation FormRequest rédigée (pas de validation inline)
- [ ] Rate limiting défini
- [ ] Pas de donnée sensible exposée
- [ ] Compat ascendante vérifiée (pas de breaking change)
- [ ] Documentation Scribe générable
```

## Exemple minimal

```markdown
## API Contract: Export PDF

### Endpoints

| Méthode | URI | Description | Auth |
|---------|-----|-------------|------|
| GET | /api/v1/invoices/{id}/pdf | Télécharger PDF | Sanctum |

### Request/Response

#### GET /api/v1/invoices/{id}/pdf

**Response 200 :**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="INV-2024-001.pdf"`

**Response 403 :**
```json
{"message": "Vous ne pouvez pas accéder à cette facture."}
```

**Response 404 :**
```json
{"message": "Facture introuvable."}
```

### Validation
- `{id}` : exists:invoices,id
- Policy : user_id == auth()->id()
```

## Référence

Voir [Documentation API (Scribe)](/guides/scribe-documentation) pour générer la doc OpenAPI.
