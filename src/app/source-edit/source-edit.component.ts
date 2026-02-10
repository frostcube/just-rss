import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonToggle,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { IFeedDict, SourcesService } from '../services/sources.service';

// Local URL validation (matches SourcesPage pattern)
const URL_REGEX = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[^\s]*)?$/;

@Component({
  selector: 'app-source-edit',
  templateUrl: './source-edit.component.html',
  styleUrls: ['./source-edit.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle,
    IonSelect,
    IonSelectOption
  ]
})
export class SourceEditComponent implements OnInit {
  @Input() feed!: IFeedDict;

  public form: FormGroup;

  constructor(private fb: FormBuilder, private modalController: ModalController,
              private sourcesService: SourcesService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(URL_REGEX)]],
      description: [''],
      pollingFrequency: [0, [Validators.min(0), Validators.max(86400)]],
      podcast: [false],
      tags: ['']
    });
  }

  ngOnInit() {
    if (this.feed) {
      this.form.patchValue({
        title: this.feed.title ?? '',
        url: this.feed.url ?? '',
        description: this.feed.description ?? '',
        pollingFrequency: this.feed.pollingFrequency ?? 0,
        podcast: this.feed.podcast ?? false,
        tags: (this.feed.tags ?? []).join(', ')
      });
    }
  }

  public async save() {
    if (this.form.invalid) return;

    const values = this.form.value;

    // Check for duplicate URL (different source with same URL)
    const existing = this.sourcesService.getSources().find(s => s.url === values.url);
    if (existing && existing.url !== this.feed.url) {
      await this.sourcesService.presentErrorToast('Feed already exists!');
      return;
    }

    const parsedTags = (values.tags || '').split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);

    const updatedFeed: IFeedDict = {
      url: values.url,
      title: values.title,
      iconUrl: this.feed.iconUrl,
      description: values.description,
      lastPublished: this.feed.lastPublished,
      lastRetrieved: this.feed.lastRetrieved,
      pollingFrequency: Number(values.pollingFrequency),
      healthy: this.feed.healthy,
      podcast: Boolean(values.podcast),
      tags: parsedTags
    };

    await this.modalController.dismiss({ updatedFeed }, 'save');
  }

  public async cancel() {
    await this.modalController.dismiss(null, 'cancel');
  }

}
