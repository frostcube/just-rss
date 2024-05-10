/* eslint-disable @typescript-eslint/no-explicit-any */
// Disabled as we are using an untyped library: RSSPhaser
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { SourcesService } from './sources.service';

const STORAGE_FEED_DATA = 'storage_list_feed_data';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  public entries: any = [];

  constructor(private sourcesService: SourcesService, private storageService: StorageService) { 
    this.storageService.onReady.subscribe(() => {
      this.initFeedData(this.storageService.onReady.value);
    });
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

      if (Date.now() < nextPollDate) {
        console.warn('[FeedService] Too soon to retrieve: ' + feed.url);
        const feedData = await this.storageService.getObjectFromStorage(feed.url);

        for (const item of feedData) {
          tempFeedMasterData.push(item);
        }
        continue;
      }

      try {
        const feedDataDownloaded = await this.sourcesService.downloadAndParseFeed(feed.url);
        const feedResult = this.sourcesService.updateLocalCache(feed, feedDataDownloaded);
        for (const item of feedResult) {
          tempFeedMasterData.push(item);
        }
      }
      catch (error) {
        console.error('[FeedService] ' + error);
        continue;
      }      
    }

    // Update cache and values
    this.entries = this.sortByDate(tempFeedMasterData);
    this.storageService.set(STORAGE_FEED_DATA, JSON.stringify(this.entries));
    event.target.complete();
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
