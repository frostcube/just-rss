import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonNote, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, checkmarkOutline, chevronDownOutline, chevronUpOutline, refreshOutline } from 'ionicons/icons';
import { IOPMLItem } from '../lib/types';
import { DiscoverService } from '../services/discover.service';
import { SettingsService } from '../services/settings.service';
import { SourcesService } from '../services/sources.service';

interface DiscoverSection {
  name: string;
  download_url: string;
  local?: boolean;
}

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonList, IonItem, IonLabel, IonNote, IonCheckbox, IonButton, IonSpinner, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon]
})
export class DiscoverPage implements OnInit {

  // Available OPML discovery sections from the GitHub repo; the local country section (if any) comes first
  public sections: Array<DiscoverSection> = [];
  // Currently loaded feeds from the selected section
  public suggestedFeeds: IOPMLItem[] = [];
  public loadingSections = false;
  public loadingFeeds = false;
  // Currently selected section (for feed refresh)
  public selectedSection?: DiscoverSection;
  // Map of feed URL -> adding in progress
  public addingMap: Record<string, boolean> = {};

  constructor(public sourcesService: SourcesService, private discoverService: DiscoverService,
              private settingsService: SettingsService) {
    addIcons({ addOutline, checkmarkOutline, chevronDownOutline, chevronUpOutline, refreshOutline, });
  }

  async ngOnInit() {
    this.loadingSections = true;
    const [sections, local] = await Promise.all([
      this.discoverService.listOpmlFiles(),
      this.discoverService.getCountryOpmlFile(this.settingsService.getSettings().locale)
    ]);
    this.setSections(sections, local);
    this.loadingSections = false;
  }

  // The country setting may have changed while this tab was cached
  async ionViewWillEnter() {
    if (this.loadingSections || this.sections.length === 0) return;
    const local = await this.discoverService.getCountryOpmlFile(this.settingsService.getSettings().locale);
    this.setSections(this.sections.filter(s => !s.local), local);
  }

  private setSections(sections: Array<{ name: string; download_url: string }>, local?: { name: string; download_url: string }) {
    this.sections = local ? [{ ...local, local: true }, ...sections] : sections;
    if (this.selectedSection && !this.sections.some(s => this.isSelected(s))) this.unselectSection();
  }

  public isSelected(section: DiscoverSection): boolean {
    return this.selectedSection?.download_url === section.download_url;
  }

  async selectSection(section: DiscoverSection) {
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
    await Promise.all([this.refreshSections(), this.refreshSelectedSection()]);
  }

  // Force refresh the list of sections (bypass cache)
  public async refreshSections() {
    this.loadingSections = true;
    const [sections, local] = await Promise.all([
      this.discoverService.listOpmlFiles(true),
      this.discoverService.getCountryOpmlFile(this.settingsService.getSettings().locale, true)
    ]);
    this.setSections(sections, local);
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

  async addFeeds() {
    for (const feed of this.suggestedFeeds) {
      if (feed.selected) await this.addFeed(feed);
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
