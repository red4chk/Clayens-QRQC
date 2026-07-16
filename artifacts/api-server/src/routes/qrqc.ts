import { Router, type IRouter } from "express";
import {
  deleteQrqc,
  getQrqc,
  insertQrqc,
  listQrqc,
  nextQrqcId,
  updateQrqc,
} from "../lib/qrqcStore";
import { QrqcCreateInput, QrqcUpdateInput, type Qrqc } from "../lib/qrqcTypes";

const router: IRouter = Router();

// GET /api/qrqc — list all QRQC records with optional filters.
router.get("/qrqc", async (req, res): Promise<void> => {
  const all = await listQrqc();
  const { search, presse, equipe, statut, date } = req.query;

  let result = all;

  if (typeof statut === "string" && statut.length > 0) {
    result = result.filter((q) => q.statut === statut);
  }
  if (typeof presse === "string" && presse.length > 0) {
    result = result.filter((q) => q.identification?.presse === presse);
  }
  if (typeof equipe === "string" && equipe.length > 0) {
    result = result.filter((q) => q.identification?.equipe === equipe);
  }
  if (typeof date === "string" && date.length > 0) {
    result = result.filter(
      (q) =>
        q.dateCreation.startsWith(date) ||
        q.identification?.dateDetection?.startsWith(date),
    );
  }
  if (typeof search === "string" && search.length > 0) {
    const needle = search.toLowerCase();
    result = result.filter((q) => {
      const haystack = [
        q.id,
        q.identification?.referenceProduit,
        q.identification?.descriptionDefaut,
        q.identification?.presse,
        q.identification?.equipe,
        q.identification?.detectePar,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  req.log.info({ count: result.length }, "Listed QRQC records");
  res.json(result);
});

// GET /api/qrqc/stats — dashboard aggregate counters.
router.get("/qrqc/stats", async (_req, res): Promise<void> => {
  const all = await listQrqc();
  const total = all.length;
  const ouverts = all.filter((q) => q.statut === "En cours").length;
  const clotures = all.filter((q) => q.statut === "Cloture").length;
  const recents = [...all]
    .sort((a, b) => (a.dateCreation < b.dateCreation ? 1 : -1))
    .slice(0, 5);

  res.json({
    total,
    ouverts,
    clotures,
    enCours: ouverts,
    recents,
  });
});

// GET /api/qrqc/:id — fetch a single QRQC record.
router.get("/qrqc/:id", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const record = await getQrqc(id ?? "");
  if (!record) {
    res.status(404).json({ error: "QRQC introuvable" });
    return;
  }
  res.json(record);
});

// POST /api/qrqc — create a new QRQC folder.
router.post("/qrqc", async (req, res): Promise<void> => {
  const parsed = QrqcCreateInput.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = await nextQrqcId();
  const record: Qrqc = {
    id,
    dateCreation: new Date().toISOString(),
    statut: "En cours",
    etapeCourante: 1,
    identification: null,
    commentaires: { texte: "" },
    ishikawa: {
      mainDoeuvre: [],
      machine: [],
      matiere: [],
      methode: [],
      milieu: [],
      mesure: [],
    },
    actionsVerification: [],
    cinqPourquoi: [],
    planAction: [],
    mesureEfficacite: { metrique: "", objectif: "", controles: [] },
    cloture: {
      commentairesFinaux: "",
      indicateursCommePrevu: null,
      actionsSensAttendu: null,
      dateCloture: null,
    },
  };

  await insertQrqc(record);
  req.log.info({ id }, "Created new QRQC");
  res.status(201).json(record);
});

// PATCH /api/qrqc/:id — update any part of a QRQC record (progressive save).
router.patch("/qrqc/:id", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = QrqcUpdateInput.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updated = await updateQrqc(id ?? "", parsed.data);
  if (!updated) {
    res.status(404).json({ error: "QRQC introuvable" });
    return;
  }
  res.json(updated);
});

// DELETE /api/qrqc/:id — remove a QRQC record.
router.delete("/qrqc/:id", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const ok = await deleteQrqc(id ?? "");
  if (!ok) {
    res.status(404).json({ error: "QRQC introuvable" });
    return;
  }
  res.sendStatus(204);
});

export default router;
