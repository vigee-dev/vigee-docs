# Observability Gate Agent

Vérifie l'observabilité : logs structurés, corrélation, et gestion des erreurs attendues.

## Quand l'utiliser

- Mise en production d'une nouvelle feature
- Ajout d'intégration avec service externe
- Fonctionnalité critique pour le métier
- Après incident pour améliorer la détection

## Quand ne pas l'utiliser

- Feature mineure sans impact métier
- Modification UI uniquement
- Environnement de développement

## Entrées requises

| Entrée | Source |
|--------|--------|
| Feature Spec | Cas d'erreur métier |
| API Contract | Erreurs attendues |
| Architecture | Services impliqués |
| Outils existants | Laravel logs, Sentry, etc. |

## Sortie attendue

```markdown
## Observability Gate: [Nom du module]

### Logs structurés

| Événement | Niveau | Données loguées |
|-----------|--------|-----------------|
| Invoice created | info | invoice_id, user_id |
| PDF generation failed | error | invoice_id, error_message |
| Payment received | info | invoice_id, amount |

#### Exemple d'implémentation
```php
Log::info('Invoice created', [
    'invoice_id' => $invoice->id,
    'user_id' => $invoice->user_id,
    'amount' => $invoice->total_amount
]);
```

### Corrélation

| Élément | Implémenté | Méthode |
|---------|------------|---------|
| Request ID | Oui/Non | Header X-Request-ID |
| User ID | Oui/Non | Context logger |
| Trace ID | Oui/Non | Si APM en place |

### Erreurs attendues vs inattendues

| Erreur | Type | Action |
|--------|------|--------|
| Facture non trouvée | Attendue | Log warning, return 404 |
| PDF generation timeout | Attendue | Log error, retry queue |
| DB connection lost | Inattendue | Log critical, alerte |

### Alertes (si monitoring en place)

| Condition | Seuil | Action |
|-----------|-------|--------|
| Error rate | > 5% sur 5 min | Notification |
| Response time | > 2s p95 | Notification |

### Dashboards (si applicable)

| Métrique | Visualisation |
|----------|---------------|
| Factures créées/jour | Counter |
| Temps génération PDF | Histogram |

### Actions correctives
- [ ] [Log manquant à ajouter]

### Verdict
[PASS | FAIL]
```

## Andon (STOP)

::: danger Conditions bloquantes
- Action métier critique sans log
- Erreur silencieuse (catch vide)
- Log avec données sensibles (mot de passe, token)
- Pas de distinction erreur attendue/inattendue
- Exception non catchée remontant au client
:::

## Checklist Done

```markdown
- [ ] Actions métier clés loguées (create, update, delete)
- [ ] Niveau de log approprié (info, warning, error)
- [ ] Contexte inclus (IDs, montants, statuts)
- [ ] Pas de donnée sensible dans les logs
- [ ] Erreurs attendues gérées proprement (4xx)
- [ ] Erreurs inattendues loguées avec stack trace
- [ ] Request ID propagé (si applicable)
- [ ] Alertes configurées sur erreurs critiques
```

## Exemple minimal

```markdown
## Observability Gate: Export PDF

### Logs structurés

| Événement | Niveau | Données loguées |
|-----------|--------|-----------------|
| PDF download requested | info | invoice_id, user_id |
| PDF generated | info | invoice_id, duration_ms |
| PDF generation failed | error | invoice_id, error |

#### Implémentation
```php
// InvoicePdfController.php
public function download(Invoice $invoice)
{
    Log::info('PDF download requested', [
        'invoice_id' => $invoice->id,
        'user_id' => auth()->id()
    ]);

    try {
        $startTime = microtime(true);
        $pdf = $this->pdfService->generate($invoice);

        Log::info('PDF generated', [
            'invoice_id' => $invoice->id,
            'duration_ms' => (microtime(true) - $startTime) * 1000
        ]);

        return $pdf->download();
    } catch (PdfGenerationException $e) {
        Log::error('PDF generation failed', [
            'invoice_id' => $invoice->id,
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'message' => 'Impossible de générer le PDF'
        ], 500);
    }
}
```

### Erreurs attendues vs inattendues

| Erreur | Type | Action |
|--------|------|--------|
| Facture non trouvée | Attendue | 404, pas de log error |
| Timeout DomPDF | Attendue | Log error, message user |
| Out of memory | Inattendue | Log critical |

### Verdict
PASS
```

## Outils recommandés

- **Laravel** : Monolog (natif), Laravel Telescope (dev)
- **Centralisation** : Papertrail, Logtail, ou fichiers rotatifs
- **APM** : Sentry, Bugsnag (error tracking)

## Référence

Voir [Route Logs Agent](/guides/route-logs-agent) pour la configuration des logs par route.
