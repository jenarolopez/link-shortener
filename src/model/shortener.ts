import express, { Request, Response, RequestHandler, Application } from 'express';
import { urlMap } from '../db';
import { logAnalytics } from './analytics';

const router = express.Router();

const handleShortUrl = (req: any, res: any) => {
  const shortId = req.params.shortId;
  const originalUrl = urlMap.get(shortId);

  if (!originalUrl) {
    return res.status(404).send('URL not found');
  }

  logAnalytics({
    shortId,
    timestamp: new Date(),
    userAgent: req.headers['user-agent'] || 'unknown',
    ip: req.ip || ""
  });

  return res.redirect(302, originalUrl);
};

router.get('/:shortId', handleShortUrl);

export default router;