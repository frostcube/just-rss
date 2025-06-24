/* eslint-disable @typescript-eslint/no-explicit-any */
// Disabled as we are using an untyped library: RSSPhaser
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { SettingsService } from './settings.service';
import { ToastController } from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
declare const RSSParser: any;

const STORAGE_FEED_LIST = 'storage_feed_list';

export interface IFeedDict {
  url: string,
  title: string,
  iconUrl: string | undefined,
  description: string,
  /** When the feed was last updated upstream in milliseconds since epoch */
  lastPublished: number,
  /** When the feed was last fetched in milliseconds since epoch */
  lastRetrieved: number,
  /** Time between fetch attempts in seconds */
  pollingFrequency: number,
  /** True if the last fetch of the feed was successful */
  healthy: boolean,
  /** True if the source contains podcast information */
  podcast: boolean,
  /** Locally assigned tags/groups */
  tags: Array<string>
}

@Injectable({
  providedIn: 'root'
})
export class SourcesService {
  public newSource = new Subject<string>();
  private _feedList: Array<IFeedDict> = [];

  constructor(private storageService: StorageService, private settingsService: SettingsService,
              private toastController: ToastController) {
    this.storageService.onReady.subscribe(() => {
      this.initSources(this.storageService.onReady.value);
    });
  }

  private initSources(status: boolean) {
    if (status === true) {
      console.log('[SourcesService] Storage onReady status changed to true');
      this.loadSourcesList();
    }
    else {
      console.log('[SourcesService] Storage onReady status changed to false');
    }
  }

  public async addSourceFromUrl(feedUrl: string) {
    const feedData = await this.downloadAndParseFeed(feedUrl);

    const feedInfo: IFeedDict = {
      url: feedUrl,
      title: feedData.title,
      iconUrl: undefined, // feedData.image.url | feedData.icon,
      description: feedData.description,
      lastPublished: Date.parse(feedData.pubDate),
      lastRetrieved: Date.now(),
      pollingFrequency: this.settingsService.getSettings().defaultPollingFrequency,
      healthy: true,
      podcast: false,
      tags: []
    };

    this.addSource(feedInfo);
    this.updateLocalCache(feedInfo, feedData);
    this.newSource.next(feedInfo.url);
  }

  addSource(newFeed: IFeedDict) {
    if (this._feedList.findIndex(feed => feed.url === newFeed.url) === -1) {
      this._feedList.push(newFeed);
      console.log('[SourcesService] Adding new feed: ' + newFeed.url);
      this.storageService.set(STORAGE_FEED_LIST, JSON.stringify(this._feedList));
    }
    else {
      this.presentErrorToast('Feed already exists!');
      console.error('[SourcesService] Feed already in feedList: ' + newFeed.url);
    }
  }

  public removeSource(feedUrl: string) {
    const index = this._feedList.findIndex(feed => feed.url === feedUrl);
    console.log('[SourcesService] Removing feed: ' + feedUrl);

    if(index > -1){
      this._feedList.splice(index, 1);
    }
    this.storageService.set(STORAGE_FEED_LIST, JSON.stringify(this._feedList));
  }

  public setSource(feedUrl: string, updatedDict: IFeedDict) {
    const index = this._feedList.findIndex(feed => feed.url === feedUrl);
    console.log('[SourcesService] Updating feed: ' + feedUrl);
    this._feedList[index] = updatedDict;
  }

  public getSource(feedUrl: string): IFeedDict {
    const index = this._feedList.findIndex(feed => feed.url === feedUrl);
    console.log('[SourcesService] Retrieving feed: ' + feedUrl);
    return this._feedList[index];
  }

  public getSources() {
    return this._feedList;
  }

  public async loadSourcesList() {
    const storage_feed = await this.storageService.getObjectFromStorage(STORAGE_FEED_LIST);
    
    if (storage_feed !== null)
      this._feedList = storage_feed;
  }

