import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {StationManagementComponent} from './station-management.component';
import {StationDetailComponent} from './station-detail/station-detail.component';
import {ListStationComponent} from './list-station/list-station.component';
import {EditConstructionComponent} from './edit-construction/edit-construction.component';
import {InitConstructionComponent} from './init-construction/init-construction.component';

const routes: Routes = [
  {
    path: '',
    component: StationManagementComponent,
    children: [
      { path: 'station-detail/:id', component: StationDetailComponent},
      { path: 'list-station', component: ListStationComponent},
      { path: 'edit-station/:id', component: EditConstructionComponent},
      { path: 'init-station', component: InitConstructionComponent},
      { path: '', redirectTo: 'list-station', pathMatch: 'full' },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationManagementRoutingModule {}
