import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';

const SETTINGS_DICT = 'v3_settings_dict';

export interface ISettingsDict {
    preview: boolean,
    showImages: 'never' | 'whenHighlighted' | 'always',
    showSnippet: 'never' | 'whenHighlighted' | 'always',
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
    showImages: 'whenHighlighted',
    showSnippet: 'whenHighlighted',
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
 
  /**
   * Normalize incoming settings (merge with defaults and support old formats)
   */
  private normalizeSettings(incoming: Partial<ISettingsDict> | unknown): ISettingsDict {
    const merged: ISettingsDict = { ...this._settingsDict, ...(incoming as Partial<ISettingsDict> || {}) } as ISettingsDict;

    // Backwards compatibility for showImages: older versions used boolean
    const rawShow = (incoming as Partial<Record<string, unknown>>)?.['showImages'];
    if (typeof rawShow === 'boolean') {
      merged.showImages = rawShow ? 'always' : 'never';
    } else if (typeof rawShow === 'string') {
      const allowed = ['never', 'whenHighlighted', 'always'];
      merged.showImages = allowed.includes(rawShow) ? (rawShow as ISettingsDict['showImages']) : this._settingsDict.showImages;
    } else {
      // keep default/merged
      merged.showImages = (merged.showImages as ISettingsDict['showImages']) ?? this._settingsDict.showImages;
    }

    // Backwards compatibility for showSnippet: older versions may have used boolean or not existed
    const rawSnippet = (incoming as Partial<Record<string, unknown>>)?.['showSnippet'];
    if (typeof rawSnippet === 'boolean') {
      merged.showSnippet = rawSnippet ? 'always' : 'never';
    } else if (typeof rawSnippet === 'string') {
      const allowedS = ['never', 'whenHighlighted', 'always'];
      merged.showSnippet = allowedS.includes(rawSnippet) ? (rawSnippet as ISettingsDict['showSnippet']) : this._settingsDict.showSnippet;
    } else {
      merged.showSnippet = (merged.showSnippet as ISettingsDict['showSnippet']) ?? this._settingsDict.showSnippet;
    }

    // Ensure arrays exist
    merged.mutedWords = (merged.mutedWords ?? []) as string[];
    merged.highlightedWords = (merged.highlightedWords ?? []) as string[];

    return merged;
  }

  public updateSettings(settings: Partial<ISettingsDict> | ISettingsDict): void {
    // Normalize to handle older settings formats and missing fields
    this._settingsDict = this.normalizeSettings(settings as Partial<ISettingsDict>);
    this.storageService.set(SETTINGS_DICT, this._settingsDict);
    console.log(`[SettingsService] Updated settings: ${JSON.stringify(this._settingsDict)}`);
  }

  public getSettings() {
    return this._settingsDict;
  }

  public async loadSettingsDict() {
    console.log('[SettingsService] Loading settings from storage');
    const current_settings = await this.storageService.getObjectFromStorage(SETTINGS_DICT);

    if (current_settings !== null) {
      // Merge/normalize stored settings into defaults
      this._settingsDict = this.normalizeSettings(current_settings as Partial<ISettingsDict>);
    }
    else
      this.storageService.set(SETTINGS_DICT, this._settingsDict);
  }
}
