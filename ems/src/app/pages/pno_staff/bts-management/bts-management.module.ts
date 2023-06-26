import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InlineSVGModule} from 'ng-inline-svg';
import {TranslateModule} from '@ngx-translate/core';
import {NgbActiveModal, NgbDateParserFormatter, NgbDatepickerModule, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {MatIconModule} from '@angular/material/icon';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';

import {MatCheckboxModule} from '@angular/material/checkbox';
import {NgxSpinnerModule} from 'ngx-spinner';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {BtsManagementComponent} from './bts-management.component';
import {BtsManagementRoutingModule} from './bts-management-routing.module';
import {ListBtsComponent} from './list-bts/list-bts.component';
import { InitBtsComponent } from './init-bts/init-bts.component';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';
import {NgbDateCustomParserFormatter} from '../../../_metronic/core/utils/ngb-date-custom-parser-formatter';
import {SharedDisplayHtmlModule} from '../../../_metronic/shared/shared-display-html/shared-display-html.module';
import {MatInputModule} from '@angular/material/input';

@NgModule({
  declarations: [
    BtsManagementComponent,
    ListBtsComponent,
    InitBtsComponent
  ],
  imports: [
    CommonModule,
    BtsManagementRoutingModule,
    FormsModule,
    InlineSVGModule,
    TranslateModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbModalModule,
    MatIconModule,
    MatNativeDateModule,
    MatDatepickerModule,
    CRUDTableModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    NgxDropzoneModule,
    SharedDisplayHtmlModule,
    MatInputModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class BtsManagementModule {}
