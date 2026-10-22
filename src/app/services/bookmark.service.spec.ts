import { TestBed } from '@angular/core/testing';
import { FakeStorage, flushPromises, provideTestingStorage } from '../../testing/storage-mock';
import { BookmarkService } from './bookmark.service';

describe('BookmarkService', () => {
  let service: BookmarkService;
  let storage: FakeStorage;

  beforeEach(async () => {
    storage = new FakeStorage();
    storage.data.set('v3_bookmark_feed_list', ['existing']);
    TestBed.configureTestingModule({ providers: provideTestingStorage(storage) });
    service = TestBed.inject(BookmarkService);
    await flushPromises();
  });

  it('should load stored bookmarks', () => {
    expect(service.getBookmarks()).toEqual(['existing']);
  });

  it('should add and persist entries', () => {
    service.addEntry('new');
    expect(service.getBookmarks()).toEqual(['existing', 'new']);
    expect(storage.data.get('v3_bookmark_feed_list')).toEqual(['existing', 'new']);
  });

  it('should remove entries', () => {
    service.removeEntry('existing');
    expect(service.getBookmarks()).toEqual([]);
  });

  it('should ignore removal of unknown entries', () => {
    service.removeEntry('unknown');
    expect(service.getBookmarks()).toEqual(['existing']);
  });
});
