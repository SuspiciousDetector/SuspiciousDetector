import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import yaml from 'js-yaml';
import SmeeClient from 'smee-client';
import { WebhookHandler } from './webhookHandler';

// Load configuration from YAML file
let config;
try {
  const fileConfig = fs.readFileSync('./config.yml', 'utf8');
  config = yaml.load(fileConfig) as any;
} catch (e) {
  console.error('Error loading configuration:', e);
  process.exit(1);
}

const app = express();
const port = config.server.port;

app.use(bodyParser.json());

// Initialize and start smee client for forwarding webhooks to localhost
const smee = new SmeeClient({
    source: config.smee.url,
    target: `http://localhost:${port}/webhook`,
    logger: console
});
smee.start();

// Initialize webhook component
const webhookHandler = new WebhookHandler();

/**
 * Define webhook endpoint which receives GitHub webhook events and send them to the WebhookHandler
 */
app.post('/webhook', (req, res) => {
    webhookHandler.handle(req.body);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});