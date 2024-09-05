import express from 'express';
import bodyParser from 'body-parser';
import SmeeClient from 'smee-client';
import { config } from './config';
import { database } from './database';
import { WebhookHandler } from './webhookHandler';
import { SuspiciousBehaviorDetector } from './suspiciousBehaviorDetector';
import { loadNotifiers } from './notifiers';
import { loadBehaviors } from './suspiciousBehaviors';
import { logger } from './utils/logger';
import { errorHandler } from './utils/errorHandler';

// Create a silent logger for SmeeClient
const silentLogger = {
    info: () => { },
    error: () => { }
};

// Sets up the Smee client for forwarding webhooks to localhost
async function setupSmeeClient(targetUrl: string): Promise<void> {
    const smeeUrl = config.smeeUrl;
    if (!smeeUrl) {
        logger.info('Smee URL not provided, skipping Smee client setup');
        return;
    }

    const smee = new SmeeClient({
        source: smeeUrl,
        target: targetUrl,
        logger: silentLogger
    });

    smee.start();
    logger.info(`Smee client forwarding ${smeeUrl} to ${targetUrl}`);
}

async function bootstrap() {
    try {
        // Initialize the database
        await database.waitForInitialization();

        const app = express();
        app.use(bodyParser.json());

        // Load notifiers and suspicious behaviors
        const notifiers = await loadNotifiers();
        const behaviors = await loadBehaviors();

        // Initialize the suspicious behavior detector and webhook handler
        const detector = new SuspiciousBehaviorDetector(notifiers, behaviors);
        const webhookHandler = new WebhookHandler(detector);

        app.post('/webhook', (req, res) => {
            webhookHandler.handle(req, res);
        });

        app.use(errorHandler);

        const port = config.serverPort;
        const server = app.listen(port, () => {
            logger.info(`Server is running on http://localhost:${port}`);
        });

        // Setup Smee client after the server is listening
        await setupSmeeClient(`http://localhost:${port}/webhook`);

        process.on('SIGINT', async () => {
            logger.info('Shutting down gracefully...');
            await database.close();
            server.close();
            process.exit(0);
        });
    } catch (error) {
        logger.error('Failed to start the application:', error);
        process.exit(1);
    }
}

bootstrap();