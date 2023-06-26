import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardDetailOnlineComponent} from './dashboard-detail-online/dashboard-detail-online.component';
import {DashboardManagementComponent} from './dashboard-management.component';
import {DashboardOnlineComponent} from './dashboard-online/dashboard-online.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardManagementComponent,
    children: [
      {
        path: 'dashboard-detail',
        component: DashboardDetailOnlineComponent
      },
      {
        path: 'dashboard-group',
        component: DashboardOnlineComponent
      },
      { path: '', redirectTo: 'dashboard-detail', pathMatch: 'full' },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardManagementRoutingModule {}
