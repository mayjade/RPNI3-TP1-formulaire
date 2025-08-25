# <!-- VOTRE NOM ICI --> - TP1 - Formulaire

<!-- 
Ce fichier README.md est une documentation de base permettant de vous orienter dans la configuration idéale de votre projet.

Si vous souhaitez changer quelque chose, n'hésitez pas à le faire, mais DOCUMENTEZ-LE!
-->

Ce projet utilise Sass pour la compilation des feuilles de style. Suivez les instructions ci-dessous pour configurer votre environnement de développement.

## Prérequis

### Installation de Sass globalement

Avant de commencer, assurez-vous d'avoir Sass installé globalement sur votre système :

```bash
npm install -g sass
```

Vérifiez que l'installation s'est bien faite en exécutant :

```bash
sass --version
```

## Installation des dépendances

Installez toutes les dépendances du projet avec npm en portant attention à bien être dans votre dossier de projet dans la ligne de commande :

```bash
npm install
```

## Scripts Sass

### Script de compilation en continu (watch)

Pour surveiller automatiquement les modifications de vos fichiers Sass et les recompiler en temps réel, utilisez le script de compilation en continu :

```bash
npm run watch
```

Ce script :
- Surveille tous les fichiers `.scss` dans le répertoire source
- Recompile automatiquement les fichiers CSS dès qu'une modification est détectée
- Affiche les erreurs de compilation dans le terminal

### Script de compilation finale (build)

Pour compiler une seule fois tous les fichiers Sass en production, utilisez le script de compilation finale :

```bash
npm run build
```

Ce script :
- Compile tous les fichiers Sass vers CSS
- Optimise le code CSS pour la production
- Génère les fichiers CSS finaux dans le répertoire de sortie
- À utiliser avant le déploiement
- Les fichiers générés ne doivent PAS faire partie de votre dépôt GIT afin d'éviter les conflits, mais devraient être facilement recréés intégralement par n'importe qui suivant cette procédure grâce aux fichiers source

## Structure des fichiers recommandée

```
projet/
├── src/
│   └── scss/
│       ├── styles.scss
│       ├── components/
│       ├── layouts/
│       └── utilities/
├── public/
│   └── css
└── package.json
```

## Dépannage

Si vous rencontrez des problèmes :

1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez que Sass est installé globalement : `sass --version`
3. Supprimez `node_modules` et réinstallez via `npm install`
4. Vérifiez que les scripts sont correctement définis dans `package.json`