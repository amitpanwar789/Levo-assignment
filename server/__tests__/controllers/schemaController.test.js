import request from 'supertest';
import express from 'express';
import multer from 'multer';
import { uploadSchema } from '../../controllers/schemaController.js';
import SchemaModal from '../../modals/schemaModal.js';
import validator from 'oas-validator';

jest.mock('../../modals/schemaModal.js', () => ({
  findOne: jest.fn().mockResolvedValue({ version: 2 }),
  create: jest.fn().mockResolvedValue({ _id: 'mockId', version: 1 })
}));
jest.mock('oas-validator', () => ({
  validate: jest.fn()
}));

describe('uploadSchema Controller', () => {
  let app;

  beforeEach(() => {

    SchemaModal.findOne.mockReset();
    SchemaModal.create.mockReset();
    validator.validate.mockReset();

    app = express();
    app.use(express.json());
    app.use(multer().single('spec'));
    app.post('/api/schemas/upload', uploadSchema);
  });

  it('should return 400 if no file is given', async () => {
    const response = await request(app)
      .post('/api/schemas/upload')
      .field('application', 'test-app');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'No spec file given' });
  });

  it('should return 400 if application name is missing or invalid', async () => {
    const response1 = await request(app)
      .post('/api/schemas/upload')
      .attach('spec', Buffer.from('{}'), 'openapi.json');

    expect(response1.statusCode).toBe(400);
    expect(response1.body).toEqual({ error: 'Application name is required and must be a non-empty string' });

    const response2 = await request(app)
      .post('/api/schemas/upload')
      .field('application', '')
      .attach('spec', Buffer.from('{}'), 'openapi.json');

    expect(response2.statusCode).toBe(400);
    expect(response2.body).toEqual({ error: 'Application name is required and must be a non-empty string' });
  });

  it('should return 400 for unsupported file type', async () => {
    const response = await request(app)
      .post('/api/schemas/upload')
      .field('application', 'test-app')
      .attach('spec', Buffer.from('<xml></xml>'), 'openapi.xml');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Unsupported file type. Only JSON and YAML are allowed.' });
  });

  it('should return 400 if OpenAPI specification validation fails', async () => {
    const invalidSpec = { invalid: 'openapi' };
    validator.validate.mockRejectedValue(new Error('Invalid OpenAPI spec'));

    const response = await request(app)
      .post('/api/schemas/upload')
      .field('application', 'test-app')
      .attach('spec', Buffer.from(JSON.stringify(invalidSpec)), 'openapi.json');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid OpenAPI specification format' });
  });

  it('should successfully upload a new JSON schema for a new application', async () => {
    const validSpec = { openapi: '3.0.0', info: { title: 'Test API', version: '1.0.0' }, paths: {} };
    SchemaModal.findOne.mockResolvedValue(null);
    SchemaModal.create.mockResolvedValue({ _id: 'mockId' });
    validator.validate.mockResolvedValue(undefined);

    const response = await request(app)
      .post('/api/schemas/upload')
      .field('application', 'new-app')
      .attach('spec', Buffer.from(JSON.stringify(validSpec)), 'openapi.json');

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ message: 'Schema uploaded successfully', version: 0, id: 'mockId' });
  });

  it('should successfully upload a new YAML schema for an existing application with a service', async () => {
    const validSpec = `openapi: 3.0.0\ninfo:\n  title: Test API\n  version: 1.0.0\npaths: {}`;
    SchemaModal.findOne.mockResolvedValue({ version: 2 });
    SchemaModal.create.mockResolvedValue({ _id: 'mockId' });
    validator.validate.mockResolvedValue(undefined);

    const response = await request(app)
      .post('/api/schemas/upload')
      .field('application', 'new-app')
      .field('service', 'users')
      .attach('spec', Buffer.from(validSpec), 'openapi.yaml');

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ message: 'Schema uploaded successfully', version: 3, id: 'mockId' });
  });
});