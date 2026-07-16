import { z } from "zod";

// ---------------------------------------------------------------------------
// QRQC domain types & Zod validation schemas.
// Storage is a single JSON file (see qrqcStore.ts) — no database is used,
// per the project's functional requirements.
// ---------------------------------------------------------------------------

export const StatutSchema = z.enum(["En cours", "Cloture"]);
export type Statut = z.infer<typeof StatutSchema>;

// --- Etape 1 : Identification du probleme ---------------------------------
export const IdentificationSchema = z.object({
  referenceProduit: z.string().min(1),
  descriptionDefaut: z.string().min(1),
  pourquoiProbleme: z.string().min(1),
  presse: z.string().min(1),
  equipe: z.string().min(1),
  detectePar: z.string().min(1),
  methodeDetection: z.string().min(1),
  quantiteConcernee: z.string().min(1),
  dateDetection: z.string().min(1),
});
export type Identification = z.infer<typeof IdentificationSchema>;

// --- Etape 2 : Commentaires -------------------------------------------------
export const CommentairesSchema = z.object({
  texte: z.string().default(""),
});
export type Commentaires = z.infer<typeof CommentairesSchema>;

// --- Etape 3 : Analyse causale (6M / Ishikawa) -----------------------------
export const CauseItemSchema = z.object({
  id: z.string(),
  texte: z.string().min(1),
});
export type CauseItem = z.infer<typeof CauseItemSchema>;

export const IshikawaSchema = z.object({
  mainDoeuvre: z.array(CauseItemSchema).default([]),
  machine: z.array(CauseItemSchema).default([]),
  matiere: z.array(CauseItemSchema).default([]),
  methode: z.array(CauseItemSchema).default([]),
  milieu: z.array(CauseItemSchema).default([]),
  mesure: z.array(CauseItemSchema).default([]),
});
export type Ishikawa = z.infer<typeof IshikawaSchema>;

// --- Etape 4 : Actions de verification --------------------------------------
export const ActionVerificationSchema = z.object({
  id: z.string(),
  action: z.string().min(1),
  date: z.string().min(1),
  resultat: z.string().min(1),
});
export type ActionVerification = z.infer<typeof ActionVerificationSchema>;

// --- Etape 5 : 5 Pourquoi ----------------------------------------------------
export const CinqPourquoiSchema = z.object({
  id: z.string(),
  causeInitiale: z.string().min(1),
  pourquoi1: z.string().default(""),
  pourquoi2: z.string().default(""),
  pourquoi3: z.string().default(""),
  pourquoi4: z.string().default(""),
  pourquoi5: z.string().default(""),
  causeRacine: z.string().default(""),
});
export type CinqPourquoi = z.infer<typeof CinqPourquoiSchema>;

// --- Etape 6 : Plan d'action -------------------------------------------------
export const ActionPlanSchema = z.object({
  id: z.string(),
  action: z.string().min(1),
  beneficeAttendu: z.string().min(1),
  responsable: z.string().min(1),
  dateLimite: z.string().min(1),
  realisee: z.enum(["oui", "non"]).default("non"),
});
export type ActionPlan = z.infer<typeof ActionPlanSchema>;

// --- Etape 7 : Mesure d'efficacite -------------------------------------------
export const ControleSchema = z.object({
  id: z.string(),
  equipe: z.string().min(1),
  conforme: z.enum(["conforme", "non-conforme"]),
  nom: z.string().min(1),
  date: z.string().min(1),
  heure: z.string().min(1),
});
export type Controle = z.infer<typeof ControleSchema>;

export const MesureEfficaciteSchema = z.object({
  metrique: z.string().default(""),
  objectif: z.string().default(""),
  controles: z.array(ControleSchema).default([]),
});
export type MesureEfficacite = z.infer<typeof MesureEfficaciteSchema>;

// --- Etape 8 : Cloture --------------------------------------------------------
export const ClotureSchema = z.object({
  commentairesFinaux: z.string().default(""),
  indicateursCommePrevu: z.enum(["oui", "non"]).nullable().default(null),
  actionsSensAttendu: z.enum(["oui", "non"]).nullable().default(null),
  dateCloture: z.string().nullable().default(null),
});
export type Cloture = z.infer<typeof ClotureSchema>;

// --- QRQC complet -------------------------------------------------------------
export const QrqcSchema = z.object({
  id: z.string(),
  dateCreation: z.string(),
  statut: StatutSchema,
  etapeCourante: z.number().int().min(1).max(8),
  identification: IdentificationSchema.nullable().default(null),
  commentaires: CommentairesSchema.default({ texte: "" }),
  ishikawa: IshikawaSchema.default({
    mainDoeuvre: [],
    machine: [],
    matiere: [],
    methode: [],
    milieu: [],
    mesure: [],
  }),
  actionsVerification: z.array(ActionVerificationSchema).default([]),
  cinqPourquoi: z.array(CinqPourquoiSchema).default([]),
  planAction: z.array(ActionPlanSchema).default([]),
  mesureEfficacite: MesureEfficaciteSchema.default({
    metrique: "",
    objectif: "",
    controles: [],
  }),
  cloture: ClotureSchema.default({
    commentairesFinaux: "",
    indicateursCommePrevu: null,
    actionsSensAttendu: null,
    dateCloture: null,
  }),
});
export type Qrqc = z.infer<typeof QrqcSchema>;

// --- Body schemas for write endpoints ----------------------------------------
export const QrqcCreateInput = z.object({
  referenceProduit: z.string().min(1).optional(),
});

export const QrqcUpdateInput = z.object({
  statut: StatutSchema.optional(),
  etapeCourante: z.number().int().min(1).max(8).optional(),
  identification: IdentificationSchema.nullable().optional(),
  commentaires: CommentairesSchema.optional(),
  ishikawa: IshikawaSchema.optional(),
  actionsVerification: z.array(ActionVerificationSchema).optional(),
  cinqPourquoi: z.array(CinqPourquoiSchema).optional(),
  planAction: z.array(ActionPlanSchema).optional(),
  mesureEfficacite: MesureEfficaciteSchema.optional(),
  cloture: ClotureSchema.optional(),
});
