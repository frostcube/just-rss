import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { SQLiteDriver } from '@derme302/localforage-capacitorsqlitedriver';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public isReady: boolean = false;
  public onReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.defineDriver(new SQLiteDriver());
    const storage = await this.storage.create();
    this._storage = storage;
    this.isReady = true;
    this.onReady.next(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  public async get(key: string) {
    return this._storage?.get(key);
  }

  public async getObjectFromStorage(list_name: string) {
    if (this.isReady) {
      const storage_item = await this.get(list_name);

      if (storage_item !== undefined) {
        const storage_item_json = this.legacyParseJson(storage_item);

        if (storage_item_json !== null) {
          return storage_item_json;
        }
        else {
          console.warn('[StorageService] ' + list_name + ' list storage is not valid JSON, setting as empty');
          console.log(storage_item_json);
          return null;
        }
      }
      else {
        console.error('[StorageService] Storage not defined, check for compatible storage driver');
      }
    }
    else {
      console.error('[StorageService] Device storage not ready');
    }
  }

  // Support for legacy single encoded values in version before 2.6.0
  private legacyParseJson(storage_item: string) {
    try {
      return JSON.parse(storage_item);
    } catch (e) {
      console.log('[StorageService] Single encoded value, directly returning:', e);
      return storage_item;
    }
  }
}
