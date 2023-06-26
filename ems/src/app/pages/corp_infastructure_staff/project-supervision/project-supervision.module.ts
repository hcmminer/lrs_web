import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {MatNativeDateModule, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {InlineSVGModule} from 'ng-inline-svg';
import {MatIconModule} from '@angular/material/icon';
import {TranslateModule} from '@ngx-translate/core';
import {NgbDatepickerModule, NgbModalModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {BrowserModule} from '@angular/platform-browser';
import {NgxSpinnerModule} from 'ngx-spinner';
import {ProjectSupervisionComponent} from './project-supervision.component';
import {ProjectDetailComponent} from './project-detail/project-detail.component';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectSupervisionRoutingModule} from './project-supervision-routing.module';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';
import { MaterialModule } from 'src/app/modules/material/material.module';
import {MatInputModule} from '@angular/material/input';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
    declarations: [ProjectSupervisionComponent, ProjectDetailComponent, ProjectListComponent],
  imports: [
    CommonModule,
    ProjectSupervisionRoutingModule,
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
    MaterialModule,
    NgbModule,
    MatInputModule,
    CdkTreeModule,
    CdkTableModule,
    MatTabsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ]
})
export class ProjectSupervisionModule {}
