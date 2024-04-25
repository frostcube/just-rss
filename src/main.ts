import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';

import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { PlatformService } from './app/services/platform.service';
import { StorageService } from './app/services/storage.service';
import { SourcesService } from './app/services/sources.service';
import { SettingsService } from './app/services/settings.service';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(IonicStorageModule.forRoot({
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    })),
    provideRouter(routes),
    PlatformService,
    StorageService,
    SourcesService,
    SettingsService
  ],
});
