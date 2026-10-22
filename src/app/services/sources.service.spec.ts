import { TestBed } from '@angular/core/testing';

import { IFeedDict, SourcesService } from './sources.service';

describe('SourcesService', () => {
  let service: SourcesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SourcesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('tags', () => {
    const makeFeed = (url: string, tags: string[]): IFeedDict => ({
      url, title: url, iconUrl: undefined, description: '', lastPublished: 0,
      lastRetrieved: 0, pollingFrequency: 60, healthy: true, podcast: false, tags
    });

    beforeEach(() => {
      service.getSources().push(
        makeFeed('a', ['News', 'tech']),
        makeFeed('b', ['news', ' ']),
        makeFeed('c', [])
      );
    });

    it('should return unique sorted tags', () => {
      expect(service.getAllTags()).toEqual(['News', 'tech']);
    });

    it('should match source tags case-insensitively', () => {
      expect(service.sourceHasTag('b', 'News')).toBeTrue();
      expect(service.sourceHasTag('c', 'News')).toBeFalse();
      expect(service.sourceHasTag('missing', 'News')).toBeFalse();
    });
  });
});
