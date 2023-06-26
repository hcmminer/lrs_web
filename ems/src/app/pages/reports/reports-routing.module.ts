import { ReportSystemErrorComponent } from './report-system-error/report-system-error.component';
import { NgModule } from '@angular/core';
import { ReportsComponent } from './reports.component';
import { Routes, RouterModule } from '@angular/router';
import { ReportDashboardOnlineComponent } from './report-dashboard-online/report-dashboard-online.component';
import { ReportErrorOccurredResolvedComponent } from './report-error-occurred-resolved/report-error-occurred-resolved.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    children: [
      {
        path: 'report-dashboard',
        component: ReportDashboardOnlineComponent
      },
      {
        path: 'report-system-error',
        component: ReportSystemErrorComponent
      },
      {
        path: 'report-error-occurred-resolved',
        component: ReportErrorOccurredResolvedComponent
      },
      { path: '', redirectTo: 'report-dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
