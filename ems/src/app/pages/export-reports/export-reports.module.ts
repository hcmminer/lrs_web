import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExportReportsComponent} from './export-reports.component';
import {ExportReportsRoutinModule} from './export-reports-routing.module';
import { ReportsComponent } from './reports/reports.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InlineSVGModule} from 'ng-inline-svg';
import {TranslateModule} from '@ngx-translate/core';
import {NgbActiveModal, NgbDateParserFormatter, NgbDatepickerModule, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {MatIconModule} from '@angular/material/icon';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {CRUDTableModule} from '../../_metronic/shared/crud-table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {NgxSpinnerModule} from 'ngx-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ProvinceReportComponent} from './reports/province-report/province-report.component';
import {MonthlyReportComponent} from './reports/monthly-report/monthly-report.component';
import {AnnualReportComponent} from './reports/annual-report/annual-report.component';
import {AccumulReportComponent} from './reports/accumul-report/accumul-report.component';
import {NgbDateCustomParserFormatter} from '../../_metronic/core/utils/ngb-date-custom-parser-formatter';
import {SafeHtmlPipe} from '../../pipes/safeHtml.pipe';
import {SharedDisplayHtmlModule} from '../../_metronic/shared/shared-display-html/shared-display-html.module';


@NgModule({
  // tslint:disable-next-line:max-line-length
  declarations: [ExportReportsComponent, ReportsComponent, ProvinceReportComponent, MonthlyReportComponent, AnnualReportComponent, AccumulReportComponent],
  imports: [
    CommonModule,
    ExportReportsRoutinModule,
    FormsModule,
    InlineSVGModule,
    TranslateModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbModalModule,
    MatIconModule,
    NgbDatepickerModule,
    CRUDTableModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    MatFormFieldModule,
    SharedDisplayHtmlModule
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
    { provide: NgbActiveModal}
  ]
})
export class ExportReportsModule { }
