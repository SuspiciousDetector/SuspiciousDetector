import { SuspiciousBehavior } from './suspiciousBehavior';

export class HackerTeamBehavior implements SuspiciousBehavior {
  isSupicious(payload: any): boolean {
    return payload.action === 'created' && payload.team.name.toLowerCase().startsWith('hacker');
  }

  getDescription(payload: any): string {
    return `Team created with suspicious name: ${payload.team.name}`;
  }
}