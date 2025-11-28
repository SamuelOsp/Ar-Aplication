import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Camera } from '@capacitor/camera';

@Component({
  selector: 'app-ar-launcher',
  templateUrl: './ar-launcher.page.html',
  styleUrls: ['./ar-launcher.page.scss'],
  standalone: false,
})
export class ArLauncherPage implements OnInit {

  @Input() arType: string = 'box';
  safeUrl: SafeResourceUrl | undefined;
  permissionGranted = false;

  constructor(private modalCtrl: ModalController, private sanitizer: DomSanitizer) { }

  async ngOnInit() {
    await this.checkCameraPermission();

    this.permissionGranted = true;
    const url = `/assets/aframe-ar.html?type=${this.arType}`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  async checkCameraPermission(): Promise<boolean> {
    try {
      const status = await Camera.checkPermissions();
      if (status.camera === 'granted') {
        return true;
      }
      const request = await Camera.requestPermissions({ permissions: ['camera'] });
      return request.camera === 'granted';
    } catch (e) {
      console.error('Error checking camera permissions', e);
      return false;
    }
  }

  async close() {
    await this.modalCtrl.dismiss();
  }
}
