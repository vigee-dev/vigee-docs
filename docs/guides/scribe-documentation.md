# Documentation API avec Scribe

Générer automatiquement la documentation API et la collection Postman avec [Scribe](https://scribe.knuckles.wtf/laravel/getting-started).

## Installation

```bash
composer require knuckleswtf/scribe
sail artisan vendor:publish --tag=scribe-config
```

## Génération de la documentation

Une fois installée, la doc est disponible sur `/docs` du backend.

```bash
sail artisan scribe:generate
```

## Intégration GitHub Actions

Ajouter dans le workflow de déploiement :

```yaml
- name: Generate Scribe documentation
  run: |
    php artisan scribe:generate
    echo "✅ Doc Scribe générée $(date)"
```

## Format des commentaires PHPDoc

Pour que Scribe génère une documentation complète, ajouter des annotations au-dessus de chaque méthode de controller :

```php
/**
 * @title Créer un utilisateur
 * @group Utilisateurs
 * @bodyParam name string required Le nom de l'utilisateur. Example: John Doe
 * @bodyParam email string required L'email de l'utilisateur. Example: john@example.com
 * @response 201 {
 *   "id": 1,
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "created_at": "2024-01-15T10:30:00Z"
 * }
 * @response 422 {
 *   "message": "The email has already been taken.",
 *   "errors": {
 *     "email": ["The email has already been taken."]
 *   }
 * }
 *
 * Crée un nouvel utilisateur dans le système.
 */
public function store(Request $request)
{
    // ...
}
```

## Annotations disponibles

| Annotation | Description |
|------------|-------------|
| `@title` | Titre court de l'endpoint |
| `@group` | Groupe pour organiser les endpoints |
| `@queryParam` | Paramètre de query string |
| `@bodyParam` | Paramètre du body |
| `@urlParam` | Paramètre dans l'URL |
| `@response` | Exemple de réponse avec code HTTP |
| `@authenticated` | Endpoint nécessitant une authentification |

## Prompt ChatGPT pour reformatter les commentaires

Pour ajouter automatiquement les annotations Scribe à tous les controllers d'un projet Laravel existant :

::: details Prompt complet

```
Pour chaque méthode publique dans mes controllers Laravel qui sert d'endpoint API, ajoute juste au-dessus un commentaire PHPDoc adapté à Scribe, au format suivant :

/**
 * @title [Titre synthétique, en français, décrivant clairement l'action de l'endpoint, par exemple "Créer un utilisateur" ou "Réinitialiser le mot de passe". Reste synthétique pour que ce soit lisible en quelques mots.]
 * @group [Nom du groupe, par exemple "Authentification", "Utilisateurs", etc.]
 * [Liste les éventuels @queryParam si tu arrives à les deviner à partir de la méthode, sinon ne mets rien.]
 * @response 200 [Exemple d'objet JSON renvoyé par le endpoint, déduit à partir de la réponse de la méthode. Génère un exemple complet mais synthétique, réaliste, et formaté proprement. Si la réponse varie selon le statut, indique les principales variantes : 200, 201, 400, 401, 404, etc.]
 *
 * [Description courte et utile du endpoint, ce qu'il fait, ce que renvoie la réponse, et si besoin les cas d'usage.]
 */

Analyse le nom de la méthode, l'URL de la route associée, et le code si besoin pour générer un titre et une description pertinents.
Si le groupe est évident (par exemple AuthController → "Authentification"), utilise-le.
Sinon, propose le groupe logique selon la ressource traitée (ex : UserController → "Utilisateurs").

Génère des commentaires **uniquement pour les méthodes publiques exposées comme endpoints API**.
Évite de commenter les méthodes privées ou d'aide internes.

Travaille sur tout le fichier (ou le projet) et harmonise le style de tous les commentaires.
Travaille sur tous les controllers d'un coup, et arrête toi que lorsque tu as tout terminé sans interruption.
```

:::

## Liens utiles

- [Documentation officielle Scribe](https://scribe.knuckles.wtf/laravel/)
- [Configuration avancée](https://scribe.knuckles.wtf/laravel/reference/config)
