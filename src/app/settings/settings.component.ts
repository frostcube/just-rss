import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent, IonInput, IonItem, IonLabel, IonList, IonModal, IonNote, IonSelect, IonSelectOption, IonToggle } from '@ionic/angular/standalone';
import { ISettingsDict, SettingsService } from '../services/settings.service';
import { CountryCodeList } from './country-code-list';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [FormsModule, IonNote, IonSelectOption, IonSelect, IonInput, IonItem, IonToggle, IonLabel, IonList, IonContent, IonModal]
})
export class SettingsComponent  implements OnInit {

  public currentSettings: ISettingsDict;
  public countryCodeList = CountryCodeList;

  constructor(public settingsService: SettingsService, private alertController: AlertController) {
    this.currentSettings = this.settingsService.getSettings();
  }

  ngOnInit() { }

  public update() {
    this.settingsService.updateSettings(this.currentSettings);
    this.currentSettings = this.settingsService.getSettings();
  }

  public getCountryTag(country: typeof CountryCodeList[0]) {
    return country.officialLanguageCode + '-' + country.countryCode;
  }

  async openMutedWordsDialog() {
    const alert = await this.alertController.create({
      header: 'Muted Words',
      inputs: this.currentSettings.mutedWords.map(word => ({
        name: word,
        type: 'checkbox',
        label: word,
        value: word,
        checked: true,
      })),
      buttons: [
        {
          text: 'Add New',
          handler: async () => {
            const prompt = await this.alertController.create({
              header: 'Add Muted Word',
              inputs: [
                {
                  name: 'newWord',
                  type: 'text',
                  placeholder: 'e.g., politics'
                }
              ],
              buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                  text: 'Add',
                  handler: (data) => {
                    if (data.newWord?.trim()) {
                      this.currentSettings.mutedWords.push(data.newWord.trim().toLowerCase());
                      this.settingsService.updateSettings(this.currentSettings);
                    }
                  }
                }
              ]
            });
            await prompt.present();
          }
        },
        {
          text: 'Remove Selected',
          handler: (selected: string[]) => {
            this.currentSettings.mutedWords = this.currentSettings.mutedWords.filter(w => !selected.includes(w));
            this.settingsService.updateSettings(this.currentSettings);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  // Getter/Setters for settings stored as numbers to ensure types are correct
  get retrievalTimeout() { return String(this.currentSettings.retrievalTimeout); }
  set retrievalTimeout(v) { this.currentSettings.retrievalTimeout = Number(v); }

  get defaultPollingFrequency() { return String(this.currentSettings.defaultPollingFrequency); }
  set defaultPollingFrequency(v) { this.currentSettings.defaultPollingFrequency = Number(v); }

  get maxFeedLength() { return String(this.currentSettings.maxFeedLength); }
  set maxFeedLength(v) { this.currentSettings.maxFeedLength = Number(v); }
}
