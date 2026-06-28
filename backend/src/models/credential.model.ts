import mongoose, { Document, Schema } from 'mongoose';

export interface ICredentialDocument extends Document {
  jobId: string;
  userId: string;
  password: string;
  iv: string;
  authTag: string;
  createdAt: Date;
}

const credentialSchema = new Schema<ICredentialDocument>(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true },
    password: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

export const CredentialModel = mongoose.model<ICredentialDocument>('Credential', credentialSchema);
