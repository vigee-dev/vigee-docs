# Frontend Integration Contract Agent

Définit l'intégration côté Next.js : data fetching, gestion du cache, états d'erreur et formulaires.

## Quand l'utiliser

- Nouvelle page ou composant consommant l'API
- Ajout d'un formulaire avec soumission API
- Modification du comportement de cache
- Gestion d'états de chargement/erreur

## Quand ne pas l'utiliser

- Composant purement UI sans données
- Modification de style uniquement
- Refactoring interne sans changement d'interface

## Entrées requises

| Entrée | Source |
|--------|--------|
| API Contract | Endpoints, formats response |
| Maquette/Wireframe | Écrans, interactions |
| Auth côté front | Token storage, refresh |
| Stack Next.js | App Router, fetch natif |

## Sortie attendue

```markdown
## Frontend Contract: [Nom du module]

### Pages/Composants

| Composant | Route | API consommée |
|-----------|-------|---------------|
| InvoiceList | /invoices | GET /api/v1/invoices |
| InvoiceDetail | /invoices/[id] | GET /api/v1/invoices/{id} |
| InvoiceForm | /invoices/new | POST /api/v1/invoices |

### Data Fetching

#### InvoiceList
```typescript
// Fetch côté serveur (RSC) ou client selon besoin
const response = await fetch(`${API_URL}/invoices?page=${page}`, {
  headers: { Authorization: `Bearer ${token}` },
  next: { revalidate: 60 } // Cache 60s
});
```

**Cache strategy :**
- Liste : `revalidate: 60` (stale-while-revalidate)
- Détail : `revalidate: 0` ou `no-store` si données critiques

### États UI

| État | Comportement |
|------|--------------|
| Loading | Skeleton ou spinner |
| Empty | Message "Aucune facture" + CTA |
| Error 401 | Redirect vers /login |
| Error 403 | Message "Accès refusé" |
| Error 500 | Message générique + retry |

### Formulaires

#### InvoiceForm
| Champ | Type | Validation front |
|-------|------|------------------|
| number | text | required, max 20 |
| amount | number | required, min 0 |
| status | select | required |

**Soumission :**
```typescript
const res = await fetch(`${API_URL}/invoices`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify(data)
});

if (!res.ok) {
  const error = await res.json();
  // Afficher errors.field pour validation 422
}
```

### Gestion des erreurs API

| Code | Action |
|------|--------|
| 422 | Afficher erreurs par champ |
| 401 | Clear token, redirect /login |
| 403 | Toast "Action non autorisée" |
| 500 | Toast "Erreur serveur" + log |

### Conventions Next.js (Vigee)

#### Cache strategy
| Donnée | Stratégie | Raison |
|--------|-----------|--------|
| Listes peu changeantes | `revalidate: 60` | Stale-while-revalidate |
| Données user-specific | `no-store` | Toujours fraîches |
| Config/référentiels | `revalidate: 3600` | Quasi-statique |
| Après mutation | `revalidatePath()` | Invalidation immédiate |

#### Gestion d'erreurs
| Niveau | Mécanisme |
|--------|-----------|
| Page | `error.tsx` boundary |
| Composant | try/catch + état local |
| Global | Toast + logging client |

#### Formulaires
| Pattern | Usage |
|---------|-------|
| Optimistic UI | Actions réversibles (toggle, like) |
| Standard submit | Création/modification critique |
| Idempotence | Toujours (éviter double submit) |
```

## Andon (STOP)

::: danger Conditions bloquantes
- Pas de gestion d'état loading (UX bloquée)
- Pas de gestion d'erreur 401 (session expirée ignorée)
- Formulaire sans validation côté client
- Token stocké en localStorage sans refresh logic
- Pas de feedback utilisateur sur soumission
:::

## Checklist Done

```markdown
- [ ] Tous les composants identifiés avec leur route
- [ ] Stratégie de cache définie par endpoint
- [ ] États loading/empty/error gérés
- [ ] Formulaires avec validation client
- [ ] Gestion des erreurs API (401, 403, 422, 500)
- [ ] Token management documenté
- [ ] Feedback utilisateur (toast, redirect, message)
```

## Exemple minimal

```markdown
## Frontend Contract: Page Détail Facture

### Pages/Composants

| Composant | Route | API consommée |
|-----------|-------|---------------|
| InvoiceDetail | /invoices/[id] | GET /api/v1/invoices/{id} |
| DownloadPdfButton | - | GET /api/v1/invoices/{id}/pdf |

### Data Fetching

```typescript
// app/invoices/[id]/page.tsx
export default async function InvoicePage({ params }) {
  const res = await fetch(`${API_URL}/invoices/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store' // Données toujours fraîches
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Erreur chargement facture');
  }

  const invoice = await res.json();
  return <InvoiceView invoice={invoice.data} />;
}
```

### États UI

| État | Comportement |
|------|--------------|
| Loading | Skeleton card |
| 404 | Page Next.js not-found |
| 403 | Message "Facture inaccessible" |
```

## Référence

Voir [Setup Laravel + Next.js](/guides/laravel-next-setup) pour la configuration CORS et auth.
