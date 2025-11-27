# Problèmes Courants

## Installation

### pnpm install échoue

**Symptôme** : Erreur lors de `pnpm install`

**Solutions** :
```bash
# Nettoyer le cache pnpm
pnpm store prune

# Supprimer node_modules et réinstaller
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erreur "shamefully-hoist"

**Symptôme** : Dépendances non trouvées

**Solution** : Vérifier `.npmrc` à la racine :
```ini
shamefully-hoist=true
public-hoist-pattern[]=*
```

## Développement

### Le backend Laravel ne démarre pas

**Symptôme** : `php artisan serve` échoue

**Solutions** :
```bash
# Vérifier la version PHP
php -v  # Doit être >= 8.2

# Installer les dépendances
cd apps/api
composer install

# Vérifier le .env
cp .env.example .env
php artisan key:generate
```

### Hot reload ne fonctionne pas (Next.js)

**Symptôme** : Les changements ne s'affichent pas

**Solutions** :
```bash
# Supprimer le cache Next.js
rm -rf apps/web/.next

# Relancer le dev server
pnpm dev:web
```

## Déploiement

### GitHub Actions échoue

**Symptôme** : Le workflow échoue

**Vérifications** :
1. Secrets GitHub configurés ?
2. Paths corrects dans le workflow ?
3. Permissions SSH valides ?

### Vercel build échoue

**Symptôme** : Build error sur Vercel

**Vérifications** :
1. Root Directory = `apps/web` ?
2. "Include files outside root directory" activé ?
3. Variables d'environnement configurées ?

## Base de données

### Migrations échouent

**Symptôme** : `php artisan migrate` échoue

**Solutions** :
```bash
# Vérifier la connexion
php artisan db:show

# Réinitialiser les migrations (ATTENTION: perte de données)
php artisan migrate:fresh

# Rollback dernière migration
php artisan migrate:rollback
```
