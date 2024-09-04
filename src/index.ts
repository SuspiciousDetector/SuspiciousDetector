import express from 'express';
import bodyParser from 'body-parser';
import { config } from './config';
import SmeeClient from 'smee-client';
import { WebhookHandler } from './webhookHandler';
import { SuspiciousBehaviorDetector } from './suspiciousBehaviorDetector';
import { ConsoleNotifier } from './notifiers/consoleNotifier';

const app = express();
const port = config.serverPort;

app.use(bodyParser.json());

// Initialize and start smee client for forwarding webhooks to localhost
const smee = new SmeeClient({
    source: config.smeeUrl,
    target: `http://localhost:${port}/webhook`,
    logger: console
});
smee.start();

// Initializea app components
const notifier = new ConsoleNotifier();
const detector = new SuspiciousBehaviorDetector(notifier);
const webhookHandler = new WebhookHandler(detector);

/**
 * Define webhook endpoint which receives GitHub webhook events and send them to the WebhookHandler
 */
app.post('/webhook', (req, res) => {
    const eventType = req.headers['x-github-event'] as string;
    webhookHandler.handle(eventType, req.body);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});