import { TestBed } from '@angular/core/testing';
import { FakeStorage, flushPromises, provideTestingStorage } from '../../testing/storage-mock';
import { DiscoverService } from './discover.service';

const OPML = `<?xml version="1.0"?><opml version="2.0"><body>
  <outline type="rss" text="Verge" title="The Verge" xmlUrl="https://verge.example/rss" description="Tech" />
  <outline text="No feed url" />
</body></opml>`;

describe('DiscoverService', () => {
  let service: DiscoverService;
  let storage: FakeStorage;

  beforeEach(async () => {
    storage = new FakeStorage();
    TestBed.configureTestingModule({ providers: provideTestingStorage(storage) });
    service = TestBed.inject(DiscoverService);
    await flushPromises();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list only OPML/XML files and cache the result', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify([
      { name: 'tech.opml', download_url: 'https://raw.example/tech.opml' },
      { name: 'README.md', download_url: 'https://raw.example/README.md' },
      { name: 'news.XML', download_url: 'https://raw.example/news.XML' },
      { name: 'broken.opml' }
    ])));

    const files = await service.listOpmlFiles();
    expect(files.map(f => f.name)).toEqual(['tech.opml', 'news.XML']);

    await service.listOpmlFiles();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await service.listOpmlFiles(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('should fall back to stale cache when the network fails', async () => {
    storage.data.set('discover_sections_v1', { ts: 0, data: [{ name: 'old.opml', download_url: 'u' }] });
    spyOn(window, 'fetch').and.rejectWith(new Error('offline'));
    expect(await service.listOpmlFiles(true)).toEqual([{ name: 'old.opml', download_url: 'u' }]);
  });

  it('should return an empty list when offline without cache', async () => {
    spyOn(window, 'fetch').and.rejectWith(new Error('offline'));
    expect(await service.listOpmlFiles()).toEqual([]);
  });

  it('should parse OPML items with xmlUrl only', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(OPML));
    const items = await service.fetchOpmlItems('https://raw.example/tech.opml');
    expect(items.length).toBe(1);
    expect(items[0]).toEqual({
      text: 'Verge',
      title: 'The Verge',
      description: 'Tech',
      xmlUrl: 'https://verge.example/rss',
      type: 'rss',
      selected: false
    });
  });
});
