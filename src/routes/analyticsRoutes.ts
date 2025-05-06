import express, { Request, Response } from 'express';
import { getAllAnalytics, getAnalyticsByShortId } from '../model/analytics';
import { analyticsLog } from '../db';

const router = express.Router();

interface ShortIdParams {
    shortId: string;
}

// Get all analytics
router.get('/list', (_req: Request, res: Response) => {
    const analytics = getAllAnalytics();
    res.json(analytics);
});

// Get analytics for specific shortId
router.get('/:shortId', (req: Request<ShortIdParams>, res: Response) => {
    const shortId = req.params.shortId;
    const analytics = getAnalyticsByShortId(shortId);
    res.json(analytics);
});

export default router;