# Route dédiée Logs pour Agent Vigee

Cette documentation explique comment configurer une route d'accès aux logs dans vos projets clients pour permettre à l'agent de résolution automatique Vigee d'analyser les erreurs de production.

## Pourquoi cette route ?

L'agent Vigee peut résoudre automatiquement les tickets de support en analysant :
- Le code source (via GitHub)
- **Les logs de production** (via cette route)

Sans accès aux logs, l'agent ne peut pas diagnostiquer les erreurs runtime, les stack traces, ou les problèmes de configuration.

## Sécurité

::: warning Important
Cette route expose des informations sensibles. Elle doit être :
- Protégée par une clé API unique
- Limitée en volume de données retournées
- Filtrée pour exclure les données sensibles (passwords, tokens, etc.)
:::

---

## Implémentation Laravel

### 1. Créer le Controller

```php
<?php
// app/Http/Controllers/Api/VigeeLogController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;

class VigeeLogController extends Controller
{
    /**
     * Retourne les erreurs récentes des logs Laravel
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getErrors(Request $request): JsonResponse
    {
        // Paramètres avec valeurs par défaut sécurisées
        $hours = min($request->get('hours', 24), 72); // Max 72h
        $limit = min($request->get('limit', 100), 500); // Max 500 entrées
        $level = $request->get('level', 'error'); // error, warning, info

        $logPath = storage_path('logs/laravel.log');

        if (!File::exists($logPath)) {
            return response()->json([
                'errors' => [],
                'message' => 'No log file found'
            ]);
        }

        $errors = $this->parseLogFile($logPath, $hours, $limit, $level);

        return response()->json([
            'errors' => $errors,
            'count' => count($errors),
            'period_hours' => $hours,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Parse le fichier de log et extrait les erreurs récentes
     */
    private function parseLogFile(string $path, int $hours, int $limit, string $level): array
    {
        $content = File::get($path);
        $errors = [];
        $cutoffTime = Carbon::now()->subHours($hours);

        // Pattern pour les entrées de log Laravel
        $pattern = '/\[(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^\]]*)\]\s+\w+\.(\w+):\s+(.*?)(?=\[\d{4}-\d{2}-\d{2}|\z)/s';

        preg_match_all($pattern, $content, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            try {
                $timestamp = Carbon::parse($match[1]);
                $logLevel = strtolower($match[2]);
                $message = trim($match[3]);

                // Filtrer par date
                if ($timestamp->lt($cutoffTime)) {
                    continue;
                }

                // Filtrer par niveau
                if (!$this->matchesLevel($logLevel, $level)) {
                    continue;
                }

                // Nettoyer les données sensibles
                $message = $this->sanitizeMessage($message);

                $errors[] = [
                    'timestamp' => $timestamp->toISOString(),
                    'level' => $logLevel,
                    'message' => $this->truncateMessage($message, 2000),
                ];

                if (count($errors) >= $limit) {
                    break;
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        // Trier par date décroissante (plus récent en premier)
        usort($errors, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        return $errors;
    }

    /**
     * Vérifie si le niveau de log correspond au filtre
     */
    private function matchesLevel(string $logLevel, string $filterLevel): bool
    {
        $levels = ['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'];
        $filterIndex = array_search($filterLevel, $levels);
        $logIndex = array_search($logLevel, $levels);

        return $logIndex !== false && $filterIndex !== false && $logIndex >= $filterIndex;
    }

    /**
     * Supprime les données sensibles du message
     */
    private function sanitizeMessage(string $message): string
    {
        // Masquer les passwords
        $message = preg_replace('/password["\']?\s*[=:]\s*["\']?[^"\'\s,}]+/i', 'password=***REDACTED***', $message);

        // Masquer les tokens
        $message = preg_replace('/token["\']?\s*[=:]\s*["\']?[^"\'\s,}]+/i', 'token=***REDACTED***', $message);

        // Masquer les clés API
        $message = preg_replace('/api[_-]?key["\']?\s*[=:]\s*["\']?[^"\'\s,}]+/i', 'api_key=***REDACTED***', $message);

        // Masquer les secrets
        $message = preg_replace('/secret["\']?\s*[=:]\s*["\']?[^"\'\s,}]+/i', 'secret=***REDACTED***', $message);

        // Masquer les Bearer tokens
        $message = preg_replace('/Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/i', 'Bearer ***REDACTED***', $message);

        return $message;
    }

    /**
     * Tronque le message si trop long
     */
    private function truncateMessage(string $message, int $maxLength): string
    {
        if (strlen($message) <= $maxLength) {
            return $message;
        }

        return substr($message, 0, $maxLength) . '... [TRUNCATED]';
    }
}
```

### 2. Créer le Middleware d'authentification

```php
<?php
// app/Http/Middleware/VigeeAgentAuth.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VigeeAgentAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-Vigee-Api-Key');
        $expectedKey = config('services.vigee.logs_api_key');

        if (!$expectedKey) {
            return response()->json([
                'error' => 'Vigee logs API not configured'
            ], 503);
        }

        if (!$apiKey || !hash_equals($expectedKey, $apiKey)) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 401);
        }

        return $next($request);
    }
}
```

### 3. Enregistrer le Middleware

