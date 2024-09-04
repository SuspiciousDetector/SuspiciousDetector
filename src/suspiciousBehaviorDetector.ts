import { SuspiciousBehavior } from './suspiciousBehaviors/suspiciousBehavior';
import { PushTimeBehavior } from './suspiciousBehaviors/pushTimeBehavior';
import { HackerTeamBehavior } from './suspiciousBehaviors/hackerTeamBehavior';
import { QuickDeleteRepoBehavior } from './suspiciousBehaviors/quickDeleteRepoBehavior';

// Event types that this behavior detector supports.
type EventType = 'push' | 'team' | 'repository' | string;

export class SuspiciousBehaviorDetector {
    private behaviorMap: Map<EventType, SuspiciousBehavior[]>;

    constructor() {
        this.behaviorMap = new Map();
        this.initializeBehaviors();
    }

    // Create all suspicious behavior the system supports
    private initializeBehaviors(): void {
        const pushTimeBehavior = new PushTimeBehavior();
        const hackerTeamBehavior = new HackerTeamBehavior();
        const quickDeleteRepoBehavior = new QuickDeleteRepoBehavior();

        this.addBehavior('push', pushTimeBehavior);
        this.addBehavior('team', hackerTeamBehavior);
        this.addBehavior('repository', quickDeleteRepoBehavior);
    }

    private addBehavior(eventType: EventType, behavior: SuspiciousBehavior): void {
        if (!this.behaviorMap.has(eventType)) {
            this.behaviorMap.set(eventType, []);
        }
        this.behaviorMap.get(eventType)!.push(behavior);
    }

    /**
     * Detect suspicious behaviors using provided webhook payload
     * @param payload - webhook payload from GitHub
     */
    detect(eventType: string, payload: any): void {
        const relevantBehaviors = this.behaviorMap.get(eventType as EventType) || [];

        for (const behavior of relevantBehaviors) {
            if (behavior.isSupicious(payload)) {
                console.log(behavior.getDescription(payload));
            }
        }
    }
}