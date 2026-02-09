# Quality Gate Agent

Vérifie la qualité : tests PHPUnit côté Laravel, tests MCP Chrome DevTools côté Next.js.

## Quand l'utiliser

- Avant chaque merge/PR
- Après implémentation d'une feature
- Après correction de bug
- Refactoring significatif

## Quand ne pas l'utiliser

- Modification de documentation uniquement
- Changement de configuration sans impact code
- Assets statiques (images, fonts)

## Entrées requises

| Entrée | Source |
|--------|--------|
| Feature Spec | Critères d'acceptation |
| Code implémenté | Fichiers modifiés |
| Tests existants | `/tests` Laravel, `/tests/mcp/scenarios` Next.js |
| Coverage actuel | Rapport PHPUnit + scénarios MCP |

## Sortie attendue

```markdown
## Quality Gate: [Nom du module]

### Tests Backend (Laravel)

| Type | Fichier | Statut | Coverage |
|------|---------|--------|----------|
| Unit | InvoiceServiceTest | OK/KO | 85% |
| Feature | InvoiceControllerTest | OK/KO | 90% |

#### Tests requis
```php
// tests/Feature/InvoiceControllerTest.php
public function test_user_can_list_own_invoices()
public function test_user_cannot_access_other_invoices()
public function test_invoice_creation_validates_input()
public function test_invoice_creation_returns_resource()
```

### Tests Frontend (MCP Chrome DevTools)

| Test | Fichier | Statut |
|------|---------|--------|
| Liste factures | 07-invoices.md (S1) | OK/KO |
| Formulaire création | 07-invoices.md (S2) | OK/KO |

#### Scénarios requis
```markdown
// tests/mcp/scenarios/07-invoices.md

## S1 — Liste des factures
1. Naviguer vers /invoices
2. Vérifier que la liste s'affiche avec pagination
3. Filtrer par statut → vérifier le filtrage

## S2 — Création de facture
1. Cliquer sur "Créer une facture"
2. Remplir le formulaire → valider
3. Vérifier le toast de confirmation
```

### Couverture

| Cible | Actuel | Minimum |
|-------|--------|---------|
| Backend | 75% | 70% |
| Frontend | 60% | 50% |

### Actions correctives
- [ ] [Test manquant à ajouter]

### Verdict
[PASS | FAIL]
```

## Andon (STOP)

::: danger Conditions bloquantes
- Aucun test pour la nouvelle feature
- Test existant cassé (régression)
- Couverture en dessous du minimum
- Critère d'acceptation non testé
- Test qui passe en local mais échoue en CI
:::

## Checklist Done

```markdown
- [ ] Tests unitaires pour services/logique métier
- [ ] Tests feature pour endpoints API
- [ ] Tests E2E pour parcours utilisateur critique
- [ ] Tous les critères d'acceptation couverts
- [ ] Pas de test ignoré (@skip) sans justification
- [ ] Tests passent en local ET en CI
- [ ] Couverture >= seuil minimum
- [ ] Pas de régression sur tests existants
```

## Exemple minimal

```markdown
## Quality Gate: Export PDF Facture

### Tests Backend (Laravel)

| Type | Fichier | Statut | Coverage |
|------|---------|--------|----------|
| Feature | InvoicePdfExportTest | OK | 100% |

#### Tests requis
```php
// tests/Feature/InvoicePdfExportTest.php
public function test_owner_can_download_invoice_pdf()
{
    $user = User::factory()->create();
    $invoice = Invoice::factory()->for($user)->create();

    $response = $this->actingAs($user)
        ->get("/api/v1/invoices/{$invoice->id}/pdf");

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/pdf');
}

public function test_non_owner_cannot_download_invoice_pdf()
{
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $invoice = Invoice::factory()->for($owner)->create();

    $response = $this->actingAs($other)
        ->get("/api/v1/invoices/{$invoice->id}/pdf");

    $response->assertForbidden();
}
```

### Tests Frontend (MCP Chrome DevTools)

| Test | Fichier | Statut |
|------|---------|--------|
| Téléchargement PDF | 07-invoices.md (S3) | OK |

#### Scénarios requis
```markdown
// tests/mcp/scenarios/07-invoices.md

## S3 — Téléchargement PDF

### Prérequis
- Facture existante dans la liste

### Actions
1. Naviguer vers la facture /invoices/1
2. Cliquer sur le bouton "Télécharger PDF"

### Attendu
- Téléchargement déclenché
- Fichier .pdf généré
```

### Verdict
PASS
```

## Référence

Voir [Déploiement](/guides/deployment) pour la configuration CI/CD.
