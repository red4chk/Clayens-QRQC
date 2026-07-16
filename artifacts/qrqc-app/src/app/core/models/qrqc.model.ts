export type Statut = 'En cours' | 'Cloture';
export type OuiNon = 'oui' | 'non';
export type ConformeStatus = 'conforme' | 'non-conforme';

export interface Identification {
  referenceProduit: string;
  descriptionDefaut: string;
  pourquoiProbleme: string;
  presse: string;
  equipe: string;
  detectePar: string;
  methodeDetection: string;
  quantiteConcernee: string;
  dateDetection: string;
}

export interface Commentaires {
  texte: string;
}

export interface CauseItem {
  id: string;
  texte: string;
}

export interface Ishikawa {
  mainDoeuvre: CauseItem[];
  machine: CauseItem[];
  matiere: CauseItem[];
  methode: CauseItem[];
  milieu: CauseItem[];
  mesure: CauseItem[];
}

export type IshikawaCategorie = keyof Ishikawa;

export interface ActionVerification {
  id: string;
  action: string;
  date: string;
  resultat: string;
}

export interface CinqPourquoi {
  id: string;
  causeInitiale: string;
  pourquoi1: string;
  pourquoi2: string;
  pourquoi3: string;
  pourquoi4: string;
  pourquoi5: string;
  causeRacine: string;
}

export interface ActionPlan {
  id: string;
  action: string;
  beneficeAttendu: string;
  responsable: string;
  dateLimite: string;
  realisee: OuiNon;
}

export interface Controle {
  id: string;
  equipe: string;
  conforme: ConformeStatus;
  nom: string;
  date: string;
  heure: string;
}

export interface MesureEfficacite {
  metrique: string;
  objectif: string;
  controles: Controle[];
}

export interface Cloture {
  commentairesFinaux: string;
  indicateursCommePrevu: OuiNon | null;
  actionsSensAttendu: OuiNon | null;
  dateCloture: string | null;
}

export interface Qrqc {
  id: string;
  dateCreation: string;
  statut: Statut;
  etapeCourante: number;
  identification: Identification | null;
  commentaires: Commentaires;
  ishikawa: Ishikawa;
  actionsVerification: ActionVerification[];
  cinqPourquoi: CinqPourquoi[];
  planAction: ActionPlan[];
  mesureEfficacite: MesureEfficacite;
  cloture: Cloture;
}

export type QrqcPatch = Partial<
  Pick<
    Qrqc,
    | 'statut'
    | 'etapeCourante'
    | 'identification'
    | 'commentaires'
    | 'ishikawa'
    | 'actionsVerification'
    | 'cinqPourquoi'
    | 'planAction'
    | 'mesureEfficacite'
    | 'cloture'
  >
>;

export interface QrqcStats {
  total: number;
  ouverts: number;
  clotures: number;
  enCours: number;
  recents: Qrqc[];
}

export interface QrqcFilters {
  search?: string;
  presse?: string;
  equipe?: string;
  statut?: string;
  date?: string;
}
