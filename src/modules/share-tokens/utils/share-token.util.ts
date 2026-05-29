import { createHash, randomBytes } from 'crypto';

export function generateShareToken() {
  return randomBytes(32).toString('base64url');
}

export function hashShareToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createShareTokenPreview(token: string) {
  if (token.length <= 16) {
    return token;
  }

  return `${token.slice(0, 8)}...${token.slice(-6)}`;
}
