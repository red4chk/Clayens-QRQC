# QRQC Digitalization — NP Clayens

Application web de digitalisation du processus **QRQC (Quick Response Quality Control)** utilisé chez **NP Clayens** pour le traitement des non-conformités qualité sur les pièces produites par presses à injection plastique.

L'application remplace la fiche papier QRQC par un outil numérique moderne, structuré et guidé, tout en conservant exactement la logique métier existante.

## Contexte

Lorsqu'un défaut qualité apparaît sur une pièce injectée (bavure, fissure, etc.), les équipes production/qualité utilisent une fiche QRQC papier pour :
- identifier rapidement le problème,
- rechercher sa cause racine,
- mettre en place des actions correctives,
- vérifier que le défaut ne réapparaît plus.

Ce projet numérise l'intégralité de ce processus.

## Stack technique

- **Angular** (dernière version stable)
- **TypeScript**
- **Angular Material** (composants UI)
- **SCSS**
- **Angular Routing**
- **Angular Services**
- **Angular Reactive Forms**
- **JSON** comme stockage de données (base de données locale fichier)
- **Responsive Design**

> Aucun framework React ou Vue n'est utilisé dans ce projet.

## Fonctionnement général

L'utilisateur ne remplit jamais toute la fiche QRQC d'un seul coup : il avance étape par étape, chaque étape n'étant accessible qu'une fois la précédente validée.

```
Accueil (Dashboard)
   ↓
Créer un QRQC
   ↓
1. Identification du problème
   ↓
2. Commentaires / Situation
   ↓
3. Analyse des causes (diagramme Ishikawa – 6M)
   ↓
4. Actions de vérification
   ↓
5. Recherche de la cause racine (5 Pourquoi)
   ↓
6. Plan d'action
   ↓
7. Mesure d'efficacité
   ↓
8. Clôture
   ↓
Sauvegarde JSON
```

## Détail des étapes

### Dashboard (Accueil)
Vue d'ensemble avec : nombre total de QRQC, QRQC ouverts/en cours/clôturés, derniers QRQC créés, barre de recherche et filtres (référence produit, presse, équipe, date, statut).

### Création d'un QRQC
Un identifiant unique est généré automatiquement (ex: `QRQC-2026-0001`), avec date de création automatique et statut initial `En cours`.

### Étape 1 — Identification du problème
Référence produit, description du défaut, pourquoi c'est un problème, presse (liste déroulante), équipe, détecté par, méthode de détection, quantité concernée, date de détection. Tous les champs sont obligatoires.

### Étape 2 — Commentaires / Situation
Zone de texte libre pour décrire le contexte du problème.

### Étape 3 — Analyse causale (6M)
Recensement des causes possibles réparties en 6 catégories : Main d'œuvre, Machine, Matière, Méthode, Milieu, Mesure. Ajout illimité de causes par catégorie.

### Étape 4 — Actions de vérification
Tableau dynamique (action réalisée / date / résultat obtenu) permettant de confirmer ou éliminer les hypothèses de l'étape précédente.

### Étape 5 — Recherche de la cause racine (5 Pourquoi)
Enchaînement vertical : Cause initiale → 5x "Pourquoi ?" → Cause racine.

### Étape 6 — Plan d'action
Liste d'actions correctives : action à réaliser, bénéfice attendu, responsable, date limite, statut réalisé (Oui/Non).

### Étape 7 — Mesure de l'efficacité
Définition d'une métrique et d'un objectif, ajout de contrôles (équipe, conforme/non conforme, contrôleur, date, heure), avec graphique d'évolution du taux de défaut.

### Étape 8 — Clôture
Commentaires finaux, réponses aux questions de validation (indicateurs conformes ? actions efficaces ?), date de clôture, statut final `Clôturé`.

## Stockage des données

Chaque QRQC est enregistré comme un objet JSON complet regroupant les données de toutes les étapes. Le fichier JSON sert de base de données locale ; chaque modification est sauvegardée immédiatement, sans perte de données lors de la navigation entre étapes.

## Navigation

Chaque écran dispose de boutons **Retour**, **Suivant**, **Enregistrer**. Le bouton **Suivant** reste désactivé tant que les champs obligatoires ne sont pas remplis. Le retour aux étapes précédentes est possible à tout moment.

## Interface utilisateur

Interface moderne et professionnelle adaptée à un environnement industriel, construite avec Angular Material : dashboard, sidebar de navigation, stepper horizontal des étapes QRQC, cartes, tableaux dynamiques, formulaires ergonomiques, icônes, animations légères, design responsive.

## Objectif

L'application agit comme un assistant interactif de résolution de problème qualité, guidant l'utilisateur du signalement du défaut jusqu'à la clôture confirmée du dossier, en réduisant les erreurs de saisie et en garantissant que toutes les informations nécessaires sont collectées à chaque étape.