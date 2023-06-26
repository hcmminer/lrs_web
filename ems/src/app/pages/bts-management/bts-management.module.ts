import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StationManagementRoutingModule} from '../station-management/station-management-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InlineSVGModule} from 'ng-inline-svg';
import {TranslateModule} from '@ngx-translate/core';
import {NgbDatepickerModule, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {MatIconModule} from '@angular/material/icon';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {CRUDTableModule} from '../../_metronic/shared/crud-table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {NgxSpinnerModule} from 'ngx-spinner';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {BtsManagementComponent} from './bts-management.component';
import {BtsManagementRoutingModule} from './bts-management-routing.module';
import {ListBtsComponent} from './list-bts/list-bts.component';
import { InitBtsComponent } from './init-bts/init-bts.component';

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
    NgbDatepickerModule,
    MatNativeDateModule,
    MatDatepickerModule,
    CRUDTableModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    NgxDropzoneModule
  ],
})
export class BtsManagementModule {}
