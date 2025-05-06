import request from 'supertest';
import express from 'express';
import analyticsRoutes from '../analyticsRoutes';
import { analyticsLog } from '../../db';

interface AnalyticsEntry {
  shortId: string;
  timestamp: Date;
  userAgent: string;
  ip: string;
}

const app = express();
app.use('/analytics', analyticsRoutes);

describe('Analytics Routes', () => {
  beforeEach(() => {
    analyticsLog.length = 0;

    const testData: AnalyticsEntry[] = [
      {
        shortId: 'test123',
        timestamp: new Date(),
        userAgent: 'test-agent',
        ip: '127.0.0.1'
      },
      {
        shortId: 'test123',
        timestamp: new Date(),
        userAgent: 'test-agent-2',
        ip: '127.0.0.2'
      },
      {
        shortId: 'different',
        timestamp: new Date(),
        userAgent: 'test-agent-3',
        ip: '127.0.0.3'
      }
    ];

    analyticsLog.push(...testData);
  });

  describe('GET /analytics/list', () => {
    it('should return all analytics entries', async () => {
      const response = await request(app)
        .get('/analytics/list')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(3);
      expect(response.body[0]).toHaveProperty('shortId');
      expect(response.body[0]).toHaveProperty('timestamp');
      expect(response.body[0]).toHaveProperty('userAgent');
      expect(response.body[0]).toHaveProperty('ip');
    });
  });

  describe('GET /analytics/:shortId', () => {
    it('should return analytics for specific shortId', async () => {
      const response = await request(app)
        .get('/analytics/test123')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
      expect(response.body.every((item: AnalyticsEntry) => item.shortId === 'test123')).toBeTruthy();
    });

  });
});