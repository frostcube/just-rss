/* eslint-disable @typescript-eslint/no-explicit-any */
// Disabled as we are using an untyped library: RSSPhaser
import { Injectable, OnDestroy } from '@angular/core';
import { StorageService } from './storage.service';
import { SourcesService } from './sources.service';

const STORAGE_FEED_DATA = 'storage_list_feed_data';
const STORAGE_FEED_DATA_TIMESTAMP = 'storage_list_feed_data_timestamp';

@Injectable({
  providedIn: 'root'
})
export class FeedService implements OnDestroy {

  public entries: any = [];
  public lastUpdated: number = 0;

  constructor(private sourcesService: SourcesService, private storageService: StorageService) { 
    this.storageService.onReady.subscribe(() => {
      this.initFeedData(this.storageService.onReady.value);
    });

    this.sourcesService.newSource.subscribe((feedUrl) => {
      this.appendEntryFromCache(feedUrl);
    });
  }

  ngOnDestroy() {
    this.storageService.onReady.unsubscribe();
    this.sourcesService.newSource.unsubscribe();
  }

  private initFeedData(status: boolean) {
    if (status === true) {
      console.log('[FeedService] Storage onReady status changed to true');
      this.loadEntries();
    }
    else {
      console.log('[FeedService] Storage onReady status changed to false');
    }
  }

  private async loadEntries() {
    const storage_feed = await this.storageService.getObjectFromStorage(STORAGE_FEED_DATA);
    this.lastUpdated = await this.storageService.getObjectFromStorage(STORAGE_FEED_DATA_TIMESTAMP);
    
    if (storage_feed !== null)
      this.entries = storage_feed;
  }

  public async syncEntriesWithUpstream(event: any): Promise<void> {
    try {
      const feedList = this.sourcesService.getSources();
      const tempFeedMasterData = await Promise.all(
        feedList.map(async (feed) => {
          const nextPollDate = feed.lastRetrieved + (feed.pollingFrequency * 1000); // Milliseconds
          let feedData: Array<any> | null = null;

          if (Date.now() < nextPollDate) {
            console.warn(`[FeedService] Too soon to retrieve: ${feed.url}`);
            feedData = await this.storageService.getObjectFromStorage(feed.url);
          } else {
            feedData = await this.fetchAndUpdateFeed(feed);
          }

          if (!feedData) {
            console.error(`[FeedService] No Feed Data for ${feed.url}`);
            return [];
          }

          return feedData;
        })
      );

      // Flatten the array of arrays and update master feed
      this.entries = this.sortByDate(tempFeedMasterData.flat());
      this.storageService.set(STORAGE_FEED_DATA, JSON.stringify(this.entries));
      console.log('[FeedService] Rebuilt master feed from upstream');
      this.lastUpdated = Date.now();
      this.storageService.set(STORAGE_FEED_DATA_TIMESTAMP, this.lastUpdated);
      event.target.complete();
    } catch (error) {
      console.error('[FeedService] An error occurred:', error);
    }
  }

  private async fetchAndUpdateFeed(feed: any): Promise<any> {
    try {
      const feedDataDownloaded = await this.sourcesService.downloadAndParseFeed(feed.url);
      return this.sourcesService.updateLocalCache(feed, feedDataDownloaded);
    } catch (error) {
      console.error(`[FeedService] ${error}`);
      // Fallback to cached data
      return await this.storageService.getObjectFromStorage(feed.url);
    }
  }

  public async appendEntryFromCache(feedUrl: string) {
    const feedData = await this.storageService.getObjectFromStorage(feedUrl);

    for (const item of feedData) {
      this.entries.push(item);
    }

    this.entries = this.sortByDate(this.entries);
    this.storageService.set(STORAGE_FEED_DATA, JSON.stringify(this.entries));
    console.log('[FeedService] Appended feed ' + feedUrl + ' from cache');
  }

  public updateBookmarkStatus(item: any, status: boolean) {
    const index = this.entries.indexOf(item);
    if (index !== -1)
      this.entries[index].bookmark = status;
    else
      console.warn(`[FeedService] ${item.url} not found for bookmark status change`);
  }

  private sortByDate(array: Array<any>): Array<any> {
    return array.sort((a: any, b: any) => {
      return new Date(b.isoDate).valueOf() - new Date(a.isoDate).valueOf();
    });
  }
}
