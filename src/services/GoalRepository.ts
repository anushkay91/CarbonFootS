import { CarbonGoal, GoalCheckIn } from '../types/domain';

const GOALS_KEY = 'carbon_goals_v1';
const CHECKINS_KEY = 'carbon_checkins_v1';

export class GoalRepository {
  static getGoals(): CarbonGoal[] {
    const stored = localStorage.getItem(GOALS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveGoal(goal: CarbonGoal): void {
    const goals = this.getGoals();
    goals.push(goal);
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }

  static getCheckIns(goalId: string): GoalCheckIn[] {
    const stored = localStorage.getItem(CHECKINS_KEY);
    const allCheckIns: GoalCheckIn[] = stored ? JSON.parse(stored) : [];
    return allCheckIns.filter(c => c.goalId === goalId);
  }

  static saveCheckIn(checkIn: GoalCheckIn): void {
    const stored = localStorage.getItem(CHECKINS_KEY);
    const allCheckIns: GoalCheckIn[] = stored ? JSON.parse(stored) : [];
    allCheckIns.push(checkIn);
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(allCheckIns));
  }
}
