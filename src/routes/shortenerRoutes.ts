import express, { Request, RequestHandler } from 'express';
import Queue from 'bull';
import { urlMap } from '../db';
import { logAnalytics } from '../model/analytics';

// Create analytics queue
export const analyticsQueue = new Queue('analytics', {
    redis: {
      host: 'localhost',
      port: 6379,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 1000, 30000);
        console.log(`Retrying Redis connection in ${delay}ms...`);
        return delay;
      }
    }
  });

interface RequestParams {
  shortId: string;
}

interface AnalyticsData {
  shortId: string;
  timestamp: Date;
  userAgent: string;
  ip: string;
}

// Queue processor
analyticsQueue.process(async (job) => {
  const data: AnalyticsData = job.data;
  await logAnalytics(data);
});

const router = express.Router();

const handleShortUrl: RequestHandler<RequestParams> = async (req, res: any) => {
  const shortId = req.params.shortId;
  const originalUrl = urlMap.get(shortId);

  if (!originalUrl) {
    return res.status(404).send('URL not found');
  }

  // Add analytics to queue instead of processing directly
  await analyticsQueue.add({
    shortId,
    timestamp: new Date(),
    userAgent: req.headers['user-agent'] || 'unknown',
    ip: req.ip || ""
  });

  return res.redirect(302, originalUrl);
};

router.get('/:shortId', handleShortUrl);

export default router;