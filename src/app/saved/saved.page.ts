import { Component } from '@angular/core';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark } from 'ionicons/icons';
import { BookmarkService } from '../services/bookmark.service';
import { PlatformService } from '../services/platform.service';
import { formatDateRelative } from '../lib/date-utils';
import { ArticleListComponent } from '../article-list/article-list.component';

@Component({
  selector: 'app-saved',
  templateUrl: 'saved.page.html',
  styleUrls: ['saved.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardContent, 
    IonCardSubtitle, IonCardTitle, IonButton, IonLabel, IonList, IonIcon, IonItem,
    ArticleListComponent
  ],
})
export class SavedPage {
  public formatDateRelative = formatDateRelative;
  public filter: string = '';

  constructor(public bookmarks: BookmarkService, public platformService: PlatformService) {
    addIcons({ bookmark });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public removeBookmark(event: any, entry: any) {
    this.bookmarks.removeEntry(entry);
    event.stopPropagation();
  }
}
