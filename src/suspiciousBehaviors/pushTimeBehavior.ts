import { SuspiciousBehavior } from './suspiciousBehavior.interface';

export default class PushTimeBehavior implements SuspiciousBehavior {
    supportedEvents = ['push'];

    // Checks if a push event occurred between 14:00-16:00 UTC.
    isSupicious(payload: any): boolean {
        const pushTime = new Date(payload.repository.pushed_at * 1000);
        const hour = pushTime.getUTCHours();
        return hour >= 14 && hour <= 16;
    }

    getDescription(payload: any): string {
        return `Push detected between 14:00-16:00 UTC to repository ${payload.repository.name}`;
    }
}