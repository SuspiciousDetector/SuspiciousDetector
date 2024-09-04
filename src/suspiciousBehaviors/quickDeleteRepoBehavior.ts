import { SuspiciousBehavior } from './suspiciousBehavior';
import { database, RepoCreationTime } from '../database';

export class QuickDeleteRepoBehavior implements SuspiciousBehavior {
    private repoCreationTimes: Map<string, Date> = new Map();
    private static readonly DELETE_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds
    private initialized: boolean = false;

    constructor() {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            await database.waitForInitialization();
            await this.loadFromDatabase();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize QuickDeleteRepoBehavior:', error);
        }
    }

    private async loadFromDatabase(): Promise<void> {
        const allRepos = await database.getAllRepoCreationTimes();
        allRepos.forEach((repo: RepoCreationTime) => {
            this.repoCreationTimes.set(repo.repo_id, new Date(repo.creation_time));
        });
        console.log(`Loaded ${this.repoCreationTimes.size} repo creation times from database`);
    }

    private updateDatabase(operation: () => Promise<void>): void {
        operation().catch(error => {
            console.error('Error updating database:', error);
        });
    }

    isSupicious(payload: any): boolean {
        if (!this.initialized) {
            console.log('QuickDeleteRepoBehavior not yet initialized, skipping check');
            return false;
        }

        const repoId = payload.repository.id;

        if (payload.action === 'created') {
            let eventTime = new Date(payload.repository.created_at);
            this.repoCreationTimes.set(repoId, eventTime);
            this.updateDatabase(() => database.setRepoCreationTime(repoId, eventTime));
            return false;
        }

        if (payload.action === 'deleted') {
            let eventTime = new Date(payload.repository.updated_at);
            const creationTime = this.repoCreationTimes.get(repoId);
            if (!creationTime) return false;

            this.repoCreationTimes.delete(repoId);
            this.updateDatabase(() => database.deleteRepoCreationTime(repoId));

            const timeDifference = eventTime.getTime() - creationTime.getTime();
            return timeDifference < QuickDeleteRepoBehavior.DELETE_THRESHOLD;
        }

        return false;
    }

    getDescription(payload: any): string {
        return `Repository ${payload.repository.name} was created and deleted within 10 minutes`;
    }
}