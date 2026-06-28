/**
 * Encrypted credential record stored in MongoDB.
 * All values are encrypted with AES-256-GCM before storage.
 */
export interface EncryptedCredential {
  jobId: string;
  /** AES-256-GCM encrypted User ID */
  userId: string;
  /** AES-256-GCM encrypted password */
  password: string;
  /** Hex-encoded initialization vector */
  iv: string;
  /** Hex-encoded GCM authentication tag */
  authTag: string;
  createdAt: string;
}

/**
 * Decrypted credential returned to the frontend.
 * Only returned for authenticated requests on completed jobs.
 */
export interface DecryptedCredential {
  jobId: string;
  userId: string;
  password: string;
  createdAt: string;
}
