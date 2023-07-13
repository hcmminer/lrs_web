import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbActiveModal, NgbDatepickerModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';
import { SharedDisplayHtmlModule } from 'src/app/_metronic/shared/shared-display-html/shared-display-html.module';
// bandv..
import { NumbersOnlyDirective as NumbersOnlyDirective1 } from '../directives/only-number.directive';
import { FormatNumberPipe as FormatNumberPipe1 } from 'src/app/_metronic/core/pipes/formatNumber.pipe';
import { BtsComponent } from './sub-menus/bts/bts.component';
import { AddEditBtsComponent } from './sub-menus/bts/components/add-edit-bts/add-edit-bts.component';
import { BtsContainerRoutingModule } from './bts-container-routing.module';
// ..bandv

@NgModule({
  declarations: [
    // bandv..
    BtsComponent,
    AddEditBtsComponent,
    // NumbersOnlyDirective1,
    // FormatNumberPipe1,
    // ..bandv    
  ],
  providers: [NgbActiveModal, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  imports: [
    BtsContainerRoutingModule,
    CommonModule,
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
    NgxDropzoneModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatRadioModule,
    SharedDisplayHtmlModule,
  ],
  // exports: [NumbersOnlyDirective1,FormatNumberPipe1],
})
export class BtsContainerModule {}
