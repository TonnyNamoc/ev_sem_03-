import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Raíz del proyecto: .../ev_sem_12
export const PROJECT_ROOT = path.join(__dirname, "..", "..");
// Carpeta única de uploads en la raíz
export const UPLOAD_DIR   = path.join(PROJECT_ROOT, "uploads");
