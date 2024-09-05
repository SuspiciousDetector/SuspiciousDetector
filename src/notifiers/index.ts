import fs from 'fs';
import path from 'path';
import { Notifier } from './notifier.interface';
import { logger } from '../utils/logger';

/**
 * This function allows easy addition of new notifier without modifying existing code using dynamically load.
 * @returns A promise that resolves to an array of initialized notifiers.
 */
export async function loadNotifiers(): Promise<Notifier[]> {
  const notifiersDir = path.join(__dirname);
  const currentFileExtension = path.extname(__filename);
  
  const notifierFiles = fs.readdirSync(notifiersDir).filter(file => 
    (file.endsWith('.ts') || file.endsWith('.js')) && 
    file !== `index${currentFileExtension}` && 
    file !== `notifier.interface${currentFileExtension}`
  );

  const notifiers: Notifier[] = [];

  for (const file of notifierFiles) {
    try {
      const NotifierClass = (await import(path.join(notifiersDir, file))).default;
      if (isNotifierClass(NotifierClass)) {
        notifiers.push(new NotifierClass());
        logger.info(`Loaded notifier: ${file}`);
    }
    } catch (error) {
      logger.error(`Failed to load notifier ${file}:`, error);
    }
  }

  return notifiers;
}

function isNotifierClass(cls: any): cls is new () => Notifier {
    return (
        typeof cls === 'function' &&
        cls.prototype !== undefined &&
        'notify' in cls.prototype
    );
}