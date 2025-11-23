import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArLauncherPage } from './ar-launcher.page';

const routes: Routes = [
  {
    path: '',
    component: ArLauncherPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArLauncherPageRoutingModule {}
