import { TestBed } from '@angular/core/testing';

import { FeedService } from './feed.service';

describe('FeedService', () => {
  let service: FeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('filters out articles with muted words', () => {
    const settings = {
      preview: true,
      showImages: false,
      compressedFeed: false,
      locale: 'en-AU',
      retrievalTimeout: 5000, // 5 seconds
      defaultPollingFrequency: 0, // Unlimited
      maxFeedLength: 10,
      mutedWords: ['spoiler']
    };
    const articles = [
      { title: 'Spoiler Alert', content: '...'},
      { title: 'Daily News', content: '...'}
    ];
    const result = service.filterArticles(articles, settings);
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Daily News');
  });
});
