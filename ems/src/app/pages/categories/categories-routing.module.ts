import { AudioManagementComponent } from './audio-management/audio-management.component';
import { ColorManagementComponent } from './color-management/color-management.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CategoriesComponent} from './categories.component';
import {ErrorTypeCategoryComponent} from './error-type-category/error-type-category.component';
import {SystemCategoryComponent} from './system-category/system-category.component';
import {SystemManagementComponent} from './system-management/system-management.component';
import {ActionCategoryComponent} from './action-category/action-category.component';
import {ActionManagementComponent} from './action-management/action-management.component';
import {ServiceManagementComponent} from './service-management/service-management.component';
import {ServiceMapManagementComponent} from './service-map-management/service-map-management.component';
import {AlarmSeverityComponent} from './alarm-severity/alarm-severity.component';
import {AlarmDictionaryComponent} from './alarm-dictionary/alarm-dictionary.component';
import {LogicMapComponent} from './logic-map/logic-map.component';

const routes: Routes = [
  {
    path: '',
    component: CategoriesComponent,
    children: [
      {
        path: 'error-type',
        component: ErrorTypeCategoryComponent
      },
      {
        path: 'system-category',
        component: SystemCategoryComponent
      },
      {
        path: 'system',
        component: SystemManagementComponent
      },
      {
        path: 'action-category',
        component: ActionCategoryComponent
      },
      {
        path: 'action',
        component: ActionManagementComponent
      },
      {
        path: 'service',
        component: ServiceManagementComponent
      },
      {
        path: 'service-map',
        component: ServiceMapManagementComponent
      },
      {
        path: 'alarm-severity',
        component: AlarmSeverityComponent
      },
      {
        path: 'alarm-dictionary',
        component: AlarmDictionaryComponent
      },
      {
        path: 'color-management',
        component: ColorManagementComponent
      },
      {
        path: 'audio-management',
        component: AudioManagementComponent
      },
      {
        path: 'logic-map',
        component: LogicMapComponent
      },
      { path: '', redirectTo: 'alarm-severity', pathMatch: 'full' },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoriesRoutingModule {}
