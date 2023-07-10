import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {BtsManagementComponent} from './bts-management.component';
import { InitBtsComponent } from './init-bts/init-bts.component';
import {ListBtsComponent} from './list-bts/list-bts.component';
import {StationRentalContractBtsComponent} from "./station-rental-contract-bts/station-rental-contract-bts.component";
import {ContractManagementComponent} from "./saerch-contract/contract-management.component";

const routes: Routes = [
  {
    path: '',
    component: BtsManagementComponent,
    children: [
      { path: 'init-bts', component: InitBtsComponent},
      { path: 'list-bts', component: ListBtsComponent},
      { path: 'station-rental-contract-bts', component: StationRentalContractBtsComponent},
      { path: 'contract-management-bts', component: ContractManagementComponent},
      { path: '', redirectTo: 'list-bts', pathMatch: 'full' },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BtsManagementRoutingModule {}
