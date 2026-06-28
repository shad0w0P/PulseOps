/**
 * Jest setup — set minimal environment variables for tests
 * that import modules depending on env.ts.
 */
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '4000';
process.env['MONGODB_URI'] = 'mongodb://localhost:27017/tax-automation-test';
process.env['API_BEARER_TOKEN'] = 'test-bearer-token';
process.env['WEBHOOK_SECRET'] = 'test-webhook-secret';
process.env['AUTOMATION_SERVICE_URL'] = 'http://localhost:4001';
process.env['AUTOMATION_BEARER_TOKEN'] = 'test-automation-token';
process.env['ENCRYPTION_KEY'] = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env['CORS_ORIGIN'] = 'http://localhost:3000';
