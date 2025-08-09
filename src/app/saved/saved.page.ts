import { Component, ElementRef, OnInit } from '@angular/core';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark } from 'ionicons/icons';
import { BookmarkService } from '../services/bookmark.service';
import { SettingsService } from '../services/settings.service';
import { PlatformService } from '../services/platform.service';
import { formatDateRelative } from '../lib/date-utils';
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
export class SavedPage implements OnInit {

  public formatDateRelative = formatDateRelative;
  public filter: string = '';
  public loading = true;

  constructor(public elementRef: ElementRef,
              public bookmarks: BookmarkService, 
              public platformService: PlatformService,
              public settingsService: SettingsService) {
    addIcons({ bookmark });
  }

  ngOnInit() {
    // If bookmarks are already present, hide skeleton. Otherwise hide after short delay.
    if (this.bookmarks.getBookmarks() && this.bookmarks.getBookmarks().length > 0) {
      this.loading = false;
    } else {
      setTimeout(() => { this.loading = false; }, 250);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public removeBookmark(event: any, entry: any) {
    this.bookmarks.removeEntry(entry);
    event.stopPropagation();
  }
}
