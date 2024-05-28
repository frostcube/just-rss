import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';

const SETTINGS_DICT = 'settings_dict';

export interface ISettingsDict {
    preview: boolean,
    showImages: boolean,
    compressedFeed: boolean,
    locale: string,
    retrievalTimeout: number,
    defaultPollingFrequency: number,
    maxFeedLength: number
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _settingsDict: ISettingsDict = {
    preview: true,
    showImages: false,
    compressedFeed: false,
    locale: 'en-AU',
    retrievalTimeout: 2000, // 2 seconds
    defaultPollingFrequency: 0, // Unlimited
    maxFeedLength: 10
  };

  constructor(private storageService: StorageService) {
    this.storageService.onReady.subscribe(() => {
      this.initSettings(this.storageService.onReady.value);
    });
  }

  private initSettings(status: boolean) {
    if (status === true) {
      console.log('[SettingsService] Storage onReady status changed to true');
      this.loadSettingsDict();
    }
    else {
      console.log('[SettingsService] Storage onReady status changed to false');
    }
  }
 
  public updateSettings(settings: ISettingsDict): void {
    this._settingsDict = settings;
    this.storageService.set(SETTINGS_DICT, JSON.stringify(this._settingsDict));
    console.log(`[SettingsService] Updated settings: ${this._settingsDict}`);
  }

  public getSettings() {
    return this._settingsDict;
  }

  public async loadSettingsDict() {
    const storage_feed = await this.storageService.getObjectFromStorage(SETTINGS_DICT);
    
    if (storage_feed !== null)
      this._settingsDict = storage_feed;
    else
      this.storageService.set(SETTINGS_DICT, JSON.stringify(this._settingsDict));
  }
}
