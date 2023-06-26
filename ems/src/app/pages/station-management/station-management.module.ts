import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StationManagementComponent } from './station-management.component';
import {MatNativeDateModule} from '@angular/material/core';
import {CRUDTableModule} from '../../_metronic/shared/crud-table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {InlineSVGModule} from 'ng-inline-svg';
import {MatIconModule} from '@angular/material/icon';
import {TranslateModule} from '@ngx-translate/core';
import {NgbDatepickerModule, NgbModalModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {BrowserModule} from '@angular/platform-browser';
import {StationManagementRoutingModule} from './station-management-routing.module';
import { InitConstructionComponent } from './init-construction/init-construction.component';
import { StationDetailComponent } from './station-detail/station-detail.component';
import { ListStationComponent } from './list-station/list-station.component';
import {NgxSpinnerModule} from 'ngx-spinner';
import {CustomDropzoneModule} from '../../_metronic/shared/custom-dropzone/custom-dropzone.module';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {EditConstructionComponent} from './edit-construction/edit-construction.component';
import {TreeModule} from '../tree/tree.module';
import {MatDialogModule} from '@angular/material/dialog';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';

@NgModule({
    declarations: [
      StationManagementComponent,
      InitConstructionComponent,
      StationDetailComponent,
      ListStationComponent,
      EditConstructionComponent
     ],
  imports: [
    CommonModule,
    StationManagementRoutingModule,
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
    CustomDropzoneModule,
    NgxDropzoneModule,
    NgbModule,
    TreeModule,
    MatDialogModule,
    CdkTableModule,
    CdkTreeModule
  ],
})
export class StationManagementModule {}
