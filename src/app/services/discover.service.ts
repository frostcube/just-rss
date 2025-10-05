import { Injectable } from '@angular/core';
import { IOPMLItem } from '../suggested/suggested-feeds';
import { StorageService } from './storage.service';

interface GithubContentEntry {
  name: string;
  download_url?: string;
}

@Injectable({ providedIn: 'root' })
export class DiscoverService {

  // GitHub API URL for the repository directory listing
  private readonly GITHUB_CONTENTS_API = 'https://api.github.com/repos/Martinviv/rss-sources/contents';
  private readonly CACHE_KEY_SECTIONS = 'discover_sections_v1';
  private readonly CACHE_KEY_OPML_PREFIX = 'discover_opml_';
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private storageService: StorageService) {}

  /**
   * List OPML files available in the rss-sources repository.
   * Uses storage cache with TTL to avoid repeated GitHub API calls.
   */
  public async listOpmlFiles(forceRefresh = false): Promise<Array<{ name: string; download_url: string }>> {
    try {
      // Try cache first
      if (!forceRefresh) {
        const cached = await this.storageService.get(this.CACHE_KEY_SECTIONS);
        if (cached && cached.ts && (Date.now() - cached.ts) < this.CACHE_TTL_MS) {
          return cached.data as Array<{ name: string; download_url: string }>;
        }
      }

      const res = await fetch(this.GITHUB_CONTENTS_API);
      const json = await res.json();
      if (!Array.isArray(json)) return [];

      const files = (json as GithubContentEntry[])
        .filter((entry: GithubContentEntry) => entry && entry.name && (entry.name.toLowerCase().endsWith('.opml') || entry.name.toLowerCase().endsWith('.xml')))
        .map((entry: GithubContentEntry) => ({ name: entry.name, download_url: entry.download_url ?? '' }))
        .filter(f => f.download_url !== '');

      // Store in cache
      this.storageService.set(this.CACHE_KEY_SECTIONS, { ts: Date.now(), data: files });

      return files;
    } catch (e) {
      console.error('[SuggestedService] Error listing OPML files', e);
      // Fallback to cache if available even if stale
      try {
        const cached = await this.storageService.get(this.CACHE_KEY_SECTIONS);
        if (cached && cached.data) return cached.data as Array<{ name: string; download_url: string }>;
      } catch {
        console.warn('[SuggestedService] No cached sections data available');
      }
      return [];
    }
  }

  /**
   * Fetch an OPML file by its raw download URL and parse it into IOPMLItem array.
   * Uses storage cache keyed by a sanitized download URL hash.
   */
  public async fetchOpmlItems(opmlDownloadUrl: string, forceRefresh = false): Promise<IOPMLItem[]> {
    try {
      const cacheKey = this.CACHE_KEY_OPML_PREFIX + this.sanitizeKey(opmlDownloadUrl);

      if (!forceRefresh) {
        const cached = await this.storageService.get(cacheKey);
        if (cached && cached.ts && (Date.now() - cached.ts) < this.CACHE_TTL_MS) {
          return cached.data as IOPMLItem[];
        }
      }

      const res = await fetch(opmlDownloadUrl);
      const text = await res.text();
      const items = this.parseOpml(text);

      // Store in cache
      this.storageService.set(cacheKey, { ts: Date.now(), data: items });

      return items;
    } catch (e) {
      console.error('[SuggestedService] Error fetching OPML', e);
      // Try returning cached value even if stale
      try {
        const cacheKey = this.CACHE_KEY_OPML_PREFIX + this.sanitizeKey(opmlDownloadUrl);
        const cached = await this.storageService.get(cacheKey);
        if (cached && cached.data) return cached.data as IOPMLItem[];
      } catch {
        console.warn('[SuggestedService] No cached OPML data available');
      }
      return [];
    }
  }

  /**
   * Parse OPML/XML text and extract outlines with xmlUrl attributes.
   */
  private parseOpml(opmlText: string): IOPMLItem[] {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(opmlText, 'text/xml');
      const outlines = Array.from(xml.querySelectorAll('outline[xmlUrl]'));
      const items: IOPMLItem[] = outlines.map((o: Element) => ({
        text: o.getAttribute('text') || o.getAttribute('title') || '',
        title: o.getAttribute('title') || o.getAttribute('text') || '',
        description: o.getAttribute('description') || '',
        xmlUrl: o.getAttribute('xmlUrl') || '',
        type: o.getAttribute('type') || 'rss',
        selected: false
      }));
      return items;
    } catch (e) {
      console.error('[SuggestedService] Error parsing OPML', e);
      return [];
    }
  }

  private sanitizeKey(str: string): string {
    // Simple sanitizer to create a stable key without special chars
    return btoa(str).replace(/\W/g, '');
  }

}
