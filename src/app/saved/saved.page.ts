import { Component, ElementRef, OnInit } from '@angular/core';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark } from 'ionicons/icons';
import { formatDateRelative } from '../lib/date-utils';
import { BookmarkService } from '../services/bookmark.service';
import { SettingsService } from '../services/settings.service';
import { StorageService } from '../services/storage.service';
import { ArticleListComponent } from '../shared/article-list/article-list.component';
import { SkeletonsComponent } from '../shared/skeletons/skeletons.component';

@Component({
  selector: 'app-saved',
  templateUrl: 'saved.page.html',
  styleUrls: ['saved.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardContent, 
    IonCardSubtitle, IonCardTitle, IonButton, IonLabel, IonList, IonIcon, IonItem,
    ArticleListComponent, SkeletonsComponent
  ],
})
export class SavedPage {

  public formatDateRelative = formatDateRelative;
  public filter: string = '';
  public loading = true;

  constructor(public elementRef: ElementRef,
              public bookmarks: BookmarkService) {
    addIcons({ bookmark });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public removeBookmark(event: any, entry: any) {
    this.bookmarks.removeEntry(entry);
    event.stopPropagation();
  }
}
