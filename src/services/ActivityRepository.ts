import { ActivityRecord } from '../types/domain';
import { StorageManager } from './StorageManager';
import { validateActivityRecord } from '../utils/validation';

const STORAGE_KEY = 'carbon_activity_records_v1';

export class ActivityRepository {
  static getAll(): ActivityRecord[] {
    return StorageManager.loadData<ActivityRecord>(STORAGE_KEY, (item) => validateActivityRecord(item).valid);
  }

  static save(record: ActivityRecord): boolean {
    const validation = validateActivityRecord(record);
    if (!validation.valid) {
      console.error('[ActivityRepository] Validation failed for save:', validation.errors);
      throw new Error(`Invalid activity record: ${validation.errors.join(', ')}`);
    }
    const records = this.getAll();
    records.push(record);
    return StorageManager.saveData(STORAGE_KEY, records);
  }

  static update(updatedRecord: ActivityRecord): boolean {
    const validation = validateActivityRecord(updatedRecord);
    if (!validation.valid) {
      console.error('[ActivityRepository] Validation failed for update:', validation.errors);
      throw new Error(`Invalid activity record: ${validation.errors.join(', ')}`);
    }
    const records = this.getAll().map(r => r.id === updatedRecord.id ? updatedRecord : r);
    return StorageManager.saveData(STORAGE_KEY, records);
  }

  static delete(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    const records = this.getAll().filter(r => r.id !== id);
    return StorageManager.saveData(STORAGE_KEY, records);
  }
}
