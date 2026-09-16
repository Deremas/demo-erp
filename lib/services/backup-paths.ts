import path from "path";

export function getBackupsDir() {
  if (process.env.BACKUP_DIR) {
    return path.resolve(process.env.BACKUP_DIR);
  }

  return path.join(/* turbopackIgnore: true */ process.cwd(), "data", "backups");
}