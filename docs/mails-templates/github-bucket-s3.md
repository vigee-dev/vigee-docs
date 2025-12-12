# GitHub + Bucket S3

Template d'instructions pour la création des comptes AWS et GitHub.

## Objet

```
Configuration technique - Création des comptes AWS et GitHub
```

## Contenu

```
Bonjour [PRENOM],

Afin de démarrer la configuration technique de votre application, merci de suivre précisément les étapes ci-dessous. Cela nous permettra d'assurer une mise en place propre et sécurisée, tout en gardant la propriété des comptes à votre nom.


1. CRÉATION DE VOTRE COMPTE AWS

1. Rendez-vous sur ce lien officiel AWS pour créer votre compte : https://aws.amazon.com/
   Utilisez une adresse e-mail professionnelle (idéalement liée à votre société).

2. Lors de la création, vous devrez saisir vos coordonnées et choisir un nom d'utilisateur principal (souvent votre adresse e-mail).
   • Ce nom d'utilisateur principal sera utilisé pour la connexion à AWS.
   • Votre ID de compte est une suite de chiffres (exemple : 257847100215).
   • À noter : ce n'est pas votre identifiant de connexion, mais il sera utile pour certaines démarches.


2. AJOUT DE VOTRE CARTE BANCAIRE SUR AWS

1. Une fois connecté à la console AWS, allez dans le menu en haut à droite, puis sélectionnez "Mon compte AWS" ou accédez directement à : https://console.aws.amazon.com/billing/

2. Dans la rubrique "Facturation", puis "Méthodes de paiement", ajoutez une carte bancaire valide.

3. Cette étape est indispensable pour activer les services AWS (notamment le stockage S3).


3. CRÉATION D'UN UTILISATEUR IAM POUR VIGEE (ROMAIN)

Pour des raisons de sécurité, ne jamais transmettre votre mot de passe principal. Voici la procédure pour m'ajouter comme utilisateur :

1. Accédez à la gestion des utilisateurs IAM : https://console.aws.amazon.com/iamv2/home#/users

2. Cliquez sur "Ajouter un utilisateur".

3. Nom d'utilisateur : saisissez romain.vigee (ou un autre nom si vous préférez, mais notez-le pour moi).

4. Type d'accès :
   • Cochez "Accès à la console de gestion AWS".
   • Créez un mot de passe temporaire (je le changerai à la première connexion).

5. Permissions :
   • Cliquez sur "Attacher des politiques existantes directement".
   • Cochez AmazonS3FullAccess (pour la gestion des fichiers) ou AdministratorAccess (si vous souhaitez me donner un accès global temporairement).

6. Finalisez la création de l'utilisateur.

7. Sur la dernière page, récupérez :
   • Nom d'utilisateur (ex: romain.vigee)
   • Mot de passe temporaire
   • Lien de connexion personnalisé (format : https://[ID_COMPTE].signin.aws.amazon.com/console)


4. INFORMATIONS À ME TRANSMETTRE

Merci de m'envoyer les éléments suivants par retour de mail :

• Nom d'utilisateur AWS créé pour moi (romain.vigee ou autre)
• Mot de passe temporaire
• Lien de connexion personnalisé AWS (exemple : https://257847100215.signin.aws.amazon.com/console)
• Nom d'utilisateur principal AWS (celui utilisé à la création du compte, généralement votre adresse e-mail professionnelle)
• Votre ID de compte AWS (ex : 257847100215)


5. CRÉATION DE VOTRE COMPTE GITHUB

1. Rendez-vous sur https://github.com/signup

2. Créez un compte au nom de la société (évitez les adresses personnelles si possible).

3. Une fois créé, transmettez-moi simplement l'identifiant GitHub ou l'e-mail utilisé, pour que je vous invite sur le dépôt du projet.


6. DÈS RÉCEPTION DE CES ACCÈS…

Je pourrai :
• Paramétrer votre bucket S3 AWS pour le stockage des fichiers.
• Configurer la connexion entre l'application et votre compte GitHub.
• Lancer l'installation technique en toute sécurité.

De notre côté, nous assurons l'hébergement du front et du back, l'envoi d'e-mails automatisés et le stockage des fichiers non personnels.

Le stockage S3 sur votre propre compte AWS est nécessaire pour que vous gardiez la pleine maîtrise de vos documents sensibles : cela garantit la sécurité, la confidentialité et la possibilité de reprendre la main à tout moment.


N'hésitez pas à me solliciter si vous avez besoin d'aide à l'une des étapes, je peux vous guider en visio ou par téléphone.

Merci de me tenir informé dès que tout est en place.

Bien à vous,
Romain
```

## Variables à remplacer

| Variable | Description |
|----------|-------------|
| `[PRENOM]` | Prénom du destinataire |

## Checklist pour le client

- [ ] Compte AWS créé
- [ ] Carte bancaire ajoutée
- [ ] Utilisateur IAM créé pour Vigee
- [ ] Compte GitHub créé
- [ ] Informations transmises à Vigee
