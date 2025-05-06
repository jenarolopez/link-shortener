import express from 'express';
import bodyParser from 'body-parser';
import { processHTML } from './model/htmlProcessor';
import shortenerRoutes from './routes/shortenerRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

const app = express();
app.use(bodyParser.text({ type: 'text/html' }));

// HTML Processor Endpoint
app.post('/process-html', (req, res) => {
  const rawHTML = req.body;
  const processedHTML = processHTML(rawHTML);
  res.send(processedHTML);
});

// Shortener + Analytics
app.use('/', shortenerRoutes);
app.use('/analytics', analyticsRoutes);

app.listen(3000, () => {
  console.log('Server listening at http://localhost:3000');
});