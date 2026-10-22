import { TestBed } from '@angular/core/testing';
import { FakeStorage, flushPromises, provideTestingStorage } from '../../testing/storage-mock';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let storage: FakeStorage;

  function createService(): SettingsService {
    TestBed.configureTestingModule({ providers: provideTestingStorage(storage) });
    return TestBed.inject(SettingsService);
  }

  beforeEach(() => {
    storage = new FakeStorage();
  });

  it('should be created with defaults and persist them', async () => {
    const service = createService();
    await flushPromises();
    expect(service.getSettings().maxFeedLength).toBe(10);
    expect(storage.data.get('v3_settings_dict')).toEqual(service.getSettings());
  });

  it('should migrate legacy boolean settings when loading', async () => {
    storage.data.set('v3_settings_dict', { showImages: true, showSnippet: false });
    const service = createService();
    await flushPromises();
    expect(service.getSettings().showImages).toBe('always');
    expect(service.getSettings().showSnippet).toBe('never');
    expect(service.getSettings().mutedWords).toEqual([]);
  });

  it('should fall back to defaults for invalid enum values', async () => {
    const service = createService();
    await flushPromises();
    service.updateSettings({ showImages: 'bogus' as never });
    expect(service.getSettings().showImages).toBe('whenHighlighted');
  });

  it('should merge and persist updated settings', async () => {
    const service = createService();
    await flushPromises();
    service.updateSettings({ mutedWords: ['spoiler'], maxFeedLength: 25 });
    expect(service.getSettings().mutedWords).toEqual(['spoiler']);
    expect(service.getSettings().locale).toBe('en-AU');
    expect((storage.data.get('v3_settings_dict') as { maxFeedLength: number }).maxFeedLength).toBe(25);
  });
});
