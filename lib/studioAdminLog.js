import { appendStudioServerLog } from "@/lib/studioAdminStore";

export function logStudioServer(level, message, meta = {}) {
  try {
    appendStudioServerLog({ level, message, meta });
  } catch {
    /* ignore logging failures */
  }
}
