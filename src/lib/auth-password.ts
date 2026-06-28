/**
 * Password hashing utilities.
 * This file uses bcryptjs which is NOT compatible with the Edge Runtime.
 * Do NOT import from middleware.
 */
import { hash, compare } from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}
