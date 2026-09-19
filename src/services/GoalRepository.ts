import { CarbonGoal, GoalCheckIn } from '../types/domain';
import { StorageManager } from './StorageManager';
import { validateCarbonGoal, validateGoalCheckIn } from '../utils/validation';

const GOALS_KEY = 'carbon_goals_v1';
const CHECKINS_KEY = 'carbon_checkins_v1';

export class GoalRepository {
  static getGoals(): CarbonGoal[] {
    return StorageManager.loadData<CarbonGoal>(GOALS_KEY, (item) => validateCarbonGoal(item).valid);
  }

  static saveGoal(goal: CarbonGoal): boolean {
    const validation = validateCarbonGoal(goal);
    if (!validation.valid) {
      console.error('[GoalRepository] Validation failed for saveGoal:', validation.errors);
      throw new Error(`Invalid goal: ${validation.errors.join(', ')}`);
    }
    const goals = this.getGoals();
    goals.push(goal);
    return StorageManager.saveData(GOALS_KEY, goals);
  }

  static updateGoal(updatedGoal: CarbonGoal): boolean {
    const validation = validateCarbonGoal(updatedGoal);
    if (!validation.valid) {
      console.error('[GoalRepository] Validation failed for updateGoal:', validation.errors);
      throw new Error(`Invalid goal: ${validation.errors.join(', ')}`);
    }
    const goals = this.getGoals();
    const index = goals.findIndex(g => g.id === updatedGoal.id);
    if (index !== -1) {
      goals[index] = updatedGoal;
      return StorageManager.saveData(GOALS_KEY, goals);
    }
    return false;
  }

  static deleteGoal(goalId: string): boolean {
    if (!goalId || typeof goalId !== 'string') return false;
    const goals = this.getGoals();
    const filtered = goals.filter(g => g.id !== goalId);
    const savedGoals = StorageManager.saveData(GOALS_KEY, filtered);

    const checkIns = StorageManager.loadData<GoalCheckIn>(CHECKINS_KEY, (item) => validateGoalCheckIn(item).valid);
    const remainingCheckIns = checkIns.filter(c => c.goalId !== goalId);
    const savedCheckIns = StorageManager.saveData(CHECKINS_KEY, remainingCheckIns);

    return savedGoals && savedCheckIns;
  }

  static getCheckIns(goalId: string): GoalCheckIn[] {
    if (!goalId || typeof goalId !== 'string') return [];
    const allCheckIns = StorageManager.loadData<GoalCheckIn>(CHECKINS_KEY, (item) => validateGoalCheckIn(item).valid);
    return allCheckIns.filter(c => c.goalId === goalId);
  }

  static saveCheckIn(checkIn: GoalCheckIn): boolean {
    const validation = validateGoalCheckIn(checkIn);
    if (!validation.valid) {
      console.error('[GoalRepository] Validation failed for saveCheckIn:', validation.errors);
      throw new Error(`Invalid check-in: ${validation.errors.join(', ')}`);
    }
    const allCheckIns = StorageManager.loadData<GoalCheckIn>(CHECKINS_KEY, (item) => validateGoalCheckIn(item).valid);
    allCheckIns.push(checkIn);
    return StorageManager.saveData(CHECKINS_KEY, allCheckIns);
  }
}
