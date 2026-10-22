import { TestBed } from '@angular/core/testing';
import { flushPromises, provideTestingStorage } from '../../testing/storage-mock';
import { FeedService } from './feed.service';
import { ISettingsDict } from './settings.service';

describe('FeedService', () => {
  let service: FeedService;

  const settings: ISettingsDict = {
    preview: true,
    showImages: 'never',
    showSnippet: 'never',
    compressedFeed: false,
    locale: 'en-AU',
    retrievalTimeout: 5000,
    defaultPollingFrequency: 0,
    maxFeedLength: 10,
    mutedWords: [],
    highlightedWords: []
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: provideTestingStorage() });
    service = TestBed.inject(FeedService);
    await flushPromises();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.entries).toEqual([]);
    expect(service.lastUpdated).toBe(0);
  });

  it('filters out articles with muted words', () => {
    const articles = [
      { title: 'Spoiler Alert', content: '...' },
      { title: 'Daily News', content: '...' }
    ];
    const result = service.filterArticles(articles, { ...settings, mutedWords: ['spoiler'] });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Daily News');
  });

  it('flags highlighted articles without removing them', () => {
    const articles = [
      { title: 'Angular 20 released', content: '...' },
      { title: 'Daily News', content: '...' }
    ];
    const result = service.filterArticles(articles, { ...settings, highlightedWords: ['angular'] });
    expect(result.length).toBe(2);
    expect(result[0].highlighted).toBeTrue();
    expect(result[1].highlighted).toBeFalse();
  });

  it('sorts articles newest first', () => {
    const sorted = service.sortByDate([
      { isoDate: '2024-01-01T00:00:00Z' },
      { isoDate: '2025-01-01T00:00:00Z' },
      { isoDate: '2023-01-01T00:00:00Z' }
    ]);
    expect(sorted.map(a => a.isoDate.substring(0, 4))).toEqual(['2025', '2024', '2023']);
  });

  it('updates bookmark status of known entries only', () => {
    const entry = { title: 'A', link: 'x', bookmark: false };
    service.entries = [entry];
    service.updateBookmarkStatus(entry, true);
    expect(entry.bookmark).toBeTrue();
    expect(() => service.updateBookmarkStatus({ title: 'B' }, true)).not.toThrow();
  });
});
