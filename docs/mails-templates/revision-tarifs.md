# Révision annuelle des tarifs

Template pour notifier la révision annuelle des conditions tarifaires.

## Objet

```
Révision annuelle des conditions tarifaires de votre contrat de maintenance
```

## Contenu

```
Bonjour [PRENOM],

Conformément aux dispositions de votre contrat de maintenance signé avec Vigee, et notamment à la clause de révision annuelle prévue en Annexe 2, nous vous informons de la mise à jour des conditions tarifaires applicables à compter du [DATE_EFFET].


NOUVEAUX TARIFS APPLICABLES :

• Tarif horaire hors forfait : [NOUVEAU_TARIF_HORAIRE] € HT/heure (au lieu de [ANCIEN_TARIF_HORAIRE] € HT/heure)
• Frais d'hébergement annuel : [NOUVEAU_TARIF_HEBERGEMENT] € HT (au lieu de [ANCIEN_TARIF_HEBERGEMENT] € HT)


Cette révision reflète l'évolution des coûts liés à l'infrastructure, à la sécurité des environnements déployés, ainsi qu'à la montée en compétence continue de notre équipe afin de garantir un niveau d'intervention optimal.

L'ensemble des autres conditions de votre contrat, y compris la redevance annuelle forfaitaire et les modalités de paiement, demeurent inchangées pour le moment.


MODALITÉS DE RÉSILIATION :

Comme prévu contractuellement, vous pouvez décider de ne pas reconduire le contrat à son échéance annuelle. Toute résiliation devra nous être notifiée par écrit au plus tard le [DATE_LIMITE_PREAVIS], soit trois mois avant le renouvellement automatique prévu au [DATE_RENOUVELLEMENT].

Sans retour de votre part avant cette date, la reconduction du contrat avec les nouvelles conditions sera réputée acceptée.


Nous restons naturellement à votre disposition pour tout échange ou question complémentaire.

Bien cordialement,
Romain
```

## Variables à remplacer

| Variable | Description | Exemple |
|----------|-------------|---------|
| `[PRENOM]` | Prénom du destinataire | Jean |
| `[DATE_EFFET]` | Date d'application des nouveaux tarifs | 1er janvier 2026 |
| `[NOUVEAU_TARIF_HORAIRE]` | Nouveau tarif horaire | 105 |
| `[ANCIEN_TARIF_HORAIRE]` | Ancien tarif horaire | 95 |
| `[NOUVEAU_TARIF_HEBERGEMENT]` | Nouveau tarif hébergement | 360 |
| `[ANCIEN_TARIF_HEBERGEMENT]` | Ancien tarif hébergement | 300 |
| `[DATE_LIMITE_PREAVIS]` | Date limite de préavis (3 mois avant) | 30 septembre 2025 |
| `[DATE_RENOUVELLEMENT]` | Date de renouvellement automatique | 1er janvier 2026 |

## Notes importantes

::: warning Préavis
Le préavis de résiliation est de **3 mois** avant la date de renouvellement.
:::

::: info Clause contractuelle
Cet email fait référence à l'Annexe 2 du contrat de maintenance. S'assurer que cette clause existe bien dans le contrat du client.
:::
