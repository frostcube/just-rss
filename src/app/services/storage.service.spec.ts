import { TestBed } from '@angular/core/testing';
import { FakeStorage, flushPromises, provideTestingStorage } from '../../testing/storage-mock';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let storage: FakeStorage;

  beforeEach(async () => {
    storage = new FakeStorage();
    TestBed.configureTestingModule({ providers: provideTestingStorage(storage) });
    service = TestBed.inject(StorageService);
    await flushPromises();
  });

  it('should be created and become ready', () => {
    expect(service).toBeTruthy();
    expect(service.isReady).toBeTrue();
    expect(service.onReady.value).toBeTrue();
  });

  it('should persist and retrieve values', async () => {
    service.set('key', { a: 1 });
    await flushPromises();
    expect(await service.get('key')).toEqual({ a: 1 });
    expect(await service.getObjectFromStorage('key')).toEqual({ a: 1 });
  });

  it('should return null for missing keys', async () => {
    expect(await service.getObjectFromStorage('missing')).toBeNull();
  });
});
