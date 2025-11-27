# Vigee Docs

Documentation technique du projet Vigee, générée avec [VitePress](https://vitepress.dev/).

## Développement local

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm docs:dev
```

Le site sera accessible sur `http://localhost:5173`.

## Build

```bash
pnpm docs:build
```

## Déploiement

Le déploiement sur GitHub Pages est automatique via GitHub Actions lors d'un push sur `main`.

## Structure

```
docs/
├── index.md                    # Page d'accueil
├── guides/                     # Guides et tutoriels
├── architecture/               # Documentation d'architecture
├── api/                        # Documentation API
├── conventions/                # Standards de code
└── troubleshooting/            # Dépannage
```
