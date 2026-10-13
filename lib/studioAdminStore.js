import fs from "node:fs";
import path from "node:path";
import { listStudioSubscribers } from "@/lib/studioSubscribersStore";

const ADMIN_ROOT = path.join(process.cwd(), "storage", "studio-admin");
const VISITS_PATH = path.join(ADMIN_ROOT, "visits.json");
const LOGS_PATH = path.join(ADMIN_ROOT, "logs.json");

const MAX_VISITS = 1000;
const MAX_LOGS = 500;

function ensureAdminDir() {
  fs.mkdirSync(ADMIN_ROOT, { recursive: true });
}

function readVisits() {
  ensureAdminDir();
  if (!fs.existsSync(VISITS_PATH)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(VISITS_PATH, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLogs() {
  ensureAdminDir();
  if (!fs.existsSync(LOGS_PATH)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(LOGS_PATH, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeVisits(items) {
  ensureAdminDir();
  fs.writeFileSync(VISITS_PATH, JSON.stringify(items, null, 2), "utf8");
}

function writeLogs(items) {
  ensureAdminDir();
  fs.writeFileSync(LOGS_PATH, JSON.stringify(items, null, 2), "utf8");
}

export function appendStudioVisit(entry) {
  const visits = readVisits();
  visits.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: Date.now(),
    ip: entry.ip || "unknown",
    path: entry.path || "/",
    method: entry.method || "GET",
    userAgent: String(entry.userAgent || "").slice(0, 240),
    referer: String(entry.referer || "").slice(0, 240),
    kind: entry.kind || "visit",
  });
  writeVisits(visits.slice(0, MAX_VISITS));
}

export function appendStudioServerLog(entry) {
  const logs = readLogs();
  logs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: Date.now(),
    level: entry.level || "info",
    message: String(entry.message || "").slice(0, 2000),
    meta: entry.meta && typeof entry.meta === "object" ? entry.meta : {},
  });
  writeLogs(logs.slice(0, MAX_LOGS));
}

export function getStudioAdminDashboard() {
  const visits = readVisits();
  const logs = readLogs();
  const uniqueIps = new Set(visits.map((v) => v.ip).filter(Boolean));

  const subscribers = listStudioSubscribers();

  return {
    visits,
    logs,
    subscribers,
    stats: {
      totalVisits: visits.length,
      uniqueIps: uniqueIps.size,
      totalLogs: logs.length,
      subscriberCount: subscribers.length,
    },
  };
}
