import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const algorithm = "scrypt";
const keyLength = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer;

  return `${algorithm}$${salt}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(hash: string, password: string) {
  const [storedAlgorithm, salt, storedKey] = hash.split("$");

  if (storedAlgorithm !== algorithm || !salt || !storedKey) {
    return false;
  }

  const storedBuffer = Buffer.from(storedKey, "base64url");
  const derivedBuffer = (await scryptAsync(password, salt, storedBuffer.length)) as Buffer;

  return (
    storedBuffer.length === derivedBuffer.length &&
    timingSafeEqual(storedBuffer, derivedBuffer)
  );
}