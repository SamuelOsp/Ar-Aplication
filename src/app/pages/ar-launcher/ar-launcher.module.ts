import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';



import { ArLauncherPage } from './ar-launcher.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [ArLauncherPage],
  exports: [ArLauncherPage]
})
export class ArLauncherPageModule { }
