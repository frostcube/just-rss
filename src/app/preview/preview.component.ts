import { Component, Input, OnInit } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { PlatformService } from '../services/platform.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar]
})
export class PreviewComponent  implements OnInit {

  isModalOpen = false;

  @Input() articleTitle: string | undefined;
  @Input() articleContent: string | undefined;
  @Input() articleLink: string | undefined;

  constructor(private modalController: ModalController, public platformService: PlatformService) { }

  ngOnInit() {}

  public close() {
    this.modalController.dismiss(null, 'cancel');
  }

}
