import express from 'express';
import bodyParser from 'body-parser';
import { config } from './config';
import SmeeClient from 'smee-client';
import { WebhookHandler } from './webhookHandler';

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