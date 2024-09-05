import { Notifier } from './notifier.interface';
import { logger } from '../utils/logger';

export default class ConsoleNotifier implements Notifier {
    // Log the suspicious behavior message to the console.
    notify(message: string): void {
        logger.warn(`Suspicious behavior detected: ${message}`);
    }
}