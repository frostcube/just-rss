import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { IOPMLItem } from './suggested-feeds';
import { SuggestedService } from './suggested.service';
import { IonButton, IonCheckbox, IonContent, IonItem, IonList } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { SourcesService } from '../services/sources.service';

@Component({
  selector: 'app-suggested',
  templateUrl: './suggested.component.html',
  styleUrls: ['./suggested.component.scss'],
  standalone: true,
  imports: [FormsModule, NgIf, IonContent, IonList, IonItem, IonCheckbox, IonButton]
})
export class SuggestedComponent implements OnInit {

  // Available OPML discovery sections from the GitHub repo
  public sections: Array<{ name: string; download_url: string }> = [];
  // Currently loaded feeds from the selected section
  public suggestedFeeds: IOPMLItem[] = [];
  public loadingSections = false;
  public loadingFeeds = false;

  constructor(public sourcesService: SourcesService, private suggestedService: SuggestedService) { }

  async ngOnInit() {
    this.loadingSections = true;
    this.sections = await this.suggestedService.listOpmlFiles();
    this.loadingSections = false;
  }

  async selectSection(section: { name: string; download_url: string }) {
    this.loadingFeeds = true;
    this.suggestedFeeds = await this.suggestedService.fetchOpmlItems(section.download_url);
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
