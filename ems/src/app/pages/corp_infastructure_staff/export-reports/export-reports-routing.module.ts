import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ExportReportsCorpComponent} from './export-reports-corp/export-reports-corp.component';
import {ExportReportsComponent} from './export-reports.component';

const routes: Routes = [
  {
    path: '',
    component: ExportReportsComponent,
    children: [
      { path: 'progress-report-corp', component: ExportReportsCorpComponent},
      { path: '', redirectTo: 'progress-report-corp', pathMatch: 'full' },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportReportsRoutingModule {}
