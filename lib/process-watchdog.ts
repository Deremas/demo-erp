import fs from "node:fs";

const LIMIT = 100;
const CLEAN_AT = 80;
const MAX_AGE_MINUTES = 20;
const CLEANUP_INTERVAL_MS = 2 * 60 * 1000;

const SAFE_PATTERNS = [
  "next dev",
  "npm run dev",
  "npm exec prisma studio",
  "prisma studio",
  "tsx watch",
  "ts-node-dev",
  "nodemon",
  "vite",
];

function getCurrentUid() {
  if (typeof process.getuid !== "function") return null;
  try {
    return process.getuid();
  } catch {
    return null;
  }
}

function readProcPids() {
  try {
    return fs.readdirSync("/proc").filter((entry) => /^\d+$/.test(entry));
  } catch {
    return [];
  }
}

function getBootTimeSeconds() {
  try {
    const stat = fs.readFileSync("/proc/stat", "utf8");
    const line = stat.split("\n").find((entry) => entry.startsWith("btime "));
    if (!line) return null;
    return Number(line.split(/\s+/)[1]);
  } catch {
    return null;
  }
}

function getUptimeSeconds() {
  try {
    const uptime = fs.readFileSync("/proc/uptime", "utf8").trim().split(/\s+/)[0];
    return Number(uptime);
  } catch {
    return null;
  }
}

function getProcessAgeMinutes(pid: string) {
  try {
    const stat = fs.readFileSync(`/proc/${pid}/stat`, "utf8");
    const parts = stat.split(" ");
    const startTicks = Number(parts[21]);
    const clkTck = 100;
    const boot = getBootTimeSeconds();
    const uptime = getUptimeSeconds();

    if (!Number.isFinite(startTicks) || boot === null || uptime === null) return null;

    const processStart = boot + (startTicks / clkTck);
    const ageSeconds = (boot + uptime) - processStart;
    return ageSeconds / 60;
  } catch {
    return null;
  }
}

function getTopCommands() {
  const uid = getCurrentUid();
  const counts = new Map<string, number>();

  for (const pid of readProcPids()) {
    if (pid === String(process.pid)) continue;

    if (uid !== null) {
      try {
        const status = fs.readFileSync(`/proc/${pid}/status`, "utf8");
        const uidLine = status.split("\n").find((line) => line.startsWith("Uid:"));
        if (!uidLine) continue;
        const realUid = Number(uidLine.split(/\s+/)[1]);
        if (realUid !== uid) continue;
      } catch {
        continue;
      }
    }

    const cmd = readProcessCmdline(pid);
    const key = cmd.split(" ").slice(0, 3).join(" ") || "[unknown]";
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
}

function getProcessCount() {
  const uid = getCurrentUid();
  let count = 0;

  for (const pid of readProcPids()) {
    if (uid === null) {
      count += 1;
      continue;
    }

    try {
      const status = fs.readFileSync(`/proc/${pid}/status`, "utf8");
      const uidLine = status.split("\n").find((line) => line.startsWith("Uid:"));
      if (!uidLine) continue;

      const realUid = Number(uidLine.split(/\s+/)[1]);
      if (realUid === uid) count += 1;
    } catch {
      // Ignore processes we cannot inspect.
    }
  }

  return count;
}

function readProcessCmdline(pid: string) {
  try {
    const raw = fs.readFileSync(`/proc/${pid}/cmdline`, "utf8");
    return raw.replace(/\0/g, " ").trim();
  } catch {
    return "";
  }
}

function safeKillOldProcesses() {
  const currentPid = String(process.pid);

  for (const pid of readProcPids()) {
    if (pid === currentPid) continue;

    const cmd = readProcessCmdline(pid).toLowerCase();
    if (!cmd) continue;

    if (!SAFE_PATTERNS.some((pattern) => cmd.includes(pattern))) continue;

    const ageMinutes = getProcessAgeMinutes(pid);
    if (ageMinutes !== null && ageMinutes < MAX_AGE_MINUTES) continue;

    try {
      process.kill(Number(pid), "SIGTERM");
      console.log(`[watchdog] sent SIGTERM to ${pid}: ${cmd}`);
    } catch (error) {
      console.log(`[watchdog] failed to kill ${pid}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

function runWatchdogSweep() {
  const count = getProcessCount();
  console.log(`[watchdog] process count ${count}/${LIMIT}`);

  if (count >= CLEAN_AT) {
    console.log("[watchdog] high NPROC detected, cleaning safe long-running processes");
    const topCommands = getTopCommands();
    if (topCommands.length > 0) {
      console.log("[watchdog] top user processes:");
      for (const [command, total] of topCommands) {
        console.log(`[watchdog]   ${total}x ${command}`);
      }
    }
    safeKillOldProcesses();
  }
}

export function startProcessWatchdog() {
  if (process.env.NODE_ENV !== "production" && process.env.PROCESS_WATCHDOG !== "true") {
    return;
  }

  runWatchdogSweep();
  setInterval(runWatchdogSweep, CLEANUP_INTERVAL_MS).unref();
}

if (typeof process !== "undefined" && process.argv[1]?.endsWith("process-watchdog.ts")) {
  startProcessWatchdog();
}