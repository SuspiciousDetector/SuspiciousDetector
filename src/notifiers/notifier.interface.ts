export interface Notifier {
  /**
   * Sends a notification about a detected suspicious behavior.
   * @param message - description of the suspicious behavior
   */
  notify(message: string): void;
}