export interface SuspiciousBehavior {
    isSupicious(payload: any): boolean;
    getDescription(payload: any): string;
  }