# GitHub Actions - Initialisation serveur

Guide pour initialiser un projet sur le serveur distant afin que les GitHub Actions fonctionnent correctement.

## 1. Connexion au serveur VIGEE

```bash
ssh -p 65002 u336870814@89.117.168.213
```

Mot de passe : `SSH+Vigee23571113`

## 2. Aller dans le dossier

| Environnement | Commande |
|---------------|----------|
| DEV | `cd domains/vigee.app/public_html` |
| PROD | `cd domains/vigee.tech/public_html` |

## 3. Initialiser le projet Git

```bash
git clone git@github.com:vigee-dev/[NOM_DU_PROJET].git
cd [NOM_DU_PROJET]
git checkout dev  # ou main selon l'environnement
```

## 4. Configurer le fichier .env en base64

1. **Localement**, dans le projet, encoder le `.env` :
   ```bash
   base64 < .env.dev
   ```

2. **Sur GitHub** :
   - Aller dans le projet → **Settings** → **Secrets and Variables** → **Actions**
   - Créer une clé `ENV_DEV_BASE64` avec la valeur encodée

::: tip
C'est cette clé qui sera utilisée par la GitHub Action pour recréer automatiquement le `.env` lors des push.
:::

## 5. Installer les dépendances (si besoin)

```bash
~/composer2 install
```

## 6. Appliquer les migrations (DEV uniquement)

```bash
php artisan migrate:fresh --seed
```

::: warning
Ne jamais faire `migrate:fresh` en production !
:::

## 7. Configurer la clé SSH

Ajouter la clé SSH dans GitHub :
- Aller dans **Settings** → **Secrets and Variables** → **Actions**
- Créer un secret `SSH_PROD_PRIVATE_KEY` avec la clé privée

## 8. Créer le sous-domaine sur Hostinger

1. Aller dans **Noms de Domaine** → **Sous-domaines**
2. Créer le sous-domaine, par exemple : `monprojet.vigee.app`
3. Pointer vers le dossier `/monprojet/public`

::: warning Attention
Hostinger crée automatiquement un fichier `default.php` qu'il faut supprimer via SSH ou FileZilla.
:::

## Checklist

- [ ] Cloner le projet sur le serveur
- [ ] Checkout sur la bonne branche (dev/main)
- [ ] Encoder le `.env` en base64
- [ ] Ajouter `ENV_DEV_BASE64` dans GitHub Secrets
- [ ] Ajouter `SSH_PROD_PRIVATE_KEY` dans GitHub Secrets
- [ ] Installer les dépendances avec composer2
- [ ] Lancer les migrations (DEV seulement)
- [ ] Créer le sous-domaine sur Hostinger
- [ ] Supprimer le fichier `default.php`
