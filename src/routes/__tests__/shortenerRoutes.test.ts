import request from 'supertest';
import express from 'express';
import shortenerRoutes from '../shortenerRoutes';
import { urlMap } from '../../db';
import { analyticsQueue } from '../shortenerRoutes';

const app = express();
app.use('/', shortenerRoutes);

describe('Shortener Routes', () => {
  beforeEach(() => {
    urlMap.clear();
    urlMap.set('test123', 'https://example.com');
  });

  afterEach(async () => {
    // Wait for any pending analytics to complete
    await analyticsQueue.empty();
  });

  afterAll(async () => {
    await analyticsQueue.close();
  });

  test('GET /:shortId should redirect to original URL', async () => {
    const response = await request(app)
      .get('/test123')
      .expect(302);
    
    expect(response.header.location).toBe('https://example.com');
    // Wait for analytics to be processed
    await analyticsQueue.empty();
  });

  test('GET /:shortId with invalid ID should return 404', async () => {
    await request(app)
      .get('/nonexistent')
      .expect(404);
  });

  test('Should handle 1000 concurrent link clicks', async () => {
    const shortId = 'test123';
    const requests = Array(1000).fill(null).map(() => 
      request(app).get(`/${shortId}`)
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();

    console.log(`Processed 1000 requests in ${endTime - startTime}ms`);

    // Wait for all analytics to be processed
    await analyticsQueue.empty();

    responses.forEach(response => {
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('https://example.com');
    });
  }, 30000); // Increased timeout for load test
});