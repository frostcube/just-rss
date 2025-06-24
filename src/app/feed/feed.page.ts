import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle, IonCardTitle,
  IonContent,
  IonFab, IonFabButton,
  IonHeader, IonIcon, IonInput, IonItem,
  IonItemOption, IonItemOptions,
  IonLabel, IonList,
  IonMenu,
  IonMenuToggle,
  IonNote, IonRefresher,
  IonRefresherContent, IonText,
  IonThumbnail,
  IonTitle, IonToolbar,
  ModalController,
  ScrollDetail
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark, bookmarkOutline, chevronForward, chevronUpOutline, ellipsisVertical, filterOutline, shareSocialOutline } from 'ionicons/icons';
import { PreviewComponent } from '../preview/preview.component';
import { BookmarkService } from '../services/bookmark.service';
import { FeedService } from '../services/feed.service';
import { PlatformService } from '../services/platform.service';
import { SettingsService } from '../services/settings.service';
import { SourcesService } from '../services/sources.service';
import { SettingsComponent } from '../settings/settings.component';
import { formatDateAsDay, formatDateAsLong, formatDateRelative } from '../lib/date-utils';

@Component({
  selector: 'app-feed',
  templateUrl: 'feed.page.html',
  styleUrls: ['feed.page.scss'],
  standalone: true,
  imports: [FormsModule, IonCard, IonCardHeader, IonCardContent, 
    IonCardSubtitle, IonCardTitle, IonHeader, IonToolbar, IonTitle, IonNote, 
    IonContent, IonList, IonInput, IonItem, IonItemOption, IonItemOptions, 
    IonIcon, IonButton, IonButtons, IonText, IonMenu, IonThumbnail, IonMenuToggle, 
    IonLabel, IonRefresher, IonRefresherContent, IonFab, IonFabButton,
    SettingsComponent]
})

export class FeedPage {

  @ViewChild('mainFeed', { static: true })
  public mainFeed!: IonContent;
  public filter: string = '';
  public currentScrollOffset: number = 0;

  constructor(public sourcesService: SourcesService, public platformService: PlatformService, 
              public bookmarkService: BookmarkService, public feedService: FeedService,
              private modalController: ModalController, public elementRef: ElementRef,
              public settingsService: SettingsService) {
    addIcons({ bookmark, bookmarkOutline, shareSocialOutline, ellipsisVertical, filterOutline, chevronForward, 
      chevronUpOutline });
  }

  public scrollToTop() {
    this.mainFeed.scrollToTop(400);
  }

  public filterByUrl(url: string) {
    if (this.filter === url)
      this.filterClear();
    else
      this.filter = url;
    console.log('[FeedPage] Filter set: ' + this.filter);
  }

  public filterClear() {
    this.filter = '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addBookmark(event: Event, entry: any) {
    this.bookmarkService.addEntry(entry);
    event.stopPropagation();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public removeBookmark(event: Event, entry: any) {
    this.bookmarkService.removeEntry(entry);
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
        presentingElement: this.elementRef.nativeElement,

      });

      preview.present();
    }
    else {
      this.platformService.openUrlInPlatformBrowser(url);
    }
  }

  async openSettings() {
    const settings = await this.modalController.create({
      component: SettingsComponent,
      breakpoints: [0, 0.4, 0.7],
      initialBreakpoint: 0.4
    });

    settings.present();
  }

  public handleScroll(ev: CustomEvent<ScrollDetail>) {
    this.currentScrollOffset = ev.detail.currentY;
  }

}
