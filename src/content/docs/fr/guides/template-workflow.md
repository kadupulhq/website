---
title: "Utiliser et valider les modèles"
description: "Choisir les identités, prévisualiser les imports et vérifier la propagation sans perdre l’historique RRD."
banner:
  content: "Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Traduction provisoire en attente de relecture linguistique."
---

## Choisir les bonnes définitions

Les modèles d’équipements proposent des modèles de graphiques et des requêtes de données ; les modèles de données définissent les entrées de mesure et le stockage. Dupliquez un modèle proche pour obtenir une identité distincte, puis vérifiez les dépendances partagées. La duplication ne rend pas chaque entrée ou profil référencé indépendant. Conservez un export et une sauvegarde cohérente de la base et des RRD avant de modifier des définitions utilisées. Consultez les concepts de modèles.

## Prévisualiser puis appliquer délibérément

Dans une installation isolée, vérifiez l’origine du XML, les identités de destination et le profil de stockage choisi. Depuis la racine de l’application, prévisualisez le XML de modèle simple :

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

La version actuelle de `main` renvoie un statut non nul pour les entrées illisibles, le XML mal formé et les échecs d’objets enregistrés. Vérifiez aussi diagnostics et résultats par objet ; un import peut modifier des identités existantes. Les imports de paquets ont un chemin distinct d’écriture de fichiers. Consultez l’import et l’export.

## Vérifier les objets dérivés et l’historique

Après application, vérifiez des équipements représentatifs, les correspondances locales des éléments graphiques, les valeurs spécifiques et les mesures collectées. Modifier les associations d’un modèle d’équipement exige une synchronisation distincte. Enregistrer un modèle de données ne remodèle pas les RRD existants ; inspectez le fichier réel avant de modifier le pas, le heartbeat ou la rétention. Arrêtez les processus d’écriture avant une récupération coordonnée et restaurez la sauvegarde cohérente si nécessaire. Consultez les modèles personnalisés et la rétention.

[Concepts de modèles](/fr/concepts/templates/) · [Import et export](/fr/guides/import-and-export-templates/) · [Modèles personnalisés](/fr/guides/create-custom-templates/) · [Rétention](/fr/guides/manage-data-retention/)

Base applicative vérifiée le 26 octobre 2026 : [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
