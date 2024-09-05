import { SuspiciousBehavior } from './suspiciousBehavior.interface';
import { database, RepoCreationTime } from '../database';
import { logger } from '../utils/logger';

export default class QuickDeleteRepoBehavior implements SuspiciousBehavior {
    supportedEvents = ['repository'];
    private repoCreationTimes: Map<string, Date> = new Map();
    private static readonly DELETE_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds
    private initialized: boolean = false;

    constructor() {
        this.initialize();
    }

    // Initializes the behavior by loading existing repository creation times from the database.
    private async initialize(): Promise<void> {
        try {
            await database.waitForInitialization();
            await this.loadFromDatabase();
            this.initialized = true;
            logger.info('QuickDeleteRepoBehavior initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize QuickDeleteRepoBehavior:', error);
        }
    }

    // Loads repository creation times from the database.
    private async loadFromDatabase(): Promise<void> {
        try {
            const allRepos = await database.getAllRepoCreationTimes();
            allRepos.forEach((repo: RepoCreationTime) => {
                if (repo && repo.repo_id && repo.creation_time) {
                    this.repoCreationTimes.set(repo.repo_id, new Date(repo.creation_time));
                } else {
                    logger.warn('Received invalid repo data:', repo);
                }
            });
            logger.info(`Loaded ${this.repoCreationTimes.size} repo creation times from database`);
        } catch (error) {
            logger.error('Error loading repo creation times from database:', error);
            throw error;
        }
    }

    /**
     * Checks if a repository was created and deleted within a short time frame.
     * @param payload - webhook payload from GitHub
     * @returns True if repository deleted within a short time frame
     */
    isSupicious(payload: any): boolean {
        if (!this.initialized) {
            logger.warn('QuickDeleteRepoBehavior not yet initialized, skipping check');
            return false;
        }

        const repoId = String(payload.repository.id);

        if (payload.action === 'created') {
            let eventTime = new Date(payload.repository.created_at);
            this.repoCreationTimes.set(repoId, eventTime);
            database.setRepoCreationTime(repoId, eventTime).catch(error => {
                logger.error('Error updating database:', error);
            });
            return false;
        }

        if (payload.action === 'deleted') {
            let eventTime = new Date(payload.repository.updated_at);
            const creationTime = this.repoCreationTimes.get(repoId);
            if (!creationTime) return false;

            this.repoCreationTimes.delete(repoId);
            database.deleteRepoCreationTime(repoId).catch(error => {
                logger.error('Error updating database:', error);
            });

            const timeDifference = eventTime.getTime() - creationTime.getTime();
            return timeDifference < QuickDeleteRepoBehavior.DELETE_THRESHOLD;
        }

        return false;
    }

    getDescription(payload: any): string {
        return `Repository ${payload.repository.name} was created and deleted within 10 minutes`;
    }
}