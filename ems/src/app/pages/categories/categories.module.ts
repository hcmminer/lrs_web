import { UpdateAlarmColorModalComponent } from './color-management/update-alarm-color-modal/update-alarm-color-modal.component';
import { ColorManagementComponent } from './color-management/color-management.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbDateParserFormatter, NgbDatepickerModule, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {InlineSVGModule} from 'ng-inline-svg';
import {CRUDTableModule} from '../../_metronic/shared/crud-table';
import {TranslateModule} from '@ngx-translate/core';
import {MatIconModule} from '@angular/material/icon';
import {NgbDateCustomParserFormatter} from '../../_metronic/core/utils/ngb-date-custom-parser-formatter';
import {CategoriesComponent} from './categories.component';
import {CategoriesRoutingModule} from './categories-routing.module';
import {ErrorTypeCategoryComponent} from './error-type-category/error-type-category.component';
import {EditErrorTypeCategoryModalComponent} from './error-type-category/edit-error-type-category-modal/edit-error-type-category-modal.component';
import {DeleteErrorTypeCategoryModalComponent} from './error-type-category/delete-error-type-category-modal/delete-error-type-category-modal.component';
import {SystemCategoryComponent} from './system-category/system-category.component';
import {EditSystemCategoryModalComponent} from './system-category/edit-system-category-modal/edit-system-category-modal.component';
import {DeleteSystemCategoryModalComponent} from './system-category/delete-system-category-modal/delete-system-category-modal.component';
import {SystemManagementComponent} from './system-management/system-management.component';
import {EditSystemManagementModalComponent} from './system-management/edit-system-management-modal/edit-system-management-modal.component';
import {DeleteSystemManagementModalComponent} from './system-management/delete-system-management-modal/delete-system-management-modal.component';
import { ActionCategoryComponent } from './action-category/action-category.component';
import { EditActionCategoryModalComponent } from './action-category/edit-action-category-modal/edit-action-category-modal.component';
import { DeleteActionCategoryModalComponent } from './action-category/delete-action-category-modal/delete-action-category-modal.component';
import { ActionManagementComponent } from './action-management/action-management.component';
import { DeleteActionManagementModalComponent } from './action-management/delete-action-management-modal/delete-action-management-modal.component';
import {EditActionManagementModalComponent} from './action-management/edit-action-management-modal/edit-action-management-modal.component';
import { ServiceManagementComponent } from './service-management/service-management.component';
import { EditServiceManagementModalComponent } from './service-management/edit-service-management-modal/edit-service-management-modal.component';
import { DeleteServiceManagementModalComponent } from './service-management/delete-service-management-modal/delete-service-management-modal.component';
import { ServiceMapManagementComponent } from './service-map-management/service-map-management.component';
import { EditServiceMapManagementModalComponent } from './service-map-management/edit-service-map-management-modal/edit-service-map-management-modal.component';
import { DeleteServiceMapManagementModalComponent } from './service-map-management/delete-service-map-management-modal/delete-service-map-management-modal.component';
import { AlarmSeverityComponent } from './alarm-severity/alarm-severity.component';
import { EditAlarmSeverityModalComponent } from './alarm-severity/edit-alarm-severity-modal/edit-alarm-severity-modal.component';
import { DeleteAlarmSeverityModalComponent } from './alarm-severity/delete-alarm-severity-modal/delete-alarm-severity-modal.component';
import { AlarmDictionaryComponent } from './alarm-dictionary/alarm-dictionary.component';
import { EditAlarmDictionaryModalComponent } from './alarm-dictionary/edit-alarm-dictionary-modal/edit-alarm-dictionary-modal.component';
import { DeleteAlarmDictionaryModalComponent } from './alarm-dictionary/delete-alarm-dictionary-modal/delete-alarm-dictionary-modal.component';
import { ColorPickerAllModule } from '@syncfusion/ej2-angular-inputs';
import { LogicMapComponent } from './logic-map/logic-map.component';
import {ChooseFileAudioModalComponent} from './audio-management/choose-file-audio-modal/choose-file-audio-modal.component';
import {AudioManagementComponent} from './audio-management/audio-management.component';
import {UpdateAlarmAudioModalComponent} from './audio-management/update-alarm-audio-modal/update-alarm-audio-modal.component';
import { DetailLogicMapComponent } from './logic-map/detail-logic-map/detail-logic-map.component';
import {LayoutModule} from '../layout.module';
import {ConfirmCloseModalComponent} from './confirm-close-modal/confirm-close-modal.component';

@NgModule({
  declarations: [
    CategoriesComponent,
    ErrorTypeCategoryComponent,
    EditErrorTypeCategoryModalComponent,
    DeleteErrorTypeCategoryModalComponent,
    SystemCategoryComponent,
    EditSystemCategoryModalComponent,
    DeleteSystemCategoryModalComponent,
    SystemManagementComponent,
    EditSystemManagementModalComponent,
    DeleteSystemManagementModalComponent,
    ActionCategoryComponent,
    EditActionCategoryModalComponent,
    DeleteActionCategoryModalComponent,
    ActionManagementComponent,
    DeleteActionManagementModalComponent,
    EditActionManagementModalComponent,
    ServiceManagementComponent,
    EditServiceManagementModalComponent,
    DeleteServiceManagementModalComponent,
    ServiceMapManagementComponent,
    EditServiceMapManagementModalComponent,
    DeleteServiceMapManagementModalComponent,
    AlarmSeverityComponent,
    EditAlarmSeverityModalComponent,
    DeleteAlarmSeverityModalComponent,
    AlarmDictionaryComponent,
    EditAlarmDictionaryModalComponent,
    DeleteAlarmDictionaryModalComponent,
    ColorManagementComponent,
    UpdateAlarmColorModalComponent,
    LogicMapComponent,
    UpdateAlarmColorModalComponent,
    AudioManagementComponent,
    UpdateAlarmAudioModalComponent,
    ChooseFileAudioModalComponent,
    DetailLogicMapComponent,
    ConfirmCloseModalComponent
  ],
  imports: [
    LayoutModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InlineSVGModule,
    CRUDTableModule,
    NgbModalModule,
    NgbDatepickerModule,
    TranslateModule,
    MatIconModule,
    CategoriesRoutingModule,
    ColorPickerAllModule
  ],
  entryComponents: [
    EditErrorTypeCategoryModalComponent,
    DeleteErrorTypeCategoryModalComponent,
    EditSystemCategoryModalComponent,
    DeleteSystemCategoryModalComponent,
    EditSystemManagementModalComponent,
    DeleteSystemManagementModalComponent,
    EditActionCategoryModalComponent,
    DeleteActionCategoryModalComponent,
    DeleteActionManagementModalComponent,
    EditActionManagementModalComponent,
    EditServiceManagementModalComponent,
    DeleteServiceManagementModalComponent,
    EditServiceMapManagementModalComponent,
    DeleteServiceMapManagementModalComponent,
    EditAlarmSeverityModalComponent,
    DeleteAlarmSeverityModalComponent,
    EditAlarmDictionaryModalComponent,
    DeleteAlarmDictionaryModalComponent,
    ConfirmCloseModalComponent
  ],
  providers: [
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter}
  ]
})

export class CategoriesModule {
}
