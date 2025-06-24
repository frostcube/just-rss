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
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Remove time for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      return date.toLocaleDateString(locale, dateOptions);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public removeBookmark(event: any, entry: any) {
    this.bookmarks.removeEntry(entry);
    event.stopPropagation();
  }
}
