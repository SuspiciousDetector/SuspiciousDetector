import sqlite3 from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';
import { config } from './config';
import { logger } from './utils/logger';

export interface RepoCreationTime {
    repo_id: string;
    creation_time: number;
}

export class Database {
    private db: SQLiteDatabase | null = null;
    private initPromise: Promise<void>;

    constructor() {
        this.initPromise = this.init();
    }

    // Initializes the database connection and creates repo_creation_times table if not exist.
    private async init(): Promise<void> {
        try {
            this.db = await open({
                filename: config.databaseFilename,
                driver: sqlite3.Database
            });

            await this.db.exec(`
        CREATE TABLE IF NOT EXISTS repo_creation_times (
          repo_id TEXT PRIMARY KEY,
          creation_time INTEGER
        )
      `);
            logger.info('Database initialized');
        } catch (error) {
            logger.error('Failed to initialize database:', error);
            throw error;
        }
    }

    // Waits for the database initialization to complete.
    async waitForInitialization(): Promise<void> {
        return this.initPromise;
    }

    // Get all repository creation times from the database.
    async getAllRepoCreationTimes(): Promise<RepoCreationTime[]> {
        await this.waitForInitialization();
        if (!this.db) throw new Error('Database not initialized');
        return this.db.all<RepoCreationTime[]>('SELECT repo_id, creation_time FROM repo_creation_times');
    }

    // Sets the creation time for a repository in the database.
    async setRepoCreationTime(repoId: string, creationTime: Date): Promise<void> {
        await this.waitForInitialization();
        if (!this.db) throw new Error('Database not initialized');
        await this.db.run(
            'INSERT OR REPLACE INTO repo_creation_times (repo_id, creation_time) VALUES (?, ?)',
            repoId,
            creationTime.getTime()
        );
    }

    // Deletes the creation time record for a repository from the database.
    async deleteRepoCreationTime(repoId: string): Promise<void> {
        await this.waitForInitialization();
        if (!this.db) throw new Error('Database not initialized');
        await this.db.run('DELETE FROM repo_creation_times WHERE repo_id = ?', repoId);
    }

    // Closes the database connection.
    async close(): Promise<void> {
        await this.waitForInitialization();
        if (this.db) {
            await this.db.close();
            this.db = null;
            logger.info('Database connection closed');
        }
    }
}

export const database = new Database();