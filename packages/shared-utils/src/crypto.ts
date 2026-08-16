import * as crypto from 'crypto';

export interface AesEncryptedPayload {
  iv: string;
  encryptedData: string;
  tag: string;
  ciphertext: string; // Serialized representation: iv:tag:encryptedData
}

export function generateHexUuid(length: number = 7): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export function computeSha256(payload: string): string {
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

export function hashToken(token: string): string {
  return computeSha256(token.trim());
}

export function constantTimeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function deriveKey(secretKey: string): Buffer {
  const keyBuf = Buffer.from(secretKey, 'utf8');
  if (keyBuf.length === 32) {
    return keyBuf;
  }
  return crypto.createHash('sha256').update(secretKey, 'utf8').digest();
}

export function encryptAes256(plaintext: string, secretKey: string): AesEncryptedPayload {
  const key = deriveKey(secretKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  const ivHex = iv.toString('hex');

  return {
    iv: ivHex,
    encryptedData: encrypted,
    tag,
    ciphertext: `${ivHex}:${tag}:${encrypted}`,
  };
}

export function decryptAes256(encrypted: AesEncryptedPayload | string, secretKey: string): string {
  const key = deriveKey(secretKey);
  let ivHex: string;
  let tagHex: string;
  let dataHex: string;

  if (typeof encrypted === 'string') {
    const parts = encrypted.split(':');
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
      throw new Error('Invalid serialized ciphertext format. Expected iv:tag:encryptedData');
    }
    ivHex = parts[0];
    tagHex = parts[1];
    dataHex = parts[2];
  } else {
    ivHex = encrypted.iv;
    tagHex = encrypted.tag;
    dataHex = encrypted.encryptedData;
  }

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(dataHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
