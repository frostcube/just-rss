import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { FeedService } from './feed.service';

const BOOKMARK_FEED_LIST = 'bookmark_feed_list';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _bookmarkList: Array<any> = [];

  constructor(private storageService: StorageService, private feedService: FeedService) {
    this.storageService.onReady.subscribe(() => {
      this.initBookmarks(this.storageService.onReady.value);
    });
  }

  private initBookmarks(status: boolean) {
    if (status === true) {
      console.log('[BookmarkService] Storage onReady status changed to true');
      this.loadBookmarkList();
    }
    else {
      console.log('[BookmarkService] Storage onReady status changed to false');
    }
  }

  public addEntry(entry: string) {
    this._bookmarkList.push(entry);
    console.log('[BookmarkService] Adding new feed');
    this.storageService.set(BOOKMARK_FEED_LIST, JSON.stringify(this._bookmarkList));
    this.feedService.updateBookmarkStatus(entry, true);
  }

  public removeEntry(entry: string) {
    const index = this._bookmarkList.indexOf(entry);

    if(index > -1){
      this._bookmarkList.splice(index, 1);
    }
    this.storageService.set(BOOKMARK_FEED_LIST, JSON.stringify(this._bookmarkList));
    this.feedService.updateBookmarkStatus(entry, false);
  }

  public getBookmarks() {
    return this._bookmarkList;
  }

  public async loadBookmarkList() {
    const storage_bookmarks = await this.storageService.getObjectFromStorage(BOOKMARK_FEED_LIST);
    
    if (storage_bookmarks !== null)
      this._bookmarkList = storage_bookmarks;
  }
}
