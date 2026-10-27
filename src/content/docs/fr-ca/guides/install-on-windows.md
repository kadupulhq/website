---
title: "Installer depuis un hôte Windows"
description: "Évaluer Kadupul sous Linux hébergé par Windows et comprendre les obstacles au mode natif Windows."
banner:
  content: "Kadupul est en pré-alpha. Cette procédure de plateforme n’a pas été validée de bout en bout. Traduction provisoire en attente de relecture linguistique."
---

## Choisir l’environnement d’exécution

La version actuelle de `main` exige PHP 8.4+, `pcntl` et `posix`; PHP natif Windows ne satisfait pas ces exigences Unix. Ne contournez pas les vérifications de plateforme de Composer. Utilisez une VM Linux ou évaluez WSL 2 sur une version Windows prise en charge par Microsoft. Il s’agit d’installations Linux hébergées par Windows, pas de déploiements IIS natifs validés. Consultez les limites de PHP.

## Préparer Linux puis installer

Pour WSL, exécutez ceci dans PowerShell administrateur et redémarrez si demandé :

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Confirmez la version 2. Terminez la création du compte Linux puis suivez l’installation dans Linux pour la base, les extensions PHP, les ressources, le serveur web et l’ordonnanceur. Gardez code et stockage RRD dans le système de fichiers Linux, hors de `/mnt/c/`. Consultez les guides Microsoft sur WSL et les systèmes de fichiers.

## Vérifier le cycle de vie et la récupération

Utilisez des comptes dédiés non privilégiés et un seul lancement de collecte. Vérifiez la confiance du stockage, la collecte, les horodatages graphiques et le redémarrage après un redémarrage de l’hôte ou un arrêt de WSL. Une session de bureau ne garantit pas une collecte continue. Sauvegardez ensemble base, configuration et RRD. La maintenance destructive des RRD et la purge ou l’archivage local automatique restent indisponibles sous Windows natif; le comportement Linux ne les valide pas. Consultez les exigences et la sauvegarde.

[Limites de PHP](https://www.php.net/manual/en/pcntl.installation.php) · [Installation](/fr-ca/start/install/) · [Guide WSL Microsoft](https://learn.microsoft.com/en-us/windows/wsl/install) · [Systèmes de fichiers](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Exigences](/fr-ca/reference/requirements/) · [Sauvegarde](/fr-ca/guides/back-up-and-restore/)

Base applicative vérifiée le 26 octobre 2026 : [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
