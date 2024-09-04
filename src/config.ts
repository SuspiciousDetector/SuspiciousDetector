import fs from 'fs';
import yaml from 'js-yaml';

interface Config {
  server: {
    port: number;
  };
  smee: {
    url: string;
  };
}

class Configuration {
  private config: Config;

  constructor() {
    try {
      const fileConfig = fs.readFileSync('./config.yml', 'utf8');
      this.config = yaml.load(fileConfig) as Config;
    } catch (e) {
      console.error('Error loading configuration:', e);
      process.exit(1);
    }
  }

  get serverPort(): number {
    return this.config.server.port;
  }

  get smeeUrl(): string {
    return this.config.smee.url;
  }
}

export const config = new Configuration();