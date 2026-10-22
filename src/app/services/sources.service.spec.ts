import { TestBed } from '@angular/core/testing';
import { FakeStorage, flushPromises, provideTestingStorage } from '../../testing/storage-mock';
import { IFeedDict, SourcesService } from './sources.service';

function makeFeed(overrides: Partial<IFeedDict> = {}): IFeedDict {
  return {
    url: 'https://example.com/feed.xml',
    title: 'Example',
    iconUrl: undefined,
    description: 'An example feed',
    lastPublished: 0,
    lastRetrieved: 0,
    pollingFrequency: 60,
    healthy: true,
    podcast: false,
    tags: [],
    ...overrides
  };
}

describe('SourcesService', () => {
  let service: SourcesService;
  let storage: FakeStorage;

  beforeEach(async () => {
    storage = new FakeStorage();
    TestBed.configureTestingModule({ providers: provideTestingStorage(storage) });
    service = TestBed.inject(SourcesService);
    spyOn(service, 'presentErrorToast').and.resolveTo();
    spyOn(service, 'presentWarnToast').and.resolveTo();
    await flushPromises();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a source and persist it', () => {
    service.addSource(makeFeed());
    expect(service.getSources().length).toBe(1);
    expect(storage.data.get('v3_storage_feed_list')).toEqual(service.getSources());
  });

  it('should reject duplicate sources', () => {
    service.addSource(makeFeed());
    service.addSource(makeFeed({ title: 'Other' }));
    expect(service.getSources().length).toBe(1);
    expect(service.presentErrorToast).toHaveBeenCalledWith('Feed already exists!');
  });

  it('should remove a source', () => {
    service.addSource(makeFeed());
    service.removeSource('https://example.com/feed.xml');
    expect(service.getSources()).toEqual([]);
  });

  it('should return undefined for an unknown source', () => {
    expect(service.getSource('https://nope.example')).toBeUndefined();
  });

  it('should update an existing source in place', () => {
    service.addSource(makeFeed());
    service.setSource('https://example.com/feed.xml', makeFeed({ title: 'Renamed' }));
    expect(service.getSources().length).toBe(1);
    expect(service.getSource('https://example.com/feed.xml')?.title).toBe('Renamed');
  });

  it('should reorder sources alphabetically ignoring case', () => {
    service.addSource(makeFeed({ url: 'https://b.example', title: 'banana' }));
    service.addSource(makeFeed({ url: 'https://a.example', title: 'Cherry' }));
    service.addSource(makeFeed({ url: 'https://c.example', title: 'apple' }));
    service.reorderSourcesAlphabetical();
    expect(service.getSources().map(s => s.title)).toEqual(['apple', 'banana', 'Cherry']);
  });

  it('should export OPML with escaped attributes', () => {
    service.addSource(makeFeed({ title: 'Tom & "Jerry"', url: 'https://example.com/a?x=1&y=2' }));
    const opml = service.exportSourcesToOPML();
    expect(opml).toContain('<opml version="2.0">');
    expect(opml).toContain('text="Tom &amp; &quot;Jerry&quot;"');
    expect(opml).toContain('xmlUrl="https://example.com/a?x=1&amp;y=2"');
    const xml = new DOMParser().parseFromString(opml, 'text/xml');
    expect(xml.querySelector('parsererror')).toBeNull();
  });

  it('should round-trip OPML import and skip existing URLs', () => {
    service.addSource(makeFeed({ url: 'https://one.example', title: 'One' }));
    const opml = `<?xml version="1.0"?><opml version="2.0"><body>
      <outline type="rss" text="One" xmlUrl="https://one.example" />
      <outline type="rss" text="Two" xmlUrl="https://two.example" />
    </body></opml>`;
    expect(service.importSourcesFromOPML(opml)).toBeTrue();
    expect(service.getSources().map(s => s.url)).toEqual(['https://one.example', 'https://two.example']);
    expect(service.importSourcesFromOPML(opml)).toBeFalse();
  });

  it('should fail OPML import without feed outlines', () => {
    expect(service.importSourcesFromOPML('<opml><body></body></opml>')).toBeFalse();
  });

  describe('updateLocalCache', () => {
    it('should decorate items, cache them and mark the source healthy', () => {
      service.addSource(makeFeed({ healthy: false }));
      const items = service.updateLocalCache(makeFeed(), {
        items: [{
          title: 'Hello &amp; welcome',
          link: 'https://example.com/1',
          content: '<p><img src="https://example.com/img.png"></p>',
          contentSnippet: 'x'.repeat(200)
        }]
      });
      expect(items.length).toBe(1);
      expect(items[0].title).toBe('Hello & welcome');
      expect(items[0].contentStripped.length).toBe(120);
      expect(items[0].imgLink).toBe('https://example.com/img.png');
      expect(items[0].source).toBe('Example');
      expect(storage.data.get('https://example.com/feed.xml')).toEqual(items);
      expect(service.getSource('https://example.com/feed.xml')?.healthy).toBeTrue();
    });

    it('should tolerate items without a content snippet', () => {
      service.addSource(makeFeed());
      const items = service.updateLocalCache(makeFeed(), {
        items: [{ title: 'No snippet', link: 'https://example.com/2', content: '' }]
      });
      expect(items[0].contentStripped).toBe('');
      expect(items[0].imgLink).toBeNull();
    });
  });

  describe('discoverRssFeed', () => {
    function mockFetch(body: string, contentType: string) {
      spyOn(window, 'fetch').and.resolveTo(new Response(body, { headers: { 'content-type': contentType } }));
    }

    it('should return the URL when it is already a feed', async () => {
      mockFetch('<rss version="2.0"><channel></channel></rss>', 'application/rss+xml');
      expect(await service.discoverRssFeed('https://example.com/feed')).toBe('https://example.com/feed');
    });

    it('should discover a relative feed link in HTML', async () => {
      mockFetch('<html><head><link type="application/rss+xml" href="/index.xml"></head></html>', 'text/html');
      expect(await service.discoverRssFeed('https://example.com/blog')).toBe('https://example.com/index.xml');
    });

    it('should return null when no feed is found', async () => {
      mockFetch('<html><head></head></html>', 'text/html');
      expect(await service.discoverRssFeed('https://example.com')).toBeNull();
    });

    it('should return null when the request fails', async () => {
      spyOn(window, 'fetch').and.rejectWith(new Error('offline'));
      expect(await service.discoverRssFeed('https://example.com')).toBeNull();
    });
  });
});
