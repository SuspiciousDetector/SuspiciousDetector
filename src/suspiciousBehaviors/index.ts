import fs from 'fs';
import path from 'path';
import { SuspiciousBehavior } from './suspiciousBehavior.interface';
import { logger } from '../utils/logger';

/**
 * This function allows easy addition of new behavior detectors without modifying existing code using dynamically load.
 * @returns A promise that resolves to an array of initialized suspicious behavior detectors.
 */
export async function loadBehaviors(): Promise<SuspiciousBehavior[]> {
    const behaviorsDir = __dirname;
    const currentFileExtension = path.extname(__filename);

    const behaviorFiles = fs.readdirSync(behaviorsDir).filter(file =>
        (file.endsWith('.ts') || file.endsWith('.js')) &&
        file !== `index${currentFileExtension}` &&
        file !== `suspiciousBehavior.interface${currentFileExtension}`
    );

    const behaviors: SuspiciousBehavior[] = [];

    for (const file of behaviorFiles) {
        try {
            const BehaviorClass = (await import(path.join(behaviorsDir, file))).default;
            if (isSuspiciousBehaviorClass(BehaviorClass)) {
                behaviors.push(new BehaviorClass());
                logger.info(`Loaded suspicious behavior: ${file}`);
            }
        } catch (error) {
            logger.error(`Failed to load suspicious behavior ${file}:`, error);
        }
    }

    return behaviors;
}

function isSuspiciousBehaviorClass(cls: any): cls is new () => SuspiciousBehavior {
    return (
        typeof cls === 'function' &&
        cls.prototype !== undefined &&
        'isSupicious' in cls.prototype &&
        'getDescription' in cls.prototype
    );
}