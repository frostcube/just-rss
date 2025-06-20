import { enableProdMode, importProvidersFrom, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';

import { CAPACITOR_SQLITE_DRIVER } from '@derme302/localforage-capacitorsqlitedriver';
import { PlatformService } from './app/services/platform.service';
import { StorageService } from './app/services/storage.service';
import { SourcesService } from './app/services/sources.service';
import { SettingsService } from './app/services/settings.service';
import { provideServiceWorker } from '@angular/service-worker';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(IonicStorageModule.forRoot({
      driverOrder: [CAPACITOR_SQLITE_DRIVER, Drivers.IndexedDB, Drivers.LocalStorage]
    })),
    provideRouter(routes),
    PlatformService,
    StorageService,
    SourcesService,
    SettingsService, 
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
});
