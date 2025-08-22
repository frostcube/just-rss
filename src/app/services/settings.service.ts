import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';

const SETTINGS_DICT = 'v3_settings_dict';

export interface ISettingsDict {
    preview: boolean,
    showImages: boolean,
    compressedFeed: boolean,
    locale: string,
    retrievalTimeout: number,
    defaultPollingFrequency: number,
    maxFeedLength: number,
    mutedWords: Array<string>,
    highlightedWords: Array<string>
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
    retrievalTimeout: 5000, // 5 seconds
    defaultPollingFrequency: 0, // Unlimited
    maxFeedLength: 10,
    mutedWords: [],
    highlightedWords: []
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
    this.storageService.set(SETTINGS_DICT, this._settingsDict);
    console.log(`[SettingsService] Updated settings: ${this._settingsDict}`);
  }

  public getSettings() {
    return this._settingsDict;
  }

  public async loadSettingsDict() {
    console.log('[SettingsService] Loading settings from storage');
    const current_settings = await this.storageService.getObjectFromStorage(SETTINGS_DICT);

    if (current_settings !== null) {
      // Merge stored settings into defaults for backward compatibility
      this._settingsDict = { ...this._settingsDict, ...(current_settings as Partial<ISettingsDict>) };
      // Normalize optional arrays that may be missing in older settings
      this._settingsDict.mutedWords = this._settingsDict.mutedWords ?? [];
      this._settingsDict.highlightedWords = this._settingsDict.highlightedWords ?? [];
    }
    else
      this.storageService.set(SETTINGS_DICT, this._settingsDict);
  }
}
