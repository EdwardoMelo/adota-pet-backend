import { randomInt } from 'node:crypto';

/** Caracteres legíveis, sem ambiguidade (0/O, 1/l, etc.) */
const CHARSET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Senha aleatória curta para primeiro acesso (armazenar apenas o hash no banco).
 */
export function generateTemporaryPassword(length = 10): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CHARSET.charAt(randomInt(CHARSET.length));
  }
  return out;
}
