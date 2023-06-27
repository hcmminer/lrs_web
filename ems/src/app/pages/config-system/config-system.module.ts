import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigSystemRoutingModule } from './config-system-routing.module';
import { NgbActiveModal, NgbDatepickerModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { ConfigSystemComponent } from './config-system.component';
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
import { TabOptionSetComponent } from './all-tab/tab-option-set/tab-option-set.component';
import { AddEditDataProblemComponent } from './all-tab/tab-option-set/childs/add-edit-data-problem/add-edit-data-problem.component';


@NgModule({
  declarations: [ConfigSystemComponent, TabOptionSetComponent, AddEditDataProblemComponent],
  providers: [NgbActiveModal, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  imports: [
    CommonModule,
    ConfigSystemRoutingModule,
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
  ]
})
export class ConfigSystemModule { }
