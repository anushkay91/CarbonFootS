import { ActivityRecord, DataQuality } from '../types/domain';

const STORAGE_KEY = 'carbon_activity_records_v1';

export class ActivityRepository {
  static getAll(): ActivityRecord[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static save(record: ActivityRecord): void {
    const records = this.getAll();
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  static update(updatedRecord: ActivityRecord): void {
    const records = this.getAll().map(r => r.id === updatedRecord.id ? updatedRecord : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  static delete(id: string): void {
    const records = this.getAll().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}
