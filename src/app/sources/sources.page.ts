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
import { create, trash, checkmarkCircleOutline, closeCircleOutline, swapVerticalOutline } from 'ionicons/icons';
import { IFeedDict, SourcesService } from '../services/sources.service';
import { PlatformService } from '../services/platform.service';
import { SourceEditComponent } from '../source-edit/source-edit.component';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { URL_REGEX } from '../lib/macros';


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
  private editModalOpen = false;

  constructor(
    public sourcesService: SourcesService,
    public formBuild: FormBuilder,
    private alertController: AlertController,
    private modalController: ModalController,
    private platformService: PlatformService
  ) {
    addIcons({ trash, create, checkmarkCircleOutline, closeCircleOutline, swapVerticalOutline });

    this.rssForm = this.formBuild.group({
      url:  new FormControl('', {
        validators: [Validators.required, Validators.pattern(URL_REGEX)],
        updateOn: 'change',
      }),
    });
  }

  public async addUrl(websiteUrl: string) {
    try {
      const rssFeedUrl = await this.sourcesService.discoverRssFeed(websiteUrl);
      if (rssFeedUrl) {
        this.sourcesService.addSourceFromUrl(rssFeedUrl);
      } else {
        this.sourcesService.presentErrorToast('No RSS/Atom feed found at this URL.');
      }
    } catch (error) {
      this.sourcesService.presentErrorToast('Error discovering RSS/Atom feed.');
    }
  }

  async editUrl(feed: IFeedDict) {
    if (this.editModalOpen) return;
    this.editModalOpen = true;

    const modal = await this.modalController.create({
      component: SourceEditComponent,
      componentProps: { feed },
      breakpoints: [1.0],
      initialBreakpoint: 1.0,
      backdropDismiss: false
    });
    try {
      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data && data.updatedFeed) {
        const updated: IFeedDict = data.updatedFeed;
        if (updated.url === feed.url) {
          // Same URL: update in-place
          this.sourcesService.setSource(feed.url, updated);
        } else {
          // URL changed: remove old and add new
          this.sourcesService.removeSource(feed.url);
          this.sourcesService.addSource(updated);
        }
      }
    } finally {
      this.editModalOpen = false;
    }
  }

  reorderSources() {
    // Reorder sources A -> Z by title
    this.sourcesService.reorderSourcesAlphabetical();
  }

  async exportOPML(): Promise<void> {
    const opml = this.sourcesService.exportSourcesToOPML();
    if (this.platformService.isNative()) {
      // Save OPML to Documents and instruct user to open Files app
      const fileName = `sources_${Date.now()}.opml`;
      await Filesystem.writeFile({
        path: fileName,
        data: opml,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      if (this.platformService.isAndroid()) {
        await this.sourcesService.presentWarnToast(
          'OPML exported! Open the Files app, go to "Internal Storage" > "Documents" to access your file.'
        );
      }
      else {
        await this.sourcesService.presentWarnToast(
          'OPML exported! Open the Files app, go to "On My iPhone" > "just-rss" > "Documents" to access your file.'
        );
      }
    } else {
      // Browser fallback
      const blob = new Blob([opml], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sources.opml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }

  async importOPML(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      const opmlText = e.target?.result as string;
      try {
        const imported = this.sourcesService.importSourcesFromOPML(opmlText);
        if (imported) {
          await this.sourcesService.presentWarnToast('Sources imported from OPML!');
        } else {
          await this.sourcesService.presentErrorToast('Failed to import OPML.');
        }
      } catch (err) {
        await this.sourcesService.presentErrorToast('Invalid OPML file.');
      }
    };
    reader.readAsText(file);
    // Reset file input so the same file can be selected again
    input.value = '';
  }

}
