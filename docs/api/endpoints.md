# API Endpoints

Documentation des endpoints de l'API Vigee.

## Base URL

| Environnement | URL |
|---------------|-----|
| Development | `http://localhost:8000/api` |
| Staging | `https://api-staging.vigee.com/api` |
| Production | `https://api.vigee.com/api` |

## Authentification

L'API utilise des tokens Bearer pour l'authentification.

```bash
curl -H "Authorization: Bearer {token}" https://api.vigee.com/api/endpoint
```

## Endpoints

::: info À compléter
Documenter ici les endpoints spécifiques de votre API.
:::

### Exemple de structure

```
GET    /api/users           # Liste des utilisateurs
GET    /api/users/{id}      # Détail d'un utilisateur
POST   /api/users           # Créer un utilisateur
PUT    /api/users/{id}      # Mettre à jour un utilisateur
DELETE /api/users/{id}      # Supprimer un utilisateur
```
