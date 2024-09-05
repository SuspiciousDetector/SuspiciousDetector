import { Request, Response } from 'express';
import { SuspiciousBehaviorDetector, WebhookPayload } from './suspiciousBehaviorDetector';
import { logger } from './utils/logger';

export class WebhookHandler {
    constructor(private detector: SuspiciousBehaviorDetector) { }

    /**
     * Processes an incoming webhook request.
     * This method extracts relevant information from the request, constructs a WebhookPayload, and passes it to the SuspiciousBehaviorDetector.
     * @param req - Express request object
     * @param res - Express response object
     * @returns 
     */
    public handle(req: Request, res: Response): void {
        const eventType = req.headers['x-github-event'] as string;
        if (!eventType) {
            logger.error('Received webhook without X-GitHub-Event header');
            res.status(400).send('Missing X-GitHub-Event header');
            return;
        }

        const webhookPayload: WebhookPayload = {
            eventType,
            payload: req.body
        };

        this.detector.detect(webhookPayload);
        res.sendStatus(200);
    }
}