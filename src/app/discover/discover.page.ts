import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, checkmarkOutline, chevronDownOutline, chevronUpOutline, refreshOutline } from 'ionicons/icons';
import { IOPMLItem } from '../lib/types';
import { DiscoverService } from '../services/discover.service';
import { SourcesService } from '../services/sources.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  standalone: true,
  imports: [FormsModule, NgIf, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonCheckbox, IonButton, IonSpinner, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon]
})
export class DiscoverPage implements OnInit {

  // Available OPML discovery sections from the GitHub repo
  public sections: Array<{ name: string; download_url: string }> = [];
  // Currently loaded feeds from the selected section
  public suggestedFeeds: IOPMLItem[] = [];
  public loadingSections = false;
  public loadingFeeds = false;
  // Currently selected section (for feed refresh)
  public selectedSection?: { name: string; download_url: string };
  // Map of feed URL -> adding in progress
  public addingMap: Record<string, boolean> = {};

  constructor(public sourcesService: SourcesService, private discoverService: DiscoverService) { 
    addIcons({ addOutline, checkmarkOutline, chevronDownOutline, chevronUpOutline, refreshOutline, });
  }

  async ngOnInit() {
    this.loadingSections = true;
    this.sections = await this.discoverService.listOpmlFiles();
    this.loadingSections = false;
  }

  async selectSection(section: { name: string; download_url: string }) {
    this.loadingFeeds = true;
    this.selectedSection = section;
    this.suggestedFeeds = await this.discoverService.fetchOpmlItems(section.download_url);
    this.loadingFeeds = false;
  }

  unselectSection() {
    this.selectedSection = undefined;
    this.suggestedFeeds = [];
  }

  // Button will force both sections to refresh
  public async forceRefresh() {
    this.refreshSections();
    this.refreshSelectedSection();
  }

  // Force refresh the list of sections (bypass cache)
  public async refreshSections() {
    this.loadingSections = true;
    this.sections = await this.discoverService.listOpmlFiles(true);
    this.loadingSections = false;
  }

  // Force refresh the currently selected section's feeds (bypass cache)
  public async refreshSelectedSection() {
    if (!this.selectedSection) return;
    this.loadingFeeds = true;
    this.suggestedFeeds = await this.discoverService.fetchOpmlItems(this.selectedSection.download_url, true);
    this.loadingFeeds = false;
  }

  // Expose a property to check if any feed is selected; avoid complex/sensitive template expressions
  public get anySelected(): boolean {
    return Array.isArray(this.suggestedFeeds) && this.suggestedFeeds.some(f => !!f && f.selected === true);
  }

  addFeeds() {
    for (const feed of this.suggestedFeeds) {
      if (feed.selected) this.sourcesService.addSourceFromUrl(feed.xmlUrl);
    }
  }

  /**
   * Return true if the given OPML feed is already present in SourcesService list.
   */
  public isInSources(feed: IOPMLItem): boolean {
    if (!feed || !feed.xmlUrl) return false;
    const sources = this.sourcesService.getSources() || [];
    return sources.some(s => s.url === feed.xmlUrl);
  }

  /**
   * Add a single feed if it's not already added. Shows spinner while adding.
   */
  public async addFeed(feed: IOPMLItem) {
    if (!feed || !feed.xmlUrl) return;
    if (this.isInSources(feed)) return;

    this.addingMap[feed.xmlUrl] = true;
    try {
      await this.sourcesService.addSourceFromUrl(feed.xmlUrl);
    } catch (e) {
      console.error('[DiscoverPage] Error adding feed', e);
    }
    this.addingMap[feed.xmlUrl] = false;
  }

}
