import { SuspiciousBehavior } from './suspiciousBehavior.interface';

export default class HackerTeamBehavior implements SuspiciousBehavior {
    supportedEvents = ['team'];

    // Checks if a team was created with a name starting with "hacker".
    isSupicious(payload: any): boolean {
        return payload.action === 'created' && payload.team.name.toLowerCase().startsWith('hacker');
    }

    getDescription(payload: any): string {
        return `Team created with suspicious name: ${payload.team.name}`;
    }
}