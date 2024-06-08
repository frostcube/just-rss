import { Component, OnInit } from '@angular/core';
import { IonContent, IonInput, IonItem, IonList, IonModal, IonSelect, IonSelectOption, IonToggle } from '@ionic/angular/standalone';
import { ISettingsDict, SettingsService } from '../services/settings.service';
import { FormsModule } from '@angular/forms';
import { CountryCodeList } from './country-code-list';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [FormsModule, IonSelectOption, IonSelect, IonInput, IonItem, IonToggle, IonList, IonContent, IonModal]
})
export class SettingsComponent  implements OnInit {

  public currentSettings: ISettingsDict;
  public countryCodeList = CountryCodeList;

  constructor(public settingsService: SettingsService) {
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

}
