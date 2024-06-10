import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption, IonItemOptions,
  IonItemSliding, IonLabel,
  IonList,
  IonNote,
  IonText,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { create, trash, checkmarkCircleOutline, closeCircleOutline, compassOutline } from 'ionicons/icons';
import { IFeedDict, SourcesService } from '../services/sources.service';
import { SuggestedComponent } from '../suggested/suggested.component';

// AngularJS URL Validation
const URL_REGEX = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/;
@Component({
  selector: 'app-sources',
  templateUrl: 'sources.page.html',
  styleUrls: ['sources.page.scss'],
  standalone: true,
  imports: [FormsModule, IonHeader, IonNote, IonToolbar, IonTitle, IonContent, IonList, 
    IonInput, IonItem, IonIcon, IonButton, IonButtons, IonText, IonItemSliding, IonLabel, IonItemOption, 
    IonItemOptions, ReactiveFormsModule]
})
export class SourcesPage {
  inputUrl: string = '';
  public rssForm: FormGroup;

  constructor(public sourcesService: SourcesService, public formBuild: FormBuilder,
              private alertController: AlertController, private modalController: ModalController) {
    addIcons({ trash, create, checkmarkCircleOutline, closeCircleOutline, compassOutline });

    this.rssForm = this.formBuild.group({
      url:  new FormControl('', {
        validators: [Validators.required, Validators.pattern(URL_REGEX)],
        updateOn: 'change',
      }),
    });
  }

  public addUrl(websiteUrl: string) {
    console.warn('[SourcesComponent] Adding new url');
    this.sourcesService.addSourceFromUrl(websiteUrl);
  }

  public discoverUrl(websiteUrl: string) {
    this.sourcesService.discoverRssFeed(websiteUrl)
      .then((rssFeedUrl) => {
        if (rssFeedUrl) {
          console.log(`[SourcesComponent] Discovered RSS feed URL: ${rssFeedUrl}`);
          this.addUrl(rssFeedUrl);
        } else {
          console.log('[SourcesComponent] No RSS feed found.');
          this.sourcesService.presentErrorToast('No RSS Feed Found');
        }
      })
      .catch((error) => {
        console.error('[SourcesComponent] Error discovering RSS feed:', error);
        this.sourcesService.presentErrorToast('Error when trying to discover RSS Feed');
      });
  }

  public load() {
    this.sourcesService.loadSourcesList();
  }

  async editUrl(feed: IFeedDict) {
    const temp_feed = feed;

    const alert = await this.alertController.create({
      header: 'Edit Source',
      inputs: [
        {
          name: 'title',
          value: feed.title
        },
        {
          name: 'url',
          value: feed.url
        },
        {
          name: 'description',
          value: feed.description,
          type: 'textarea',
          placeholder: 'What is this feed about?'
        },
        {
          name: 'polling',
          value: feed.pollingFrequency,
          type: 'number',
          placeholder: 'Polling Frequency (Seconds)',
          min: 0,
          max: 86400
        }
      ],
      buttons: ['Save'],
    });

    await alert.present();

    await alert.onDidDismiss().then((data) => {
      if (data.data !== undefined) {
        temp_feed.title = data.data.values.title;
        temp_feed.url = data.data.values.url;
        temp_feed.description = data.data.values.description;
        temp_feed.pollingFrequency = data.data.values.polling;

        // Update stored Dictionary
        this.sourcesService.removeSource(feed.url);
        this.sourcesService.addSource(temp_feed);
      }
    });
  }

  async openSuggestions() {
    const settings = await this.modalController.create({
      component: SuggestedComponent,
      breakpoints: [0, 0.5],
      initialBreakpoint: 0.5
    });

    settings.present();
  }

  // removeUrl(url: string) {
  //   this.sourcesService.removeSource(url);
  // }

}
