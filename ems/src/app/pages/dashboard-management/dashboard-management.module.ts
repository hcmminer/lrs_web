import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InlineSVGModule} from 'ng-inline-svg';
import {CRUDTableModule} from '../../_metronic/shared/crud-table';
import {NgbDateParserFormatter, NgbDatepickerModule, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {MatIconModule} from '@angular/material/icon';
import {NgbDateCustomParserFormatter} from '../../_metronic/core/utils/ngb-date-custom-parser-formatter';
import {DashboardManagementComponent} from './dashboard-management.component';
import {DashboardManagementRoutingModule} from './dashboard-management-routing.module';
import { DashboardDetailOnlineComponent } from './dashboard-detail-online/dashboard-detail-online.component';
import { DashboardOnlineComponent } from './dashboard-online/dashboard-online.component';
import {AlarmViewerComponent} from './alarm-viewer/alarm-viewer.component';
import { AlarmGroupComponent } from './alarm-group/alarm-group.component';
import {LayoutModule} from '../layout.module';

@NgModule({
  declarations: [
    DashboardManagementComponent,
    DashboardDetailOnlineComponent,
    DashboardOnlineComponent,
    AlarmViewerComponent,
    AlarmGroupComponent
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
    DashboardManagementRoutingModule,
    LayoutModule
  ],
  entryComponents: [],
  providers: [
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter}
  ]
})
export class DashboardManagementModule {
}
