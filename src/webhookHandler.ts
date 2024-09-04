export class WebhookHandler {
    /**
     * Handle incoming webhooks
     * @param payload - Webhook payload from GitHub
     */
    handle(payload: any): void {
        console.log(payload);
    }
}