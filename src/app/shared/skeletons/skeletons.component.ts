import { Component, Input } from '@angular/core';
import { IonList, IonItem, IonThumbnail, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-skeletons',
  templateUrl: './skeletons.component.html',
  styleUrls: ['./skeletons.component.scss'],
  standalone: true,
  imports: [IonList, IonItem, IonThumbnail, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent]
})
export class SkeletonsComponent {
  @Input() compressed = true;
  @Input() rows = 5;
  @Input() cards = 4;

  public rowsArray: number[] = [];
  public cardsArray: number[] = [];

  constructor() {
    this.updateArrays();
  }

  ngOnChanges(): void {
    this.updateArrays();
  }

  private updateArrays() {
    this.rowsArray = Array.from({ length: this.rows }, (_, i) => i);
    this.cardsArray = Array.from({ length: this.cards }, (_, i) => i);
  }
}
