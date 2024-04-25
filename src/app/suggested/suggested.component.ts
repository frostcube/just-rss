import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { suggestFeeds } from './suggested-feeds';
import { IonButton, IonCheckbox, IonContent, IonItem, IonList } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { SourcesService } from '../services/sources.service';

@Component({
  selector: 'app-suggested',
  templateUrl: './suggested.component.html',
  styleUrls: ['./suggested.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonList, IonItem, IonCheckbox, IonButton]
})
export class SuggestedComponent implements OnInit {

  public suggestedFeeds = suggestFeeds;

  constructor(public sourcesService: SourcesService) { }

  ngOnInit() {}

  addFeeds() {
    for (const feed of this.suggestedFeeds) {
      if (feed.selected)
        this.sourcesService.addSourceFromUrl(feed.xmlUrl);
    }
  }

}
