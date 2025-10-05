import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { IOPMLItem } from './suggested-feeds';
import { DiscoverService } from '../services/discover.service';
import { IonButton, IonCheckbox, IonContent, IonItem, IonList, IonSpinner } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { SourcesService } from '../services/sources.service';

@Component({
  selector: 'app-suggested',
  templateUrl: './suggested.component.html',
  styleUrls: ['./suggested.component.scss'],
  standalone: true,
  imports: [FormsModule, NgIf, IonContent, IonList, IonItem, IonCheckbox, IonButton, IonSpinner]
})
export class SuggestedComponent implements OnInit {

  // Available OPML discovery sections from the GitHub repo
  public sections: Array<{ name: string; download_url: string }> = [];
  // Currently loaded feeds from the selected section
  public suggestedFeeds: IOPMLItem[] = [];
  public loadingSections = false;
  public loadingFeeds = false;
  // Currently selected section (for feed refresh)
  public selectedSection?: { name: string; download_url: string };

  constructor(public sourcesService: SourcesService, private discoverService: DiscoverService) { }

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

}
