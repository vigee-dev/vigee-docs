# Standards de Code

## TypeScript / Next.js

### Règles générales

- **Pas de `any`** : Toujours typer correctement
- **ESLint** : Respecter les règles configurées
- **Prettier** : Formatage automatique

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase avec `use` | `useAuth.ts` |
| Utilitaires | camelCase | `formatDate.ts` |
| Types/Interfaces | PascalCase | `UserData` |

### Structure des composants

```tsx
// 1. Imports
import { useState } from 'react'

// 2. Types
interface Props {
  title: string
  onAction: () => void
}

// 3. Composant
export function MyComponent({ title, onAction }: Props) {
  // 4. Hooks
  const [state, setState] = useState(false)

  // 5. Handlers
  const handleClick = () => {
    onAction()
  }

  // 6. Render
  return (
    <div onClick={handleClick}>
      {title}
    </div>
  )
}
```

## PHP / Laravel

### Règles générales

- **PSR-12** : Standard de formatage
- **PHPStan** : Analyse statique niveau 8
- **Strict types** : `declare(strict_types=1);`

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Classes | PascalCase | `UserController` |
| Méthodes | camelCase | `getActiveUsers()` |
| Variables | camelCase | `$userCount` |
| Constantes | UPPER_SNAKE | `MAX_RETRIES` |

### Structure des contrôleurs

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

final class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::all();

        return response()->json($users);
    }
}
```
