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
      this.loadEntriesList();
    }
    else {
      console.log('[FeedService] Storage onReady status changed to false');
    }
  }

  private async loadEntriesList() {
    const storage_feed = await this.storageService.getObjectFromStorage(STORAGE_FEED_DATA);
    
    if (storage_feed !== null)
      this.entries = storage_feed;
  }

  public async parseUrls(event: any) {
    const tempFeedMasterData: Array<any> = [];
    const feedList = this.sourcesService.getSources();
    let feedResult;

    // Update the cache for any feeds that need updating
    for (const feed of feedList) {
      const tempFeedData: Array<any> = [];
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
        feedResult = await this.sourcesService.downloadAndParseFeed(feed.url);
      }
      catch (error) {
        console.error('[FeedService] ' + error);
        continue;
      }

      for (const item of feedResult.items) {
        item.source = feed.title;
        item.contentStripped = item.contentSnippet.substring(0, 120);
        item.imgLink = this.getItemMedia(item);
        item.feedUrl = feed.url;
        item.bookmark = false;
        tempFeedData.push(item);
        tempFeedMasterData.push(item);
      }

      this.storageService.set(feed.url, JSON.stringify(tempFeedData));

      const source = this.sourcesService.getSource(feed.url);
      source.healthy = true;
      source.lastRetrieved = Date.now();
      this.sourcesService.setSource(feed.url, source);
    }

    // Sort the feed by date
    tempFeedMasterData.sort((a: any, b: any) => {
      return new Date(b.isoDate).valueOf() - new Date(a.isoDate).valueOf();
    });

    // Update cache and values
    this.entries = tempFeedMasterData;
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

  private getItemMedia(item: any): string | null {
    let mediaLinkURL = item.mediaContent;

    if (mediaLinkURL !== undefined) {
      mediaLinkURL = mediaLinkURL[0].$.url;
    }

    if (mediaLinkURL === undefined)
      mediaLinkURL = this.findMediaInHTML(item.content);

    if (mediaLinkURL === undefined || mediaLinkURL === null) {
      console.warn('[FeedService] No media link found for article');
      return null;
    }
    else {
      return mediaLinkURL;
    }
  }

  private findMediaInHTML(htmlString: string): string | null {
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const mediaLink = doc.querySelector('img');
    
    if (mediaLink) {
      const mediaLinkURL = mediaLink.getAttribute('src');
      return mediaLinkURL;
    } else {
      return null;
    }
  }
}
