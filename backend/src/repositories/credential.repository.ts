import { CredentialModel, ICredentialDocument } from '../models/credential.model';

/**
 * Repository for encrypted credential storage.
 */
export class CredentialRepository {
  async create(data: {
    jobId: string;
    userId: string;
    password: string;
    iv: string;
    authTag: string;
  }): Promise<ICredentialDocument> {
    const credential = new CredentialModel(data);
    return credential.save();
  }

  async findByJobId(jobId: string): Promise<ICredentialDocument | null> {
    return CredentialModel.findOne({ jobId }).exec();
  }
}

export const credentialRepository = new CredentialRepository();
