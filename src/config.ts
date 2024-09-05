import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { logger } from './utils/logger';

interface Config {
    server: { port: number };
    database: { filename: string };
    smee?: { url: string };
}

class Configuration {
    private config: Config;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): Config {
        try {
            const configPath = path.resolve('./config/default.yml');
            const fileContents = fs.readFileSync(configPath, 'utf8');
            return yaml.load(fileContents) as Config;
        } catch (e) {
            logger.error('Error loading configuration:', e);
            process.exit(1);
        }
    }

    get serverPort(): number {
        return this.config.server.port;
    }

    get databaseFilename(): string {
        return this.config.database.filename;
    }

    get smeeUrl(): string | undefined {
        return this.config.smee?.url;
    }
}

export const config = new Configuration();