```php
// bootstrap/app.php (Laravel 11+)
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'vigee.agent' => \App\Http\Middleware\VigeeAgentAuth::class,
    ]);
})

// OU app/Http/Kernel.php (Laravel 10 et moins)
protected $middlewareAliases = [
    // ...
    'vigee.agent' => \App\Http\Middleware\VigeeAgentAuth::class,
];
```

### 4. Ajouter la Route

```php
// routes/api.php

use App\Http\Controllers\Api\VigeeLogController;

Route::middleware('vigee.agent')
    ->prefix('vigee')
    ->group(function () {
        Route::get('/logs', [VigeeLogController::class, 'getErrors']);
    });
```

### 5. Configuration

```php
// config/services.php

return [
    // ...

    'vigee' => [
        'logs_api_key' => env('VIGEE_LOGS_API_KEY'),
    ],
];
```

```env
# .env

# Générer avec: openssl rand -hex 32
VIGEE_LOGS_API_KEY=votre_cle_api_secrete_ici
```

---

## Implémentation Next.js (si logs custom)

Pour les projets Next.js avec système de logs custom (pas Vercel) :

```typescript
// app/api/vigee/logs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  // Vérifier la clé API
  const apiKey = request.headers.get('X-Vigee-Api-Key');

  if (apiKey !== process.env.VIGEE_LOGS_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const hours = Math.min(parseInt(searchParams.get('hours') || '24'), 72);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);

  try {
    const logPath = path.join(process.cwd(), 'logs', 'error.log');
    const content = await fs.readFile(logPath, 'utf-8');

    // Parser et filtrer les logs...
    const errors = parseLogContent(content, hours, limit);

    return NextResponse.json({
      errors,
      count: errors.length,
      period_hours: hours,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      errors: [],
      message: 'No log file found or error reading logs',
    });
  }
}

function parseLogContent(content: string, hours: number, limit: number) {
  // Implémenter le parsing selon votre format de logs
  return [];
}
```

---

## Configuration côté Vigee Flow

Une fois la route configurée dans votre projet client, renseignez les informations dans Vigee Flow :

1. Aller dans **Projets** > Sélectionner le projet
2. Onglet **Paramètres** ou **Intégrations**
3. Section **Agent de résolution**
4. Remplir :
   - **URL des logs** : `https://api.votreprojet.com/api/vigee/logs`
   - **Clé API** : La clé générée avec `openssl rand -hex 32`

---

## Test de la route

```bash
# Tester la route
curl -X GET "https://api.votreprojet.com/api/vigee/logs?hours=24&limit=50" \
  -H "X-Vigee-Api-Key: votre_cle_api"

# Réponse attendue
{
  "errors": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "level": "error",
      "message": "SQLSTATE[23000]: Integrity constraint violation..."
    }
  ],
  "count": 1,
  "period_hours": 24,
  "generated_at": "2024-01-15T12:00:00.000Z"
}
```

---

## Paramètres de requête

| Paramètre | Type | Défaut | Max | Description |
|-----------|------|--------|-----|-------------|
| `hours` | int | 24 | 72 | Période de temps à analyser |
| `limit` | int | 100 | 500 | Nombre max d'entrées |
| `level` | string | error | - | Niveau minimum (error, warning, info) |

---

## Support des logs Daily

::: tip Configuration LOG_STACK=daily
Si votre projet Laravel utilise `LOG_STACK=daily` (fichiers `laravel-YYYY-MM-DD.log`), adaptez le controller pour rechercher dans plusieurs fichiers :
:::

```php
/**
 * Récupère les fichiers de log pertinents (daily + standard)
 */
private function getLogFiles(int $hours): array
{
    $logPath = storage_path('logs');
    $files = [];

    // Fichier standard laravel.log
    $standardLog = $logPath.'/laravel.log';
    if (file_exists($standardLog)) {
        $files[] = $standardLog;
    }

    // Fichiers daily (laravel-YYYY-MM-DD.log)
    $daysToCheck = (int) ceil($hours / 24) + 1;
    for ($i = 0; $i < $daysToCheck; $i++) {
        $date = Carbon::now()->subDays($i)->format('Y-m-d');
        $dailyLog = $logPath.'/laravel-'.$date.'.log';
        if (file_exists($dailyLog)) {
            $files[] = $dailyLog;
        }
    }

    return array_unique($files);
}
```

Puis dans `getErrors()`, itérez sur les fichiers :

```php
$logFiles = $this->getLogFiles($hours);
$errors = [];

foreach ($logFiles as $logFile) {
    $fileErrors = $this->parseLogFile($logFile, $hours, $limit - count($errors), $level);
    $errors = array_merge($errors, $fileErrors);
    if (count($errors) >= $limit) {
        break;
    }
}
```

---

## Bonnes pratiques

### Sécurité

- Utilisez une clé API unique par projet (pas la même partout)
- Limitez les IP autorisées si possible (whitelist GitHub Actions)
- Activez le rate limiting sur cette route
- Loggez les accès à cette route pour audit

### Performance

- La route doit répondre en < 5 secondes
- Ne lisez pas des fichiers de logs > 100MB
- Implémentez un cache si les logs sont volumineux

### Données sensibles

Le controller fourni masque automatiquement :
- Passwords
- Tokens (Bearer, API keys)
- Secrets

Ajoutez d'autres patterns selon vos besoins métier.
