# Performance & Cost Gate Agent

Vérifie les performances : requêtes N+1, indices, caching, taille des payloads et pagination.

## Quand l'utiliser

- Nouvelle requête Eloquent avec relations
- Endpoint retournant des listes
- Ajout de données à une réponse API
- Mise en production d'une feature à fort trafic

## Quand ne pas l'utiliser

- Feature à faible trafic en phase MVP
- Modification sans impact sur les requêtes DB
- Changements frontend sans appel API

## Entrées requises

| Entrée | Source |
|--------|--------|
| Code Eloquent | Controllers, Services |
| API Contract | Endpoints, réponses |
| Schema DB | Migrations, indices |
| Volumétrie | Estimation trafic/données |

## Sortie attendue

```markdown
## Performance Gate: [Nom du module]

### Requêtes N+1

| Endpoint | Requêtes avant | Requêtes après | Statut |
|----------|----------------|----------------|--------|
| GET /invoices | 1 + N | 2 (eager load) | OK |

#### Corrections appliquées
```php
// Avant
$invoices = Invoice::all();
foreach ($invoices as $inv) {
    $inv->user->name; // N+1
}

// Après
$invoices = Invoice::with('user')->get();
```

### Indices

| Table | Colonne(s) | Index existant | Action |
|-------|------------|----------------|--------|
| invoices | user_id | Oui | - |
| invoices | status | Non | Ajouter |

### Caching

| Donnée | TTL | Invalidation |
|--------|-----|--------------|
| Liste produits | 5 min | On create/update |
| Config client | 1 heure | On settings change |

### Payload Size

| Endpoint | Taille actuelle | Cible | Action |
|----------|-----------------|-------|--------|
| GET /invoices | 50 KB | < 100 KB | OK |
| GET /products | 500 KB | < 100 KB | Pagination |

### Pagination

| Endpoint | Paginé | per_page | max |
|----------|--------|----------|-----|
| GET /invoices | Oui | 15 | 100 |
| GET /products | Non | - | - | ← À corriger

### Actions correctives
- [ ] [Action requise]

### Verdict
[PASS | FAIL]
```

## Andon (STOP)

::: danger Conditions bloquantes
- Requête N+1 non corrigée sur liste paginée
- Endpoint liste sans pagination
- Index manquant sur colonne de filtre fréquent
- Payload > 500 KB sans justification
- Requête sans limite sur table volumineuse
- Cache sans stratégie d'invalidation
:::

## Checklist Done

```markdown
- [ ] Pas de requête N+1 (eager loading)
- [ ] Indices sur colonnes de filtre et FK
- [ ] Listes paginées avec limite max
- [ ] Payload < 100 KB par réponse (hors fichiers)
- [ ] Cache sur données peu changeantes
- [ ] Invalidation de cache documentée
- [ ] SELECT uniquement colonnes nécessaires
- [ ] Pas de `->get()` sans limit sur grosse table
```

## Exemple minimal

```markdown
## Performance Gate: Liste Factures

### Requêtes N+1

| Endpoint | Requêtes avant | Requêtes après | Statut |
|----------|----------------|----------------|--------|
| GET /invoices | 1 + N (user) | 2 | OK |

#### Correction
```php
// InvoiceController.php
public function index()
{
    return InvoiceResource::collection(
        Invoice::with('user')
            ->where('user_id', auth()->id())
            ->paginate(15)
    );
}
```

### Indices

| Table | Colonne(s) | Index existant | Action |
|-------|------------|----------------|--------|
| invoices | user_id | Oui | - |
| invoices | status, created_at | Non | Ajouter composite |

```php
// Migration
Schema::table('invoices', function (Blueprint $table) {
    $table->index(['status', 'created_at']);
});
```

### Pagination

| Endpoint | Paginé | per_page | max |
|----------|--------|----------|-----|
| GET /invoices | Oui | 15 | 100 |

### Verdict
PASS (après ajout index composite)
```

## Outils

- Laravel Debugbar : détection N+1 en dev
- `EXPLAIN` MySQL : analyse des requêtes
- Laravel Telescope : monitoring requêtes
