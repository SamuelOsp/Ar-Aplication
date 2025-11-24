import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ar-launcher',
  templateUrl: './ar-launcher.page.html',
  styleUrls: ['./ar-launcher.page.scss'],
  standalone: false,
})
export class ArLauncherPage implements OnInit {

  @Input() arType: string = 'box';
  safeUrl: SafeResourceUrl | undefined;

  constructor(private modalCtrl: ModalController, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    const url = `./assets/aframe-ar.html?type=${this.arType}`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  async close() {
    await this.modalCtrl.dismiss();
  }
}
