import { promises as fs } from "fs";
import path from "path";
import { logger } from "./logger";
import { type Qrqc, QrqcSchema } from "./qrqcTypes";

// Single JSON file used as the local data store for all QRQC records, as
// required by the functional specification ("stockage JSON").
// Resolve relative to the compiled bundle's directory. esbuild flattens
// src/lib/*.ts into a single dist/index.mjs, so at runtime this file lives
// directly in <api-server>/dist, one level above <api-server>/data — but we
// resolve from process.cwd() (the package root, since `pnpm --filter run
// start` runs there) to stay correct in both dev (tsx) and built modes.
const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "qrqc.json");

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readAll(): Promise<Qrqc[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    logger.error({ err }, "Failed to parse qrqc.json, resetting to empty");
    return [];
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  const result: Qrqc[] = [];
  for (const item of parsed) {
    const validated = QrqcSchema.safeParse(item);
    if (validated.success) {
      result.push(validated.data);
    } else {
      logger.warn(
        { errors: validated.error.message },
        "Skipping invalid QRQC record from data file",
      );
    }
  }
  return result;
}

async function writeAll(records: Qrqc[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(records, null, 2), "utf-8");
  await fs.rename(tmpFile, DATA_FILE);
}

// Serializes writes so concurrent requests never clobber each other via a
// lost-update on the shared JSON file.
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function listQrqc(): Promise<Qrqc[]> {
  return readAll();
}

export async function getQrqc(id: string): Promise<Qrqc | undefined> {
  const all = await readAll();
  return all.find((q) => q.id === id);
}

export async function insertQrqc(record: Qrqc): Promise<Qrqc> {
  return enqueue(async () => {
    const all = await readAll();
    all.unshift(record);
    await writeAll(all);
    return record;
  });
}

export async function updateQrqc(
  id: string,
  patch: Partial<Qrqc>,
): Promise<Qrqc | undefined> {
  return enqueue(async () => {
    const all = await readAll();
    const idx = all.findIndex((q) => q.id === id);
    if (idx === -1) {
      return undefined;
    }
    const merged = QrqcSchema.parse({ ...all[idx], ...patch, id });
    all[idx] = merged;
    await writeAll(all);
    return merged;
  });
}

export async function deleteQrqc(id: string): Promise<boolean> {
  return enqueue(async () => {
    const all = await readAll();
    const idx = all.findIndex((q) => q.id === id);
    if (idx === -1) {
      return false;
    }
    all.splice(idx, 1);
    await writeAll(all);
    return true;
  });
}

export async function nextQrqcId(): Promise<string> {
  const all = await readAll();
  const year = new Date().getFullYear();
  const prefix = `QRQC-${year}-`;
  let max = 0;
  for (const q of all) {
    if (q.id.startsWith(prefix)) {
      const n = parseInt(q.id.slice(prefix.length), 10);
      if (!Number.isNaN(n) && n > max) {
        max = n;
      }
    }
  }
  const next = String(max + 1).padStart(4, "0");
  return `${prefix}${next}`;
}
