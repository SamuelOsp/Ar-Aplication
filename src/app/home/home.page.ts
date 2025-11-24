import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { ArLauncherPage } from '../pages/ar-launcher/ar-launcher.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(
    private modalController: ModalController
  ) { }

  async openAR(type: string) {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: ArLauncherPage,
      componentProps: {
        arType: type
      }
    });

    return await modal.present();
  }
}
