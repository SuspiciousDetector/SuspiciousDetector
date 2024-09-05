export interface SuspiciousBehavior {
  /**
   * List of GitHub webhook event types that this behavior detector supports.
   * Each detector should specify which event types it can handle.
   */
  supportedEvents: string[];

  /**
   * Check if the given payload represents suspicious behavior.
   * @param payload 
   */
  isSupicious(payload: any): boolean;

  /**
   * Get description of the detected suspicious behavior.
   * @param payload 
   */
  getDescription(payload: any): string;
}