import { type DecryptedCredential } from '@anas/shared';
import { credentialRepository } from '../repositories/credential.repository';
import { encrypt, decrypt } from '../utils/encryption';
import { NotFoundError } from '../utils/api-error';
import { logger } from '../utils/logger';

/**
 * Credential service — encrypts/decrypts credentials.
 * Never logs raw credential values.
 */
class CredentialService {
  /**
   * Encrypt and store credentials for a completed job.
   */
  async storeCredentials(
    jobId: string,
    userId: string,
    password: string,
  ): Promise<void> {
    // Encrypt both fields with the same IV and auth tag
    // (they are logically one credential pair)
    const encrypted = encrypt(JSON.stringify({ userId, password }));

    await credentialRepository.create({
      jobId,
      userId: encrypted.encrypted,
      password: '', // Password is part of the encrypted blob
      iv: encrypted.iv,
      authTag: encrypted.authTag,
    });

    logger.info({ jobId }, 'Credentials stored (encrypted)');
  }

  /**
   * Retrieve and decrypt credentials for a job.
   */
  async getDecryptedCredentials(jobId: string): Promise<DecryptedCredential> {
    const credDoc = await credentialRepository.findByJobId(jobId);
    if (!credDoc) {
      throw new NotFoundError('Credentials', jobId);
    }

    const decryptedJson = decrypt(credDoc.userId, credDoc.iv, credDoc.authTag);
    const { userId, password } = JSON.parse(decryptedJson);

    return {
      jobId,
      userId,
      password,
      createdAt: credDoc.createdAt.toISOString(),
    };
  }
}

export const credentialService = new CredentialService();
