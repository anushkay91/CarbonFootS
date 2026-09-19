export interface VersionedStoragePayload<T> {
  version: number;
  data: T[];
}

export class StorageManager {
  static loadData<T>(storageKey: string, validator: (item: unknown) => boolean): T[] {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];

      let parsed: unknown;
      try {
        parsed = JSON.parse(stored);
      } catch (jsonErr) {
        console.warn(`[StorageManager] Corrupted JSON in ${storageKey}. Retaining backup and initializing empty/safe state.`);
        // Save corrupted backup for safety
        localStorage.setItem(`${storageKey}_backup_${Date.now()}`, stored);
        return [];
      }

      // Handle versioned payload or raw array
      let items: unknown[] = [];
      if (parsed && typeof parsed === 'object' && 'version' in parsed && 'data' in parsed) {
        const payload = parsed as VersionedStoragePayload<unknown>;
        // Future/current version check
        if (payload.version > 1) {
          console.warn(`[StorageManager] Storage version ${payload.version} is newer than supported version 1.`);
        }
        items = Array.isArray(payload.data) ? payload.data : [];
      } else if (Array.isArray(parsed)) {
        items = parsed; // Migrate legacy unversioned array
      } else {
        return [];
      }

      const validItems: T[] = [];
      for (const item of items) {
        if (validator(item)) {
          validItems.push(item as T);
        } else {
          console.warn(`[StorageManager] Dropping invalid record in ${storageKey}:`, item);
        }
      }

      return validItems;
    } catch (err) {
      console.error(`[StorageManager] Error reading ${storageKey}:`, err);
      return [];
    }
  }

  static saveData<T>(storageKey: string, data: T[]): boolean {
    try {
      const payload: VersionedStoragePayload<T> = {
        version: 1,
        data
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      return true;
    } catch (err) {
      if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
        console.error('[StorageManager] LocalStorage quota exceeded.');
      } else {
        console.error('[StorageManager] Error saving to localStorage:', err);
      }
      return false;
    }
  }
}
