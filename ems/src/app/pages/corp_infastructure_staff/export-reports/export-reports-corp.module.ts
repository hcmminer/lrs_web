import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportReportsCorpComponent } from './export-reports-corp.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { NgbModalModule, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    InlineSVGModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbModalModule,
    MatIconModule,
    NgxSpinnerModule,
    MaterialModule,
    NgbModule,
    RouterModule.forChild([
      {
        path: '',
        component: ExportReportsCorpComponent,
      },
    ]),
  ],
  declarations: [ExportReportsCorpComponent]
})
export class ExportReportsCorpModule { }
