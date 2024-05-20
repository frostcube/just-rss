/* eslint-disable @typescript-eslint/no-explicit-any */
// Disabled as we are using an untyped library: RSSPhaser
import { Injectable, OnDestroy } from '@angular/core';
import { StorageService } from './storage.service';
import { SourcesService } from './sources.service';

const STORAGE_FEED_DATA = 'storage_list_feed_data';

@Injectable({
  providedIn: 'root'
})
export class FeedService implements OnDestroy {

  public entries: any = [];

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
    
    if (storage_feed !== null)
      this.entries = storage_feed;
  }

  public async syncEntriesWithUpstream(event: any) {
    const tempFeedMasterData: Array<any> = [];
    const feedList = this.sourcesService.getSources();

    // Update the cache for any feeds that need updating
    for (const feed of feedList) {
      const nextPollDate = feed.lastRetrieved + (feed.pollingFrequency * 1000); // Milliseconds
      let feedData = null;

      if (Date.now() < nextPollDate) {
        console.warn('[FeedService] Too soon to retrieve: ' + feed.url);
        feedData = await this.storageService.getObjectFromStorage(feed.url);
      }
      else {
        try {
          const feedDataDownloaded = await this.sourcesService.downloadAndParseFeed(feed.url);
          feedData = this.sourcesService.updateLocalCache(feed, feedDataDownloaded);
        }
        catch (error) {
          console.error('[FeedService] ' + error);
          // Get the cache as the feed isn't accessible
          feedData = await this.storageService.getObjectFromStorage(feed.url);
        }
      }

      // Update master feed
      if (feedData !== null) {
        for (const item of feedData) {
          tempFeedMasterData.push(item);
        }
      }
      else {
        console.error('[FeedService] No Feed Data for ' + feed.url);
        continue;
      }
    }

    // Update cache and values
    this.entries = this.sortByDate(tempFeedMasterData);
    this.storageService.set(STORAGE_FEED_DATA, JSON.stringify(this.entries));
    console.log('[FeedService] Rebuilt master feed from upstream');
    event.target.complete();
  }

  public async appendEntryFromCache(feedUrl: string) {
    const feedData = await this.storageService.getObjectFromStorage(feedUrl);

    for (const item of feedData) {
      this.entries.push(item);
    }

    this.entries = this.sortByDate(this.entries);
    this.storageService.set(STORAGE_FEED_DATA, JSON.stringify(this.entries));
    console.log('[FeedService] Rebuilt master feed from cache');
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
