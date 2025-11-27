# Configurer un pnpm Workspace

Guide pour configurer un workspace pnpm avec un design system partagé.

## 1. Créer le fichier pnpm-workspace.yaml

À la racine du projet, créer un fichier `pnpm-workspace.yaml` :

```yaml
packages:
  - vigee-designsystem
```

## 2. Nettoyer les dépendances existantes

Supprimer tous les `package-lock.json` et `node_modules` du projet et du design system :

```bash
# À la racine
rm -rf node_modules package-lock.json

# Dans le design system
rm -rf vigee-designsystem/node_modules vigee-designsystem/package-lock.json
```

## 3. Réinstaller les dépendances

Depuis la racine du projet :

```bash
pnpm install
```

Toutes les dépendances du workspace seront installées.

## Installer des dépendances

### Dans le workspace principal

Par défaut, pnpm refuse d'installer dans la racine d'un workspace. Il faut ajouter `-w` :

```bash
pnpm add lodash -w
```

### Dans un package spécifique

```bash
pnpm add lodash --filter vigee-designsystem
```

## Éviter le flag -w à chaque fois

Pour ne plus avoir à ajouter `-w` à chaque installation dans le workspace principal, créer un fichier `.npmrc` à la racine :

```ini
ignore-workspace-root-check=true
```

Ensuite, tu peux simplement faire :

```bash
pnpm add lodash
```

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `pnpm install` | Installe toutes les dépendances du workspace |
| `pnpm add <pkg> -w` | Ajoute une dépendance à la racine |
| `pnpm add <pkg> --filter <workspace>` | Ajoute une dépendance à un package |
| `pnpm -r run build` | Exécute `build` dans tous les packages |
| `pnpm --filter <workspace> run dev` | Exécute une commande dans un package spécifique |

## Structure type

```
mon-projet/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .npmrc
├── node_modules/
└── vigee-designsystem/
    ├── package.json
    └── src/
```
