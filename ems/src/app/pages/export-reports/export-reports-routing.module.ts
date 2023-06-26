import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ExportReportsComponent} from './export-reports.component';
import {ReportsComponent} from './reports/reports.component';


const routes: Routes = [
  {
    path: '',
    component: ExportReportsComponent,
    children: [
      { path: 'reports', component: ReportsComponent},
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportReportsRoutinModule {}
