import { JobState, type JobListFilters } from '@anas/shared';
import { JobModel, IJobDocument } from '../models/job.model';

/**
 * Repository for Job data access.
 * Only this file interacts with the Job model directly.
 */
export class JobRepository {
  async create(data: {
    jobId: string;
    pan: string;
    requestId: string;
    status: JobState;
  }): Promise<IJobDocument> {
    const job = new JobModel(data);
    return job.save();
  }

  async findByJobId(jobId: string): Promise<IJobDocument | null> {
    return JobModel.findOne({ jobId }).exec();
  }

  async findAll(filters: JobListFilters): Promise<{
    jobs: IJobDocument[];
    total: number;
  }> {
    const query: Record<string, unknown> = {};

    if (filters.status) {
      query['status'] = filters.status;
    }

    if (filters.pan) {
      query['pan'] = { $regex: filters.pan, $options: 'i' };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [jobs, total] = await Promise.all([
      JobModel.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      JobModel.countDocuments(query).exec(),
    ]);

    return { jobs, total };
  }

  async updateStatus(
    jobId: string,
    status: JobState,
    additionalFields?: Partial<Pick<IJobDocument, 'completedAt' | 'durationMs' | 'error'>>,
  ): Promise<IJobDocument | null> {
    const updateData: Record<string, unknown> = { status, ...additionalFields };
    return JobModel.findOneAndUpdate({ jobId }, { $set: updateData }, { new: true }).exec();
  }

  async updateMetadata(
    jobId: string,
    metadata: Partial<IJobDocument['metadata']>,
  ): Promise<IJobDocument | null> {
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      update[`metadata.${key}`] = value;
    }
    return JobModel.findOneAndUpdate({ jobId }, { $set: update }, { new: true }).exec();
  }

  async countByStatus(status: JobState): Promise<number> {
    return JobModel.countDocuments({ status }).exec();
  }

  async countRunning(): Promise<number> {
    const nonTerminalStatuses = Object.values(JobState).filter(
      (s) => s !== JobState.SUCCESS && s !== JobState.FAILED && s !== JobState.CANCELLED,
    );
    return JobModel.countDocuments({ status: { $in: nonTerminalStatuses } }).exec();
  }
}

export const jobRepository = new JobRepository();
