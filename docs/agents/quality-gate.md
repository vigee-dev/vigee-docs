# Quality Gate Agent

Vérifie la qualité : tests PHPUnit côté Laravel, tests Playwright côté Next.js.

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
| Tests existants | `/tests` Laravel, `/e2e` Next.js |
| Coverage actuel | Rapport PHPUnit/Playwright |

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

### Tests Frontend (Playwright)

| Test | Fichier | Statut |
|------|---------|--------|
| Liste factures | invoices.spec.ts | OK/KO |
| Formulaire création | invoice-form.spec.ts | OK/KO |

#### Tests requis
```typescript
// e2e/invoices.spec.ts
test('user sees invoice list')
test('user can filter by status')
test('user can download PDF')
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

### Tests Frontend (Playwright)

| Test | Fichier | Statut |
|------|---------|--------|
| Téléchargement PDF | invoice-pdf.spec.ts | OK |

#### Tests requis
```typescript
// e2e/invoice-pdf.spec.ts
test('download button triggers PDF download', async ({ page }) => {
  await page.goto('/invoices/1');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('[data-testid="download-pdf"]')
  ]);
  expect(download.suggestedFilename()).toContain('.pdf');
});
```

### Verdict
PASS
```

## Référence

Voir [Déploiement](/guides/deployment) pour la configuration CI/CD.
