import sqlite3 from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';

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

    private async init(): Promise<void> {
        try {
            this.db = await open({
                filename: './repo_creation_times.sqlite',
                driver: sqlite3.Database
            });

            await this.db.exec(`
        CREATE TABLE IF NOT EXISTS repo_creation_times (
          repo_id TEXT PRIMARY KEY,
          creation_time INTEGER
        )
      `);
            console.info('Database initialized');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    async waitForInitialization(): Promise<void> {
        return this.initPromise;
    }

    async getAllRepoCreationTimes(): Promise<RepoCreationTime[]> {
        await this.waitForInitialization();
        if (!this.db) throw new Error('Database not initialized');
        return this.db.all('SELECT repo_id, creation_time FROM repo_creation_times');
    }

    async setRepoCreationTime(repoId: string, creationTime: Date): Promise<void> {
        await this.waitForInitialization();
        if (!this.db) throw new Error('Database not initialized');
        await this.db.run(
            'INSERT OR REPLACE INTO repo_creation_times (repo_id, creation_time) VALUES (?, ?)',
            repoId,
            creationTime.getTime()
        );
    }

    async deleteRepoCreationTime(repoId: string): Promise<void> {
        await this.waitForInitialization();
        if (!this.db) throw new Error('Database not initialized');
        await this.db.run('DELETE FROM repo_creation_times WHERE repo_id = ?', repoId);
    }

    async close(): Promise<void> {
        await this.waitForInitialization();
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
}

export const database = new Database();