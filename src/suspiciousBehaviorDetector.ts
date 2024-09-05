import { Notifier } from './notifiers/notifier.interface';
import { SuspiciousBehavior } from './suspiciousBehaviors/suspiciousBehavior.interface';
import { logger } from './utils/logger';

export interface WebhookPayload {
    eventType: string;
    payload: any;
}

export class SuspiciousBehaviorDetector {
    // Map to store behavior detectors indexed by the event types they support
    private behaviorMap: Map<string, SuspiciousBehavior[]> = new Map();

    constructor(private notifiers: Notifier[], behaviors: SuspiciousBehavior[]) {
        this.initializeBehaviors(behaviors);
    }

    // Initializes the behavior map with the provided behavior detectors.
    private initializeBehaviors(behaviors: SuspiciousBehavior[]): void {
        behaviors.forEach(behavior => {
            behavior.supportedEvents.forEach(eventType => {
                if (!this.behaviorMap.has(eventType)) {
                    this.behaviorMap.set(eventType, []);
                }
                this.behaviorMap.get(eventType)!.push(behavior);
            });
        });
    }

    /**
     * Detects suspicious behaviors based on the provided webhook payload.
     * If suspicious behavior is detected, all registered notifiers are called.
     * @param webhookPayload 
     */
    public detect(webhookPayload: WebhookPayload): void {
        const { eventType, payload } = webhookPayload;
        const relevantBehaviors = this.behaviorMap.get(eventType) || [];

        relevantBehaviors.forEach(behavior => {
            if (behavior.isSupicious(payload)) {
                const description = behavior.getDescription(payload);
                this.notifiers.forEach(notifier => notifier.notify(description));
            }
        });
    }
}