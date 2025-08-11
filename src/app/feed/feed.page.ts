import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons, IonContent,
  IonFab, IonFabButton,
  IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList,
  IonMenu,
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent, IonText,
  IonThumbnail,
  IonTitle, IonToolbar,
  ModalController,
  ScrollDetail
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward, chevronUpOutline, ellipsisVertical, filterOutline, shareSocialOutline } from 'ionicons/icons';
import { formatDateAsDay, formatDateAsLong, formatDateRelative } from '../lib/date-utils';
import { BookmarkService } from '../services/bookmark.service';
import { FeedService } from '../services/feed.service';
import { PlatformService } from '../services/platform.service';
import { SettingsService } from '../services/settings.service';
import { SourcesService } from '../services/sources.service';
import { StorageService } from '../services/storage.service';
import { SettingsComponent } from '../settings/settings.component';
import { ArticleListComponent } from '../shared/article-list/article-list.component';
import { SkeletonsComponent } from '../shared/skeletons/skeletons.component';

@Component({
  selector: 'app-feed',
  templateUrl: 'feed.page.html',
  styleUrls: ['feed.page.scss'],
  standalone: true,
  imports: [
    FormsModule, IonItem,
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonInput, 
    IonIcon, IonButton, IonButtons, IonText, IonMenu, IonThumbnail, IonMenuToggle, 
    IonLabel, IonRefresher, IonRefresherContent, IonFab, IonFabButton,
    SettingsComponent,
    ArticleListComponent,
    SkeletonsComponent
  ]
})

export class FeedPage {

  @ViewChild('mainFeed', { static: true })
  public mainFeed!: IonContent;
  public filter: string = '';
  public currentScrollOffset: number = 0;
  public loading: boolean = true;

  public formatDateAsDay = formatDateAsDay;
  public formatDateAsLong = formatDateAsLong;
  public formatDateRelative = formatDateRelative;

  constructor(public elementRef: ElementRef,
              public sourcesService: SourcesService, public platformService: PlatformService, 
              public bookmarkService: BookmarkService, public feedService: FeedService,
              public storageService: StorageService,
              private modalController: ModalController, public settingsService: SettingsService) {
    addIcons({ shareSocialOutline, ellipsisVertical, filterOutline, chevronForward, 
      chevronUpOutline });

    // Keep the feed hidden until storage is ready and feed entries have been loaded
    this.storageService.onReady.subscribe((ready) => {
      if (ready) {
        // small delay to avoid flicker when fast devices
        setTimeout(() => { this.loading = false; }, 150);
      }
    });
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
