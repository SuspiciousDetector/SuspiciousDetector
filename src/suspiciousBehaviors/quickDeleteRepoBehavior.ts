import { SuspiciousBehavior } from './suspiciousBehavior';

export class QuickDeleteRepoBehavior implements SuspiciousBehavior {
    private repoCreationTimes: Map<string, Date> = new Map();
    private static readonly DELETE_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds

    isSupicious(payload: any): boolean {
        const repoId = payload.repository.id;

        if (payload.action === 'created') {
            let eventTime = new Date(payload.repository.created_at);
            this.repoCreationTimes.set(repoId, eventTime);
            return false;
        }

        if (payload.action === 'deleted') {
            let eventTime = new Date(payload.repository.updated_at);
            const creationTime = this.repoCreationTimes.get(repoId);
            if (!creationTime) return false;

            this.repoCreationTimes.delete(repoId);

            const timeDifference = eventTime.getTime() - creationTime.getTime();
            return timeDifference < QuickDeleteRepoBehavior.DELETE_THRESHOLD;
        }

        return false;
    }

    getDescription(payload: any): string {
        return `Repository ${payload.repository.name} was created and deleted within 10 minutes`;
    }
}