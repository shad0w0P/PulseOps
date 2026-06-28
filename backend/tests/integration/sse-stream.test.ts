import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../src/app';
import { JobState, EventLevel } from '@anas/shared';
import { JobModel } from '../../src/models/job.model';
import { EventModel } from '../../src/models/event.model';
import { env } from '../../src/config/env';

describe('Integration — Job & Event Stream', () => {
  jest.setTimeout(180000); // 3 minutes to download mongo binary if needed
  let mongoServer: MongoMemoryServer;
  let app: any;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    app = createApp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections
    await JobModel.deleteMany({});
    await EventModel.deleteMany({});
  });

  it('should create a job and query list via REST API', async () => {
    // Mock the outgoing call to the automation service so the test does not crash
    // since the real automation service is not running.
    // We can intercept the HTTP client if needed, but since starting automation is fire-and-forget
    // and catches errors, the API call should still succeed with 201.
    const response = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${env.apiBearerToken}`)
      .send({ pan: 'ABCDE1234F' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.pan).toBe('ABCD*****F');
    expect(response.body.data.status).toBe(JobState.CREATED);

    const jobId = response.body.data.jobId;

    // Verify job is stored in DB
    const dbJob = await JobModel.findOne({ jobId });
    expect(dbJob).toBeDefined();
    expect(dbJob?.status).toBe(JobState.CREATED);

    // Query job list
    const listResponse = await request(app)
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${env.apiBearerToken}`);

    expect(listResponse.status).toBe(200); // Express return 200 for lists
    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.data.jobs.length).toBe(1);
    expect(listResponse.body.data.jobs[0].jobId).toBe(jobId);
  });

  it('should reject invalid PAN layout requests', async () => {
    const response = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${env.apiBearerToken}`)
      .send({ pan: 'INVALID123' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should accept signed webhook events from automation bot and update states', async () => {
    // Create a mock job record first
    const jobId = '00000000-0000-0000-0000-000000000000';
    const requestId = '11111111-1111-1111-1111-111111111111';
    await JobModel.create({
      jobId,
      pan: 'ABCD*****F',
      requestId,
      status: JobState.CREATED,
    });

    const payload = {
      event: {
        eventId: '22222222-2222-2222-2222-222222222222',
        jobId,
        sequenceNumber: 1,
        level: EventLevel.INFO,
        phase: JobState.STARTING_BROWSER,
        step: 'Browser check',
        message: 'Launching Playwright context...',
        timestamp: new Date().toISOString(),
        requestId,
        metadata: {},
      },
      previousState: JobState.CREATED,
    };

    // Calculate HMAC-SHA256 signature
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', env.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const webhookResponse = await request(app)
      .post('/api/v1/webhook/events')
      .set('X-Webhook-Signature', signature)
      .send(payload);

    expect(webhookResponse.status).toBe(202);
    expect(webhookResponse.body.success).toBe(true);

    // Verify DB states updated
    const updatedJob = await JobModel.findOne({ jobId });
    expect(updatedJob?.status).toBe(JobState.STARTING_BROWSER);

    const eventDoc = await EventModel.findOne({ jobId, sequenceNumber: 1 });
    expect(eventDoc).toBeDefined();
    expect(eventDoc?.phase).toBe(JobState.STARTING_BROWSER);
  });
});
