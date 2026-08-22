const crypto = require('crypto');

const AES_KEY = process.env.AES_ENCRYPTION_KEY;

if (!AES_KEY || AES_KEY.length !== 32) {
  console.error(
    '❌ FATAL: AES_ENCRYPTION_KEY must be exactly 32 characters for AES-256.'
  );
  process.exit(1);
}

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

/**
 * Encrypts a plain-text string using AES-256-CBC.
 * @param {string} text - plain text to encrypt
 * @returns {string} IV + encrypted content, hex-encoded, separated by ':'
 */
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(AES_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts an AES-256-CBC encrypted string.
 * @param {string} encryptedText - formatted as 'iv_hex:encrypted_hex'
 * @returns {string} decrypted plain text
 */
const decrypt = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !encrypted) throw new Error('Invalid encrypted payload format');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(AES_KEY), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Generate an encrypted QR payload for a session.
 * @param {string} sessionId
 * @param {string} teacherId
 * @returns {string} encrypted payload string
 */
const generateQRPayload = (sessionId, teacherId) => {
  const payload = JSON.stringify({
    sessionId,
    teacherId,
    timestamp: Date.now(),
  });
  return encrypt(payload);
};

/**
 * Decrypt and validate a QR payload within a 10-second window.
 * @param {string} encryptedPayload
 * @returns {{ sessionId: string, teacherId: string, timestamp: number }} parsed payload
 * @throws {Error} if payload is invalid or expired
 */
const validateQRPayload = (encryptedPayload) => {
  let payload;
  try {
    const decrypted = decrypt(encryptedPayload);
    payload = JSON.parse(decrypted);
  } catch {
    throw new Error('Invalid QR code. Could not decrypt payload.');
  }

  const { sessionId, teacherId, timestamp } = payload;

  if (!sessionId || !teacherId || !timestamp) {
    throw new Error('Malformed QR payload.');
  }

  const AGE_LIMIT_MS = 10 * 1000; // 10 seconds
  const age = Date.now() - timestamp;
  if (age > AGE_LIMIT_MS || age < 0) {
    throw new Error('QR code has expired. Please scan the latest code.');
  }

  return { sessionId, teacherId, timestamp };
};

module.exports = { encrypt, decrypt, generateQRPayload, validateQRPayload };
