import { ReportSystemErrorComponent } from './report-system-error/report-system-error.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg';
import { CRUDTableModule } from '../../_metronic/shared/crud-table';
import { NgbActiveModal, NgbDateParserFormatter, NgbDatepickerModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { NgbDateCustomParserFormatter } from '../../_metronic/core/utils/ngb-date-custom-parser-formatter';
import { ReportDashboardOnlineComponent } from './report-dashboard-online/report-dashboard-online.component';
import { ReportErrorOccurredResolvedComponent } from './report-error-occurred-resolved/report-error-occurred-resolved.component';

@NgModule({
  declarations: [
    ReportDashboardOnlineComponent,
    ReportSystemErrorComponent,
    ReportErrorOccurredResolvedComponent,
    ReportsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InlineSVGModule,
    CRUDTableModule,
    NgbModalModule,
    NgbDatepickerModule,
    TranslateModule,
    MatIconModule,
    ReportsRoutingModule
  ],
  entryComponents: [],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
    { provide: NgbActiveModal}
  ]
})

export class ReportsModule { }
