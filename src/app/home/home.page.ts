import { Component } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';

import { ArLauncherPage } from '../pages/ar-launcher/ar-launcher.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(
    private modalController: ModalController,
    private alertController: AlertController
  ) { }

  async openAR() {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: ArLauncherPage,
      componentProps: {
        arType: 'image' // Default to image for the Hiro marker
      }
    });

    return await modal.present();
  }

  async addTarget() {
    const alert = await this.alertController.create({
      header: 'Nuevo Target',
      inputs: [
        {
          name: 'code',
          type: 'number',
          placeholder: 'Número de Barcode (ej. 20)'
        },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Color (ej. red, blue, #ff0000)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.saveTarget(data.code, data.color);
          }
        }
      ]
    });

    await alert.present();
  }

  saveTarget(code: string, color: string) {
    const newTarget = {
      markerType: 'barcode',
      value: parseInt(code),
      content: { type: 'box', color: color, opacity: 0.8 }
    };

    // Obtener existentes
    const existing = localStorage.getItem('arTargets');
    let targets = existing ? JSON.parse(existing) : [];

    // Si es la primera vez, cargar también los default para no perderlos
    if (!existing) {
      targets = [
        { markerType: 'hiro', content: { type: 'image', src: 'imagetarget.jpg' } },
        { markerType: 'kanji', content: { type: 'box', color: 'yellow', opacity: 0.8 } },
        { markerType: 'barcode', value: 5, content: { type: 'cylinder', color: 'green', height: 1, radius: 0.5 } },
        { markerType: 'barcode', value: 10, content: { type: 'torus', color: 'purple', radius: 0.5, animation: 'property: rotation; to: 0 360 0; loop: true; dur: 3000' } }
      ];
    }

    // Agregar nuevo
    targets.push(newTarget);
    localStorage.setItem('arTargets', JSON.stringify(targets));
    console.log('Target guardado:', newTarget);
  }
}
