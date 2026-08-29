// [Owner: D] Password hashing without an external runtime dependency. This is
// enough for the demo auth flow and avoids blocking local setup on native deps.
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SCHEME = "scrypt";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${SCHEME}:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [scheme, salt, storedKeyHex] = storedHash.split(":");
  if (scheme !== SCHEME || !salt || !storedKeyHex) return false;

  const storedKey = Buffer.from(storedKeyHex, "hex");
  const key = (await scrypt(password, salt, storedKey.length)) as Buffer;
  return storedKey.length === key.length && timingSafeEqual(storedKey, key);
}
