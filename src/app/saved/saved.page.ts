import { Component } from '@angular/core';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark } from 'ionicons/icons';
import { BookmarkService } from '../services/bookmark.service';
import { PlatformService } from '../services/platform.service';

@Component({
  selector: 'app-saved',
  templateUrl: 'saved.page.html',
  styleUrls: ['saved.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardContent, 
    IonCardSubtitle, IonCardTitle, IonButton, IonLabel, IonList, IonIcon, IonItem],
})
export class SavedPage {
  constructor(public bookmarks: BookmarkService, public platformService: PlatformService) {
    addIcons({ bookmark });
  }

  public formatDate(dateStr: string, locale: string)
  {
    const date = new Date(dateStr);
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString(locale, dateOptions);        
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public removeBookmark(event: any, entry: any) {
    this.bookmarks.removeEntry(entry);
    event.stopPropagation();
  }
}
