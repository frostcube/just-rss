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

  /**
   * Sets the current platform for the application.
   *
   * This function checks the platform on which the application is running and sets the `_currentPlatform` property accordingly.
   * If the application is running on 'ios' or 'android' and not on 'desktop' or 'mobileweb', it sets `_currentPlatform` to 'native'.
   * Otherwise, it sets `_currentPlatform` to 'browser'.
   * After setting the platform, it logs the detected platform to the console.
   */
  private setCurrentPlatform() {
    // Check if the platform is 'ios' or 'android' and not 'desktop' or 'mobileweb'
    if (
      this.platform.is('ios')
        || this.platform.is('android')
        && !( this.platform.is('desktop') || this.platform.is('mobileweb') ) ) {
      // If the condition is true, set the current platform to 'native'
      this._currentPlatform = 'native';
    } else {
      // If the condition is false, set the current platform to 'browser'
      this._currentPlatform = 'browser';
    }
    // Log the detected platform to the console
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
