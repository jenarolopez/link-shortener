import { analyticsLog } from '../db';

interface AnalyticsEvent {
  shortId: string;
  timestamp: Date;
  userAgent: string;
  ip: string;
}

export function logAnalytics(event: AnalyticsEvent) {
  // In real-world: Push to a queue or batch write here
  analyticsLog.push(event);
  console.log(`[Analytics] Logged click on ${event.shortId} from ${event.ip}`);
}

export function getAnalyticsByShortId(shortId: string): AnalyticsEvent[] {
  return analyticsLog.filter(log => log.shortId === shortId);
}

export function getAllAnalytics(): AnalyticsEvent[] {
  return analyticsLog;
}