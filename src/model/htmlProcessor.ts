import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';
import { urlMap } from '../db';

export function processHTML(rawHTML: string): string {
  const dom = new JSDOM(rawHTML);
  const anchors = dom.window.document.querySelectorAll('a');

  anchors.forEach(anchor => {
    const originalUrl = anchor.href;
    const shortId = uuidv4().slice(0, 8);
    urlMap.set(shortId, originalUrl);
    anchor.href = `http://localhost:3000/${shortId}`;
  });

  return dom.serialize();
}