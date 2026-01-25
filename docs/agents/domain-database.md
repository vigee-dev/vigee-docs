# Domain & Database Model Agent

Définit le modèle de données : entités, relations, migrations Laravel, indices et contraintes.

## Quand l'utiliser

- Nouvelle entité métier (table)
- Ajout de colonnes sur table existante
- Modification de relations entre entités
- Optimisation des requêtes (indices)

## Quand ne pas l'utiliser

- Modification de code sans impact DB
- Ajout de scopes ou accessors Eloquent sans migration
- Changements de configuration

## Entrées requises

| Entrée | Source |
|--------|--------|
| Feature Spec | Règles métier, entités mentionnées |
| Schéma existant | `php artisan db:show` ou migrations |
| Relations identifiées | Cardinalités, ownership |
| Volumétrie estimée | Nombre de lignes attendu |

## Sortie attendue

```markdown
## Domain Model: [Nom du module]

### Entités

| Entité | Table | Description |
|--------|-------|-------------|
| Invoice | invoices | Facture client |
| InvoiceLine | invoice_lines | Ligne de facture |

### Relations

```
User 1──* Invoice *──1 InvoiceLine
         └── belongsTo: user_id (FK)
```

### Migrations

#### `create_invoices_table`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | bigIncrements | PK |
| user_id | foreignId | FK users, cascade delete |
| number | string(20) | unique |
| total_amount | decimal(10,2) | default 0 |
| status | enum | draft, sent, paid |
| created_at | timestamp | |

#### Indices
| Table | Colonnes | Type | Justification |
|-------|----------|------|---------------|
| invoices | user_id | index | FK lookup |
| invoices | status, created_at | composite | Filtre dashboard |

### Contraintes
- `user_id` : ON DELETE CASCADE
- `number` : UNIQUE par tenant (si multi-tenant)

### Seeders requis
- [ ] Seeder de test avec 10 factures par user
```

## Andon (STOP)

::: danger Conditions bloquantes
- Entité sans clé primaire définie
- Relation sans FK (intégrité référentielle manquante)
- Colonne nullable sans justification métier
- Index manquant sur FK ou colonne de filtre fréquent
- Migration destructive sans plan de rollback
:::

## Checklist Done

```markdown
- [ ] Toutes les entités identifiées et nommées (snake_case pluriel)
- [ ] Relations définies avec cardinalités
- [ ] Migrations rédigées (types, contraintes)
- [ ] FK avec comportement ON DELETE défini
- [ ] Indices sur FK et colonnes de recherche
- [ ] Colonnes nullable justifiées
- [ ] Seeders de test prévus
- [ ] Rollback possible (down() fonctionnel)
```

## Exemple minimal

```markdown
## Domain Model: Module Devis

### Entités

| Entité | Table | Description |
|--------|-------|-------------|
| Quote | quotes | Devis commercial |
| QuoteLine | quote_lines | Ligne de devis |

### Relations

```
Client 1──* Quote 1──* QuoteLine
```

### Migrations

#### `create_quotes_table`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | bigIncrements | PK |
| client_id | foreignId | FK clients, cascade |
| reference | string(30) | unique |
| valid_until | date | nullable |
| status | enum | draft, sent, accepted, rejected |

#### `create_quote_lines_table`
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | bigIncrements | PK |
| quote_id | foreignId | FK quotes, cascade |
| description | string(255) | |
| quantity | integer | default 1 |
| unit_price | decimal(10,2) | |

#### Indices
| Table | Colonnes | Type | Justification |
|-------|----------|------|---------------|
| quotes | client_id | index | Liste devis client |
| quotes | status | index | Filtre par statut |
| quote_lines | quote_id | index | FK lookup |
```

## Référence

Voir [Setup Laravel + Next.js](/guides/laravel-next-setup) pour la configuration initiale.
