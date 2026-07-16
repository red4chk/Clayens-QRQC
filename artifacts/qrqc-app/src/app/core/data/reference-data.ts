export const PRESSES: string[] = [
  'P849',
  'P864',
  'P125',
  'P310',
  'P411',
  'P587',
  'P623',
  'P915',
];

export const EQUIPES: string[] = ['Equipe A', 'Equipe B', 'Equipe C', 'Equipe Nuit'];

export const METHODES_DETECTION: string[] = [
  'Contrôle visuel',
  'Contrôle dimensionnel',
  'Client',
  'Production',
  'Maintenance',
  'Autre',
];

export const ISHIKAWA_CATEGORIES: {
  key:
    | 'mainDoeuvre'
    | 'machine'
    | 'matiere'
    | 'methode'
    | 'milieu'
    | 'mesure';
  label: string;
  icon: string;
}[] = [
  { key: 'mainDoeuvre', label: "Main d'œuvre", icon: 'engineering' },
  { key: 'machine', label: 'Machine', icon: 'precision_manufacturing' },
  { key: 'matiere', label: 'Matière', icon: 'science' },
  { key: 'methode', label: 'Méthode', icon: 'checklist' },
  { key: 'milieu', label: 'Milieu', icon: 'factory' },
  { key: 'mesure', label: 'Mesure', icon: 'straighten' },
];
