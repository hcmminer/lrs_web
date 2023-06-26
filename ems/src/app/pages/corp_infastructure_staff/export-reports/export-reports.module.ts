import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbModalModule, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from 'src/app/modules/material/material.module';
import {ExportReportsRoutingModule} from './export-reports-routing.module';

import {ExportReportsComponent} from './export-reports.component';
import {ExportReportsCorpComponent} from './export-reports-corp/export-reports-corp.component';
import {SafeHtmlPipe} from '../../../pipes/safeHtml.pipe';
import {SharedDisplayHtmlModule} from '../../../_metronic/shared/shared-display-html/shared-display-html.module';


@NgModule({
  declarations: [ExportReportsComponent, ExportReportsCorpComponent],
  imports: [
    CommonModule,
    ExportReportsRoutingModule,
    FormsModule,
    InlineSVGModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbModalModule,
    MatIconModule,
    NgxSpinnerModule,
    MaterialModule,
    NgbModule,
    SharedDisplayHtmlModule
  ],
})
export class ExportReportsModule { }
