import { SuspiciousBehaviorDetector } from "./suspiciousBehaviorDetector";

export class WebhookHandler {
    constructor(private detector: SuspiciousBehaviorDetector) {}
    
    /**
     * Handle incoming webhooks
     * @param payload - Webhook payload from GitHub
     */
    handle(eventType: string, payload: any): void {
        this.detector.detect(eventType, payload);
    }
}