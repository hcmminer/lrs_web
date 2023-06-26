import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ProjectDetailComponent} from './project-detail/project-detail.component';
import {ProjectSupervisionComponent} from './project-supervision.component';
import {ProjectListComponent} from './project-list/project-list.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectSupervisionComponent,
    children: [
      { path: 'project-detail/:id', component: ProjectDetailComponent},
      { path: 'project-list', component: ProjectListComponent},
      { path: '', redirectTo: 'project-list', pathMatch: 'full' },
      { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectSupervisionRoutingModule {}
