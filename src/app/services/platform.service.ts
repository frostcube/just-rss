import { Injectable } from '@angular/core';
import { Browser, OpenOptions } from '@capacitor/browser';
import { Platform } from '@ionic/angular';

type CurrentPlatform = 'browser' | 'native';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  private _currentPlatform: CurrentPlatform = 'browser';

  constructor(private platform: Platform) {
    this.setCurrentPlatform();
  }

  get currentPlatform() {
    return this._currentPlatform;
  }

  isNative() {
    return this._currentPlatform === 'native';
  }
  isBrowser() {
    return this._currentPlatform === 'browser';
  }

  isReady() {
    return this.platform.ready();
  }

  private setCurrentPlatform() {
    // Are we on mobile platform? Yes if platform is ios or android, but not desktop or mobileweb, no otherwise
    if (
      this.platform.is('ios')
        || this.platform.is('android')
        && !( this.platform.is('desktop') || this.platform.is('mobileweb') ) ) {
      this._currentPlatform = 'native';
    } else {
      this._currentPlatform = 'browser';
    }
    console.log('[PlatformService] Detected platform: ' + this._currentPlatform);
  }

  public openUrlInPlatformBrowser(entry: string | undefined) {
    if (entry !== undefined) {
      if (this.isNative()) {
        const config: OpenOptions = {
          url: entry
        };
      
        Browser.open(config);
      }
      else {
        window.open(entry, '_blank'); 
      }
      console.log(entry);
    }
    else {
      console.warn('[PlatformService] URL is undefined');
    }
  }
}