  /**
 * Discover an RSS feed URL from a given website URL.
 * @param {string} websiteUrl - The URL of the website.
 * @returns {Promise<string | null>} - The discovered RSS feed URL or null if not found.
 */
  public async discoverRssFeed(websiteUrl: string): Promise<string | null> {
    try {
      // Try to fetch the URL and check if it's already a feed
      const response = await fetch(websiteUrl);
      const contentType = response.headers.get('content-type') || '';
      const urlLower = websiteUrl.toLowerCase();
      const isLikelyFeed =
        contentType.includes('application/rss+xml') ||
        contentType.includes('application/atom+xml') ||
        contentType.includes('text/xml') ||
        urlLower.endsWith('.xml') || urlLower.endsWith('.rss') || urlLower.endsWith('.atom');
      const text = await response.text();
      if (isLikelyFeed) {
        // Try to parse as XML and check for <rss> or <feed> root
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const rootTag = xml.documentElement.tagName.toLowerCase();
        if (rootTag === 'rss' || rootTag === 'feed') {
          return websiteUrl;
        }
      }
      // Fallback to HTML discovery
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const rssLink = doc.querySelector('link[type="application/rss+xml"], link[type="application/atom+xml"]');
      if (rssLink) {
        let rssLinkUrl = rssLink.getAttribute('href');
        if (!rssLinkUrl) return null;
        // Make absolute if needed
        if (!rssLinkUrl.startsWith('http')) {
          const base = new URL(websiteUrl);
          rssLinkUrl = new URL(rssLinkUrl, base).toString();
        }
        return rssLinkUrl;
      } else {
        console.warn('No RSS/Atom feed link found in the HTML.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching website content:', error);
      return null;
    }
  }

  public async downloadAndParseFeed(url: string) {
    const maxFeedLength = this.settingsService.getSettings().maxFeedLength;

    const parser = new RSSParser({
      customFields: {
        item: [['media:content', 'mediaContent', {keepArray: true}]]
      },
      timeout: this.settingsService.getSettings().retrievalTimeout
    });

    let feed;

    try {
      feed = await parser.parseURL(url);
      console.log(`[SourcesService] Retrieved ${feed.title}`);
    }
    catch (error) {
      if (error instanceof Error) {
        console.error('[SourcesService] ' + error.message);
        const source = this.getSource(url);
        if (source !== undefined) {
          source.healthy = false;
          this.setSource(url, source);
        }
        this.presentErrorToast(error.message);
      }
    }

    if (maxFeedLength > 0)
      feed.items = feed.items.slice(0, maxFeedLength);
  
    feed.items.forEach((item: any) => {
      console.log(`[SourcesService] ${item.title} : ${item.link}`);
    });

    return feed;
  }

  public updateLocalCache(feed: any, feedData: any): any {
    const tempFeedData: Array<any> = [];

    for (const item of feedData.items) {
      item.bookmark = false;
      if (item['content:encoded'] !== undefined) { // Prefer full content
        item.content = item['content:encoded'];
        item['content:encoded'] = '';
      }
      item.contentStripped = item.contentSnippet.substring(0, 120);
      item.feedUrl = feed.url;
      item.imgLink = this.getItemMedia(item);
      item.source = feed.title;
      item.title = item.title.replace('&#8217;', '\'');
      tempFeedData.push(item);
    }

    this.storageService.set(feed.url, JSON.stringify(tempFeedData));

    const source = this.getSource(feed.url);
    source.healthy = true;
    source.lastRetrieved = Date.now();
    this.setSource(feed.url, source);

    return tempFeedData;
  }

  public async presentErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'danger',
      positionAnchor: 'tab-bar'
    });

    await toast.present();
  }

  public async presentWarnToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'warning',
      positionAnchor: 'tab-bar'
    });

    await toast.present();
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

  /**
   * Export sources list as OPML XML string
   */
  exportSourcesToOPML(): string {
    const sources = this.getSources();
    const outlines = sources.map(source =>
      `<outline type="rss" text="${this.escapeXml(source.title ?? '')}" title="${this.escapeXml(source.title ?? '')}" xmlUrl="${this.escapeXml(source.url ?? '')}" description="${this.escapeXml(source.description ?? '')}" />`
    ).join('\n      ');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head>\n    <title>Just RSS Export</title>\n  </head>\n  <body>\n    ${outlines}\n  </body>\n</opml>`;
  }

  /**
   * Import sources from OPML XML string
   */
  importSourcesFromOPML(opmlText: string): boolean {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(opmlText, 'text/xml');
      const outlines = Array.from(xml.querySelectorAll('outline[xmlUrl]'));
      if (!outlines.length) return false;
      let imported = 0;
      for (const outline of outlines) {
        const url = outline.getAttribute('xmlUrl');
        const title = outline.getAttribute('title') || outline.getAttribute('text') || url || '';
        const description = outline.getAttribute('description') || '';
        if (url && !this._feedList.some(feed => feed.url === url)) {
          const feed: IFeedDict = {
            url,
            title,
            iconUrl: undefined,
            description,
            lastPublished: 0,
            lastRetrieved: 0,
            pollingFrequency: this.settingsService.getSettings().defaultPollingFrequency,
            healthy: true,
            podcast: false,
            tags: []
          };
          this.addSource(feed);
          imported++;
        }
      }
      return imported > 0;
    } catch (e) {
      return false;
    }
  }

  private escapeXml(str: string): string {
    return str.replace(/[<>&"']/g, c => {
      switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case '\'': return '&apos;';
      default: return c;
      }
    });
  }

}
