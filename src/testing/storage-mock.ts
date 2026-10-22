import { EnvironmentProviders, Provider } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { provideIonicAngular } from '@ionic/angular/standalone';

/** In-memory stand-in for the Ionic Storage so tests never touch SQLite/IndexedDB. */
export class FakeStorage {
  public data = new Map<string, unknown>();

  async defineDriver(): Promise<void> {
    return;
  }

  async create(): Promise<FakeStorage> {
    return this;
  }

  async get(key: string): Promise<unknown> {
    return this.data.has(key) ? this.data.get(key) : null;
  }

  async set(key: string, value: unknown): Promise<unknown> {
    this.data.set(key, value);
    return value;
  }
}

/** Providers needed by any spec that (indirectly) injects StorageService. */
export function provideTestingStorage(storage: FakeStorage = new FakeStorage()): Array<Provider | EnvironmentProviders> {
  return [
    provideIonicAngular(),
    { provide: Storage, useValue: storage }
  ];
}

/** Let pending promises/timers (e.g. StorageService.init) settle. */
export async function flushPromises(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve));
}
