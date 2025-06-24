import { Component, Input } from '@angular/core';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonIcon, IonItem, IonItemOption, IonItemOptions, IonLabel,
  IonList, IonNote, IonText, IonThumbnail, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark, bookmarkOutline } from 'ionicons/icons';
import { PreviewComponent } from 'src/app/preview/preview.component';
import { BookmarkService } from 'src/app/services/bookmark.service';
import { PlatformService } from 'src/app/services/platform.service';
import { SettingsService } from 'src/app/services/settings.service';
import { formatDateAsDay, formatDateRelative } from '../lib/date-utils';
import { FeedService } from '../services/feed.service';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardContent, IonCardSubtitle, IonCardTitle,
    IonNote, IonItem, IonIcon, IonButton, IonItemOption, IonItemOptions, 
    IonText, IonLabel, IonThumbnail, IonList
  ]
})

export class ArticleListComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() entries: any[] = [];
  @Input() filter: string = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() presentingElementId: any;

  public formatDateRelative = formatDateRelative;
  public formatDateAsDay = formatDateAsDay;

  constructor(public bookmarkService: BookmarkService,
              public feedService: FeedService,
              public modalController: ModalController,
              public platformService: PlatformService, 
              public settingsService: SettingsService) { 
    addIcons({ bookmark, bookmarkOutline});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addBookmark(event: Event, entry: any) {
    this.feedService.updateBookmarkStatus(entry, true);
    this.bookmarkService.addEntry(entry);
    this.feedService.saveEntries();
    event.stopPropagation();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public removeBookmark(event: Event, entry: any) {
    this.bookmarkService.removeEntry(entry);
    this.feedService.updateBookmarkStatus(entry, false);
    event.stopPropagation();
  }

  async openPreview(title: string, content: string, url: string) {
    if (this.settingsService.getSettings().preview) {
      const preview = await this.modalController.create({
        component: PreviewComponent,
        componentProps: {
          articleTitle: title,
          articleContent: content,
          articleLink: url
        },
        presentingElement: this.presentingElementId,

      });

      preview.present();
    }
    else {
      this.platformService.openUrlInPlatformBrowser(url);
    }
  }
}
